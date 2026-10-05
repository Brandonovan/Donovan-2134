// Traducción de los códigos de la pasarela a texto para el usuario.
//
// Vive del lado del comercio a propósito: la pasarela devuelve códigos estables
// y cada comercio decide qué contar. Mercado Pago hace lo mismo — reparte esta
// tabla en sus plugins de tienda, no en la API.
//
// El criterio: específico donde ayuda a corregir una errata, vago donde la
// precisión solo le serviría a quien esté probando tarjetas robadas.
const MESSAGES: Record<string, string> = {
  // Cobros
  cc_rejected_insufficient_amount: 'Tu tarjeta no tiene saldo suficiente.',
  cc_rejected_bad_filled_security_code: 'Revisa el código de seguridad de tu tarjeta.',
  cc_rejected_bad_filled_date: 'Revisa la fecha de vencimiento de tu tarjeta.',
  cc_rejected_bad_filled_other: 'Revisa los datos de tu tarjeta.',
  cc_rejected_call_for_authorize: 'Llama a tu banco para autorizar el cobro y vuelve a intentarlo.',
  cc_rejected_duplicated_payment: 'Ya procesamos un cobro igual hace un momento.',
  cc_rejected_max_attempts: 'Demasiados intentos con esta tarjeta. Prueba con otra.',

  // Retiros
  payout_rejected_account_not_found: 'No encontramos esa cuenta. Revisa la CLABE.',
  payout_rejected_bank_unavailable: 'El banco destino no está disponible. Inténtalo más tarde.',
  payout_rejected_name_mismatch: 'La cuenta debe estar a tu nombre.',
  payout_rejected_limit_exceeded: 'El monto supera el límite de la cuenta destino.',
}

// Lo que no está en la tabla cae aquí, incluidos los motivos que la pasarela
// enmascara a propósito (antifraude, cuenta bloqueada). Explicarle al
// defraudador qué lo delató es regalarle el mapa.
const FALLBACK = 'No pudimos procesar la operación. Intenta con otro medio de pago.'

export function messageFor(statusDetail: string): string {
  return MESSAGES[statusDetail] ?? FALLBACK
}
