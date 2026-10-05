// Catálogo de escenarios de retiro.
//
// El disparador es la CLABE, no el titular: en el formulario del front ese
// campo es de solo lectura —la cuenta debe estar a nombre del usuario—, así que
// el equivalente al "nombre de tarjeta de prueba" aquí es el número de cuenta.
//
// IMPORTANTE: a diferencia del catálogo cc_rejected_* de los cobros, que es el
// real de Mercado Pago, estos códigos son nuestros. No existe un vocabulario
// público equivalente para dispersiones, así que seguimos el mismo patrón.

export type PayoutRejectedDetail =
  | 'payout_rejected_account_not_found'
  | 'payout_rejected_bank_unavailable'
  | 'payout_rejected_name_mismatch'
  | 'payout_rejected_limit_exceeded'
  | 'payout_rejected_other_reason'

export type PayoutOutcome =
  | { status: 'approved'; publicDetail: 'accredited'; loggedReason: string }
  | { status: 'rejected'; publicDetail: PayoutRejectedDetail; loggedReason: string }

const APPROVED: PayoutOutcome = {
  status: 'approved',
  publicDetail: 'accredited',
  loggedReason: 'accredited',
}

const reject = (detail: PayoutRejectedDetail): PayoutOutcome => ({
  status: 'rejected',
  publicDetail: detail,
  loggedReason: detail,
})

const TRIGGERS: Record<string, PayoutOutcome> = {
  '072180000000002008': reject('payout_rejected_account_not_found'),
  '002180000000004005': reject('payout_rejected_bank_unavailable'),
  '127180000000005002': reject('payout_rejected_name_mismatch'),
  '646180000000006003': reject('payout_rejected_limit_exceeded'),

  // Enmascarado, como cc_rejected_high_risk en los cobros: que una cuenta esté
  // bloqueada dice algo sobre la situación de su titular, y eso no se anuncia.
  // Hacia fuera es un rechazo sin motivo; en el log consta la causa.
  '014180000000003007': {
    status: 'rejected',
    publicDetail: 'payout_rejected_other_reason',
    loggedReason: 'payout_rejected_account_blocked',
  },
}

// Cualquier CLABE válida que no esté en la tabla se aprueba.
export function resolveOutcome(clabe: string): PayoutOutcome {
  return TRIGGERS[clabe] ?? APPROVED
}
