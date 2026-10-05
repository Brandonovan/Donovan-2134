import { createHash, randomBytes } from 'node:crypto'
import { bankCode, bankName, lastFour } from '../../shared/clabe.js'
import { toAmount, toCents } from '../../shared/money.js'
import { resolveOutcome } from './payouts.outcomes.js'
import type { Payout, PayoutRequest } from './payouts.schema.js'

// Simulación de dispersión por SPEI.
//
// A diferencia de un cobro, aquí no hay banco emisor que autorice: el dinero se
// envía y se rastrea. Por eso no existe `authorization_code` y sí una clave de
// rastreo, que es lo que cita el cliente cuando reclama que no le llegó.
//
// De la cuenta solo sale su forma enmascarada: banco y últimos cuatro. El
// número de cuenta que va en medio no sale nunca, ni se guarda, ni se registra.

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function payoutId(): string {
  return `pyo_${randomBytes(5).toString('hex')}`
}

// Clave de rastreo al estilo SPEI: identificador del emisor, fecha y un tramo
// aleatorio. Es lo que permite seguir una transferencia entre instituciones.
function trackingKey(now: Date): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Array.from(randomBytes(6), (byte) =>
    CODE_ALPHABET.charAt(byte % CODE_ALPHABET.length),
  ).join('')
  return `SNP${date}${suffix}`
}

function payeeId(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 16)
}

export function createPayout(request: PayoutRequest): Payout {
  const outcome = resolveOutcome(request.account.clabe)

  const id = payoutId()
  const now = new Date()
  const amounts = {
    transaction_amount: toAmount(toCents(request.transaction_amount)),
    currency_id: request.currency_id,
    date_created: now.toISOString(),
  }
  const code = bankCode(request.account.clabe)
  const payee = {
    reference: request.reference,
    payee_id: payeeId(request.payee_email),
    payee_email: request.payee_email,
    account: {
      bank_code: code,
      bank_name: bankName(code),
      last_four_digits: lastFour(request.account.clabe),
    },
  }

  if (outcome.status === 'rejected') {
    // El motivo real queda aquí: solo el id del retiro y la causa, nunca la
    // CLABE ni el titular.
    console.log(`[${id}] rejected: ${outcome.loggedReason}`)

    return {
      id,
      status: 'rejected',
      status_detail: outcome.publicDetail,
      ...amounts,
      tracking_key: null,
      ...payee,
    }
  }

  return {
    id,
    status: 'approved',
    status_detail: 'accredited',
    ...amounts,
    tracking_key: trackingKey(now),
    ...payee,
  }
}
