import { getToken } from '@/services/apiClient'
import { messageFor } from './gatewayMessages'
import type { VaultAccount, VaultCard } from './vault'

// Cliente de snailpay-api.
//
// Esto lo hace un backend de comercio, no un navegador: la pasarela responde al
// servidor del comercio, que decide qué reenviar al cliente. Está aquí porque
// ese servidor todavía no existe (ver merchant/index.ts).
//
// Sin VITE_GATEWAY_URL el comercio simula también el cobro, para que el front
// siga funcionando solo cuando no hay pasarela levantada.
const BASE_URL = import.meta.env.VITE_GATEWAY_URL ?? ''

const CURRENCY = 'MXN'

export const isConfigured = (): boolean => BASE_URL !== ''

// --- El contrato de la pasarela -----------------------------------------
//
// Estos tipos describen lo que devuelve snailpay-api, y son una COPIA de los
// que viven en su código. Mantenerlos sincronizados es manual: si un día el
// contrato cambia allí y no aquí, nada avisa.
//
// La alternativa sería un paquete compartido entre los dos proyectos, que para
// este tamaño pesa más de lo que resuelve. Queda escrito para que la decisión
// se vea.
//
// Van en snake_case porque así los manda la pasarela; el resto del front usa
// camelCase y la traducción ocurre en este archivo.

type MaskedCard = {
  first_six_digits: string
  last_four_digits: string
  expiration_month: number
  expiration_year: number
}

type MaskedAccount = {
  bank_code: string
  bank_name: string
  last_four_digits: string
}

type Operation = {
  id: string
  status: 'approved' | 'rejected'
  status_detail: string
  transaction_amount: number
  currency_id: typeof CURRENCY
  date_created: string
  reference: string
}

export type Payment = Operation & {
  authorization_code: string | null
  payer_id: string
  payer_email: string
  payment_method_id: string
  card: MaskedCard
}

export type Payout = Operation & {
  tracking_key: string | null
  payee_id: string
  payee_email: string
  account: MaskedAccount
}

// 'unreachable' no lo devuelve la pasarela: es lo que concluye el cliente
// cuando no obtiene respuesta. Por eso /status contesta 200 incluso caída —
// así "está caída" y "no te alcanzo" se distinguen.
export type GatewayStatus = 'operational' | 'major_outage' | 'unreachable'

type GatewayError = Error & { statusDetail?: string }

function fail(message: string, statusDetail?: string): GatewayError {
  const error: GatewayError = new Error(message)
  // Se adjunta el código sin mostrarlo: sirve para depurar y para métricas.
  if (statusDetail) error.statusDetail = statusDetail
  return error
}

async function post<T extends Operation>(path: string, body: unknown): Promise<T> {
  let response: Response
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

  const data = (await response.json().catch(() => ({}))) as Partial<T> & { message?: string }

  if (!response.ok) {
    // 503 es indisponibilidad temporal y trae su propio mensaje; el resto son
    // fallos de la petición que el formulario debería haber evitado.
    throw fail(data.message ?? 'No pudimos procesar la operación.')
  }

  // Un rechazo llega como 201: la operación existe, simplemente no se aprobó.
  // Aquí se convierte en excepción porque es lo que el diálogo espera.
  if (data.status === 'rejected') {
    throw fail(messageFor(data.status_detail ?? ''), data.status_detail)
  }

  return data as T
}

// Estado operativo de la pasarela.
//
// Sin pasarela configurada se informa 'operational', porque entonces el cobro
// lo simula el propio comercio y no hay nada que pueda estar caído.
export async function readStatus(): Promise<GatewayStatus> {
  if (!isConfigured()) return 'operational'

  try {
    const response = await fetch(`${BASE_URL}/status`)
    if (!response.ok) return 'unreachable'

    const data = (await response.json()) as { payments_enabled?: boolean }
    return data.payments_enabled ? 'operational' : 'major_outage'
  } catch {
    return 'unreachable'
  }
}

type ChargeInput = {
  amount: number
  reference: string
  payerEmail: string
  vaultCard: VaultCard
  cvv: string
}

// cvv = el que el usuario escribió para esta operación; no se guarda.
export function charge({ amount, reference, payerEmail, vaultCard, cvv }: ChargeInput) {
  return post<Payment>('/payments', {
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

type PayoutInput = {
  amount: number
  reference: string
  payeeEmail: string
  vaultAccount: VaultAccount
}

export function payout({ amount, reference, payeeEmail, vaultAccount }: PayoutInput) {
  return post<Payout>('/payouts', {
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
