import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, bearer, payment } from './helpers.js'

// Todos los valores de la respuesta, en texto plano. Comparar por igualdad
// evita el falso positivo de buscar tres dígitos dentro de un id hexadecimal.
function hojas(value: unknown): string[] {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.flatMap(hojas)
  if (typeof value === 'object') return Object.values(value).flatMap(hojas)
  return [String(value)]
}

const post = (body: unknown, auth = bearer()) =>
  request(app).post('/payments').set('Authorization', auth).send(body as object)

describe('POST /payments · cobro aprobado', () => {
  it('aprueba y devuelve un comprobante completo', async () => {
    const { status, body } = await post(payment())

    expect(status).toBe(201)
    expect(body).toMatchObject({
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 500,
      currency_id: 'MXN',
      payment_method_id: 'visa',
    })
    expect(body.id).toMatch(/^pay_[0-9a-f]{10}$/)
    expect(body.authorization_code).toMatch(/^[A-Z0-9]{6}$/)
    expect(Date.parse(body.date_created)).not.toBeNaN()
  })

  it('normaliza el correo y deriva el mismo payer_id para el mismo pagador', async () => {
    const uno = await post(payment({ payer_email: '  Donovan@Ejemplo.com  ' }))
    const dos = await post(payment({ payer_email: 'donovan@ejemplo.com' }))

    expect(uno.body.payer_email).toBe('donovan@ejemplo.com')
    expect(uno.body.payer_id).toBe(dos.body.payer_id)
  })

  it('devuelve la referencia del comercio tal cual, para poder conciliar', async () => {
    const body = payment()
    const { body: pago } = await post(body)

    expect(pago.reference).toBe(body.reference)
  })
})

describe('POST /payments · lo que sale y lo que no', () => {
  it('devuelve la tarjeta enmascarada', async () => {
    const { body } = await post(payment())

    expect(body.card).toEqual({
      first_six_digits: '424242',
      last_four_digits: '4242',
      expiration_month: 12,
      expiration_year: 2028,
    })
  })

  it('nunca devuelve el número completo ni el código de seguridad', async () => {
    const { body, text } = await post(payment({ card: { security_code: '987' } }))

    // El número completo son 16 dígitos: buscarlo en el texto es seguro, no
    // puede aparecer por casualidad. El CVV son tres, y el id es hexadecimal
    // aleatorio, así que ahí se comprueba valor por valor.
    expect(text).not.toContain('4242424242424242')
    expect(hojas(body)).not.toContain('987')

    // La tarjeta devuelve exactamente estos campos y ninguno más.
    expect(Object.keys(body.card).sort()).toEqual([
      'expiration_month',
      'expiration_year',
      'first_six_digits',
      'last_four_digits',
    ])

    // Con el BIN y los últimos cuatro visibles, el tramo de en medio sigue oculto.
    expect(text).not.toMatch(/4242\d{6}4242/)
  })

  it('tampoco los hace eco en un error de validación', async () => {
    const { status, body, text } = await post(payment({ card: { number: '4242424242424241' } }))

    expect(status).toBe(400)
    expect(text).not.toContain('424242424242424')
    expect(hojas(body)).not.toContain('123')
  })
})

describe('POST /payments · escenarios de rechazo', () => {
  const casos = [
    ['FUND', 'cc_rejected_insufficient_amount'],
    ['SECU', 'cc_rejected_bad_filled_security_code'],
    ['EXPI', 'cc_rejected_bad_filled_date'],
    ['FORM', 'cc_rejected_bad_filled_other'],
    ['CALL', 'cc_rejected_call_for_authorize'],
    ['DUPL', 'cc_rejected_duplicated_payment'],
    ['MAXA', 'cc_rejected_max_attempts'],
    ['OTHE', 'cc_rejected_other_reason'],
  ] as const

  it.each(casos)('%s responde 201 rechazado con %s', async (titular, detalle) => {
    const { status, body } = await post(payment({ cardholder_name: titular }))

    // 201 y no 4xx: un rechazo sigue siendo un pago, con id y fecha, y por eso
    // se puede consultar y conciliar.
    expect(status).toBe(201)
    expect(body.status).toBe('rejected')
    expect(body.status_detail).toBe(detalle)
  })

  it('un rechazo no trae código de autorización', async () => {
    const { body } = await post(payment({ cardholder_name: 'FUND' }))

    // Lo emite el banco al aprobar: si no aprobó, no existe.
    expect(body.authorization_code).toBeNull()
  })

  it('un rechazo conserva el resto del comprobante', async () => {
    const { body } = await post(payment({ cardholder_name: 'FUND' }))

    for (const campo of ['id', 'transaction_amount', 'currency_id', 'date_created', 'reference', 'payer_id', 'payer_email', 'card']) {
      expect(body[campo], campo).toBeDefined()
    }
  })

  it('enmascara el motivo del antifraude', async () => {
    const { body, text } = await post(payment({ cardholder_name: 'HIGH' }))

    // Hacia fuera, un rechazo sin motivo: explicarle al defraudador qué lo
    // delató es regalarle el mapa. El motivo real queda en el log.
    expect(body.status_detail).toBe('cc_rejected_other_reason')
    expect(text).not.toContain('high_risk')
  })
})

describe('POST /payments · cómo se reconoce el disparador', () => {
  it('coincide la primera palabra, no el prefijo', async () => {
    const { body } = await post(payment({ cardholder_name: 'FUNDACION LOPEZ' }))

    expect(body.status).toBe('approved')
  })

  it('dispara con el resto del nombre detrás', async () => {
    const { body } = await post(payment({ cardholder_name: 'FUND LOPEZ' }))

    expect(body.status_detail).toBe('cc_rejected_insufficient_amount')
  })

  it('no distingue mayúsculas', async () => {
    const { body } = await post(payment({ cardholder_name: 'fund lopez' }))

    expect(body.status_detail).toBe('cc_rejected_insufficient_amount')
  })

  it('un nombre cualquiera aprueba', async () => {
    const { body } = await post(payment({ cardholder_name: 'Donovan Rodriguez' }))

    expect(body.status).toBe('approved')
  })
})

describe('POST /payments · valores inválidos', () => {
  const rechazados = [
    ['monto por debajo del mínimo', payment({ transaction_amount: 10 })],
    ['monto por encima del tope', payment({ transaction_amount: 20_000 })],
    ['monto negativo', payment({ transaction_amount: -500 })],
    ['monto en cero', payment({ transaction_amount: 0 })],
    ['monto con tres decimales', payment({ transaction_amount: 500.555 })],
    ['monto que no es número', payment({ transaction_amount: 'quinientos' })],
    ['moneda distinta de MXN', payment({ currency_id: 'USD' })],
    ['referencia vacía', payment({ reference: '' })],
    ['correo mal formado', payment({ payer_email: 'no-es-un-correo' })],
    ['número que no pasa Luhn', payment({ card: { number: '4242424242424241' } })],
    ['marca no reconocida', payment({ card: { number: '9999999999999995' } })],
    ['tarjeta vencida', payment({ card: { expiration_month: 1, expiration_year: 2020 } })],
    ['mes 13', payment({ card: { expiration_month: 13 } })],
    ['titular con dígitos', payment({ card: { cardholder_name: 'Donovan 123' } })],
    ['sin cuerpo', undefined],
  ] as const

  it.each(rechazados)('rechaza con 400: %s', async (_caso, body) => {
    expect((await post(body)).status).toBe(400)
  })

  it('acepta el monto justo en el tope', async () => {
    expect((await post(payment({ transaction_amount: 10_000 }))).status).toBe(201)
  })

  it('acepta el monto justo en el mínimo', async () => {
    expect((await post(payment({ transaction_amount: 50 }))).status).toBe(201)
  })
})

describe('POST /payments · la longitud del CVV depende de la marca', () => {
  const AMEX = '378282246310005'

  it('Amex con cuatro dígitos pasa', async () => {
    const body = payment({ card: { number: AMEX, security_code: '1234' } })
    expect((await post(body)).status).toBe(201)
  })

  it('Amex con tres dígitos no', async () => {
    const body = payment({ card: { number: AMEX, security_code: '123' } })
    expect((await post(body)).status).toBe(400)
  })

  it('Visa con cuatro dígitos tampoco', async () => {
    expect((await post(payment({ card: { security_code: '1234' } }))).status).toBe(400)
  })

  it('Mastercard con tres dígitos pasa', async () => {
    const body = payment({ card: { number: '5555555555554444' } })
    expect((await post(body)).status).toBe(201)
  })
})

describe('POST /payments · autenticación', () => {
  it('sin cabecera responde 401', async () => {
    const { status } = await request(app).post('/payments').send(payment())
    expect(status).toBe(401)
  })

  it('con un token que no tiene la forma esperada, 401', async () => {
    expect((await post(payment(), 'Bearer abc')).status).toBe(401)
  })

  it('sin el prefijo Bearer, 401', async () => {
    expect((await post(payment(), 'a'.repeat(64))).status).toBe(401)
  })
})
