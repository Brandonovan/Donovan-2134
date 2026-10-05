import { createHash, randomBytes } from 'node:crypto'
import { detectBrand, firstSix, lastFour } from '../../shared/card.js'
import { toAmount, toCents } from '../../shared/money.js'
import { resolveOutcome } from './payments.outcomes.js'
import type { Payment, PaymentRequest } from './payments.schema.js'

// Simulación de pasarela de pagos.
//
// Este servicio hace de PASARELA, no de comercio: por eso recibe el número de
// tarjeta completo. Un backend de comercio recibiría un token y nunca vería el
// PAN (ver README).
//
// De la tarjeta solo sale su forma enmascarada: BIN, últimos cuatro y
// vencimiento, igual que devuelven Mercado Pago y Stripe. PCI permite mostrar
// los primeros seis y los últimos cuatro, y con el tramo de en medio oculto no
// se puede reconstruir el número ni cobrar con él.
//
// El código de seguridad no sale jamás, bajo ninguna forma. Y nada de esto se
// guarda ni se registra en un log.
//
// LIMITACIÓN CONOCIDA: sin almacenamiento no hay idempotencia. Dos peticiones
// con la misma `reference` producen dos pagos distintos, así que un reintento
// por timeout cobraría dos veces. Una pasarela real deduplica por esa clave.

// Sin caracteres que se confundan al dictarlos por teléfono (0/O, 1/I).
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function paymentId(): string {
  return `pay_${randomBytes(5).toString('hex')}`
}

// Lo devuelve el banco emisor al aprobar, no la pasarela. Es el código que el
// titular cita cuando reclama a su banco, de ahí que sean seis caracteres.
function authorizationCode(): string {
  return Array.from(randomBytes(6), (byte) =>
    CODE_ALPHABET.charAt(byte % CODE_ALPHABET.length),
  ).join('')
}

// Derivado del correo, no almacenado: el mismo pagador obtiene siempre el mismo
// id sin que este servicio tenga que recordar nada.
//
// No es anonimización: un correo tiene poca entropía y su hash se revierte por
// fuerza bruta. Da igual, porque un payer_id no es un secreto.
function payerId(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 16)
}

export function createPayment(request: PaymentRequest): Payment {
  // Aquí es donde una pasarela real pediría autorización al banco emisor. En su
  // lugar, el resultado lo decide el nombre del titular (ver payments.outcomes).
  const outcome = resolveOutcome(request.card.cardholder_name)

  const id = paymentId()
  const amounts = {
    // El monto pasa por centavos para que la respuesta nunca devuelva algo
    // como 500.00000000001 aunque la petición lo traiga.
    transaction_amount: toAmount(toCents(request.transaction_amount)),
    currency_id: request.currency_id,
    date_created: new Date().toISOString(),
  }
  const payer = {
    reference: request.reference,
    payer_id: payerId(request.payer_email),
    payer_email: request.payer_email,
    payment_method_id: detectBrand(request.card.number) ?? 'unknown',
    card: {
      first_six_digits: firstSix(request.card.number),
      last_four_digits: lastFour(request.card.number),
      expiration_month: request.card.expiration_month,
      expiration_year: request.card.expiration_year,
    },
  }

  if (outcome.status === 'rejected') {
    // El motivo real queda aquí y no viaja en la respuesta. Solo el id del pago
    // y la causa: nada de tarjeta, CVV ni correo. Quien atienda soporte puede
    // buscar por ese id lo que el usuario no llega a ver.
    console.log(`[${id}] rejected: ${outcome.loggedReason}`)

    return {
      id,
      status: 'rejected',
      status_detail: outcome.publicDetail,
      ...amounts,
      // Sin aprobación no hay código: no existe nada que el banco haya emitido.
      authorization_code: null,
      ...payer,
    }
  }

  return {
    id,
    status: 'approved',
    status_detail: 'accredited',
    ...amounts,
    authorization_code: authorizationCode(),
    ...payer,
  }
}
