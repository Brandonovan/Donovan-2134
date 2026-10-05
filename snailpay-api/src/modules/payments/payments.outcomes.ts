// Catálogo de escenarios del mock.
//
// El resultado de un cobro lo decide el NOMBRE DEL TITULAR, siguiendo la
// convención de tarjetas de prueba de Mercado Pago. Es el campo adecuado para
// esto porque el emisor no lo verifica: en una transacción sin tarjeta presente
// se validan número, vencimiento y CVV, pero el nombre viaja sin que nadie lo
// contraste.
//
// APRO, OTHE, CALL, FUND, SECU, EXPI y FORM son los disparadores reales de
// Mercado Pago. HIGH, DUPL y MAXA los añadimos aquí siguiendo el mismo patrón.

export type RejectedDetail =
  | 'cc_rejected_insufficient_amount'
  | 'cc_rejected_bad_filled_security_code'
  | 'cc_rejected_bad_filled_date'
  | 'cc_rejected_bad_filled_other'
  | 'cc_rejected_call_for_authorize'
  | 'cc_rejected_duplicated_payment'
  | 'cc_rejected_max_attempts'
  | 'cc_rejected_other_reason'

// Dos vocabularios: `publicDetail` es lo que sale en la respuesta, `loggedReason`
// lo que se registra en el servidor. Casi siempre coinciden — la industria es
// específica, porque un motivo claro ayuda al usuario honesto a corregir y lo
// que el atacante gana ahí lo frena el límite de intentos, no el silencio.
//
// La excepción es el fraude. Stripe instruye explícitamente a devolver
// `lost_card` y `stolen_card` como rechazo genérico para no avisar a quien
// pueda ser el defraudador, y aquí se hace lo mismo con `cc_rejected_high_risk`.
export type Outcome =
  | { status: 'approved'; publicDetail: 'accredited'; loggedReason: string }
  | { status: 'rejected'; publicDetail: RejectedDetail; loggedReason: string }

const APPROVED: Outcome = {
  status: 'approved',
  publicDetail: 'accredited',
  loggedReason: 'accredited',
}

// El motivo que se dice coincide con el que se registra.
const reject = (detail: RejectedDetail): Outcome => ({
  status: 'rejected',
  publicDetail: detail,
  loggedReason: detail,
})

const TRIGGERS: Record<string, Outcome> = {
  APRO: APPROVED,
  FUND: reject('cc_rejected_insufficient_amount'),
  SECU: reject('cc_rejected_bad_filled_security_code'),
  EXPI: reject('cc_rejected_bad_filled_date'),
  FORM: reject('cc_rejected_bad_filled_other'),
  CALL: reject('cc_rejected_call_for_authorize'),
  DUPL: reject('cc_rejected_duplicated_payment'),
  MAXA: reject('cc_rejected_max_attempts'),
  OTHE: reject('cc_rejected_other_reason'),

  // El único enmascarado: hacia fuera es un rechazo sin motivo, en el log consta
  // que lo detuvo el antifraude.
  HIGH: {
    status: 'rejected',
    publicDetail: 'cc_rejected_other_reason',
    loggedReason: 'cc_rejected_high_risk',
  },
}

// Coincide la PRIMERA PALABRA exacta: "FUND" y "FUND LOPEZ" disparan,
// "FUNDACION" no. Un nombre que no esté en la tabla aprueba.
export function resolveOutcome(cardholderName: string): Outcome {
  const [firstWord = ''] = cardholderName.trim().toUpperCase().split(/\s+/)
  return TRIGGERS[firstWord] ?? APPROVED
}
