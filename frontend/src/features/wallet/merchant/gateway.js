import { getToken } from '@/services/apiClient'
import { messageFor } from './gatewayMessages'

// Cliente de snailpay-api.
//
// Esto lo hace un backend de comercio, no un navegador: la pasarela responde al
// servidor del comercio, que decide qué reenviar al cliente. Está aquí porque
// ese servidor todavía no existe (ver merchant/index.js).
//
// Sin VITE_GATEWAY_URL el comercio simula también el cobro, para que el front
// siga funcionando solo cuando no hay pasarela levantada.
const BASE_URL = import.meta.env.VITE_GATEWAY_URL ?? ''

const CURRENCY = 'MXN'

export const isConfigured = () => BASE_URL !== ''

function fail(message, statusDetail) {
  const error = new Error(message)
  // Se adjunta el código sin mostrarlo: sirve para depurar y para métricas.
  if (statusDetail) error.statusDetail = statusDetail
  return error
}

async function post(path, body) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    })
  } catch {
    // Ni siquiera llegamos a hablar con la pasarela: red caída, CORS, puerto
    // cerrado. Es distinto de que la pasarela conteste que no.
    throw fail('No pudimos contactar con el servicio de pagos. Revisa tu conexión.')
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // 503 es indisponibilidad temporal y trae su propio mensaje; el resto son
    // fallos de la petición que el formulario debería haber evitado.
    throw fail(data.message ?? 'No pudimos procesar la operación.')
  }

  // Un rechazo llega como 201: la operación existe, simplemente no se aprobó.
  // Aquí se convierte en excepción porque es lo que el diálogo espera.
  if (data.status === 'rejected') {
    throw fail(messageFor(data.status_detail), data.status_detail)
  }

  return data
}

// Estado operativo de la pasarela. Devuelve uno de tres:
//
//   'operational'   acepta cobros
//   'major_outage'  está arriba y dice que no
//   'unreachable'   ni siquiera contesta
//
// Los dos últimos son distintos y merecen mensajes distintos: una cosa es que
// el servicio esté caído y otra que el problema esté en medio. Por eso la
// pasarela responde 200 incluso estando caída.
//
// Sin pasarela configurada se informa 'operational', porque entonces el cobro
// lo simula el propio comercio y no hay nada que pueda estar caído.
export async function readStatus() {
  if (!isConfigured()) return 'operational'

  try {
    const response = await fetch(`${BASE_URL}/status`)
    if (!response.ok) return 'unreachable'

    const data = await response.json()
    return data.payments_enabled ? 'operational' : 'major_outage'
  } catch {
    return 'unreachable'
  }
}

// vaultCard = { number, expMonth, expYear, holder } tal y como sale de la bóveda.
// cvv = el que el usuario escribió para esta operación; no se guarda.
export function charge({ amount, reference, payerEmail, vaultCard, cvv }) {
  return post('/payments', {
    transaction_amount: amount,
    currency_id: CURRENCY,
    reference,
    payer_email: payerEmail,
    card: {
      number: vaultCard.number,
      expiration_month: vaultCard.expMonth,
      expiration_year: vaultCard.expYear,
      security_code: cvv,
      cardholder_name: vaultCard.holder,
    },
  })
}

// vaultAccount = { clabe, holder } tal y como sale de la bóveda.
export function payout({ amount, reference, payeeEmail, vaultAccount }) {
  return post('/payouts', {
    transaction_amount: amount,
    currency_id: CURRENCY,
    reference,
    payee_email: payeeEmail,
    account: {
      clabe: vaultAccount.clabe,
      account_holder: vaultAccount.holder,
    },
  })
}
