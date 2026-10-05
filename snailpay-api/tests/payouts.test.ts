import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, bearer, payout } from './helpers.js'

const post = (body: unknown, auth = bearer()) =>
  request(app).post('/payouts').set('Authorization', auth).send(body as object)

describe('POST /payouts · retiro aprobado', () => {
  it('aprueba y devuelve un comprobante completo', async () => {
    const { status, body } = await post(payout())

    expect(status).toBe(201)
    expect(body).toMatchObject({
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 500,
      currency_id: 'MXN',
    })
    expect(body.id).toMatch(/^pyo_[0-9a-f]{10}$/)
  })

  it('devuelve clave de rastreo en vez de código de autorización', async () => {
    const { body } = await post(payout())

    // Un retiro por SPEI no lo autoriza un banco emisor: se envía y se rastrea.
    expect(body.authorization_code).toBeUndefined()
    expect(body.tracking_key).toMatch(/^SNP\d{8}[A-Z0-9]{6}$/)
  })

  it('identifica el banco por los primeros tres dígitos', async () => {
    const { body } = await post(payout())

    expect(body.account).toEqual({
      bank_code: '012',
      bank_name: 'BBVA México',
      last_four_digits: '1001',
    })
  })

  it('un banco fuera del catálogo sigue siendo válido', async () => {
    // Lo que valida una CLABE es su dígito verificador, no estar en una lista.
    const { status, body } = await post(payout({ clabe: '999180000000007005' }))

    expect(status).toBe(201)
    expect(body.account.bank_name).toBe('Otro banco')
  })
})

describe('POST /payouts · lo que sale y lo que no', () => {
  it('nunca devuelve la CLABE completa ni el titular', async () => {
    const { text } = await post(payout())

    expect(text).not.toContain('012180000000001001')
    // El número de cuenta de once dígitos que va en medio tampoco.
    expect(text).not.toContain('00000000100')
    expect(text).not.toContain('DONOVAN')
  })

  it('no hace eco de la CLABE en un error de validación', async () => {
    const { status, text } = await post(payout({ clabe: '012180000000001002' }))

    expect(status).toBe(400)
    expect(text).not.toContain('01218000000000100')
  })
})

describe('POST /payouts · escenarios de rechazo', () => {
  const casos = [
    ['072180000000002008', 'payout_rejected_account_not_found'],
    ['002180000000004005', 'payout_rejected_bank_unavailable'],
    ['127180000000005002', 'payout_rejected_name_mismatch'],
    ['646180000000006003', 'payout_rejected_limit_exceeded'],
  ] as const

  it.each(casos)('la CLABE %s responde rechazado con %s', async (clabe, detalle) => {
    const { status, body } = await post(payout({ clabe }))

    expect(status).toBe(201)
    expect(body.status).toBe('rejected')
    expect(body.status_detail).toBe(detalle)
  })

  it('un rechazo no trae clave de rastreo', async () => {
    const { body } = await post(payout({ clabe: '072180000000002008' }))

    // Si no se envió nada, no hay nada que rastrear.
    expect(body.tracking_key).toBeNull()
  })

  it('un rechazo conserva el resto del comprobante', async () => {
    const { body } = await post(payout({ clabe: '072180000000002008' }))

    for (const campo of ['id', 'transaction_amount', 'currency_id', 'date_created', 'reference', 'payee_id', 'payee_email', 'account']) {
      expect(body[campo], campo).toBeDefined()
    }
  })

  it('enmascara que la cuenta está bloqueada', async () => {
    const { body, text } = await post(payout({ clabe: '014180000000003007' }))

    // Que una cuenta esté bloqueada dice algo sobre la situación de su titular.
    expect(body.status_detail).toBe('payout_rejected_other_reason')
    expect(text).not.toContain('account_blocked')
  })

  it('una CLABE válida fuera de la tabla aprueba', async () => {
    // Solo las seis documentadas disparan un escenario; el resto se cobra.
    const { body } = await post(payout({ clabe: '012180000000099990' }))

    expect(body.status).toBe('approved')
  })
})

describe('POST /payouts · valores inválidos', () => {
  const rechazados = [
    ['dígito verificador incorrecto', payout({ clabe: '012180000000001002' })],
    ['CLABE de 17 dígitos', payout({ clabe: '01218000000000100' })],
    ['CLABE con letras', payout({ clabe: '01218000000000100X' })],
    ['monto por debajo del mínimo', payout({ transaction_amount: 10 })],
    ['monto por encima del tope', payout({ transaction_amount: 20_000 })],
    ['monto negativo', payout({ transaction_amount: -500 })],
    ['monto con tres decimales', payout({ transaction_amount: 500.555 })],
    ['moneda distinta de MXN', payout({ currency_id: 'USD' })],
    ['referencia vacía', payout({ reference: '' })],
    ['correo mal formado', payout({ payee_email: 'no-es-un-correo' })],
    ['titular con dígitos', payout({ account: { account_holder: 'Donovan 123' } })],
    ['sin cuerpo', undefined],
  ] as const

  it.each(rechazados)('rechaza con 400: %s', async (_caso, body) => {
    expect((await post(body)).status).toBe(400)
  })

  it('acepta la CLABE con espacios, como la escribe una persona', async () => {
    expect((await post(payout({ clabe: '012 180 00000000100 1' }))).status).toBe(201)
  })
})

describe('POST /payouts · autenticación', () => {
  it('sin cabecera responde 401', async () => {
    const { status } = await request(app).post('/payouts').send(payout())
    expect(status).toBe(401)
  })

  it('con un token mal formado, 401', async () => {
    expect((await post(payout(), 'Bearer abc')).status).toBe(401)
  })
})
