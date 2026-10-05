import { randomBytes, randomUUID } from 'node:crypto'
import { createApp } from '../src/app.js'

export const app = createApp()

// El token no se verifica contra nada: solo tiene que tener la forma que emite
// el front (64 hexadecimales). Ver middlewares/authenticate.
export const token = (): string => randomBytes(32).toString('hex')

export const bearer = (value = token()) => `Bearer ${value}`

type Overrides = Record<string, unknown>

export function payment({ cardholder_name = 'APRO', card = {}, ...rest }: Overrides & { card?: Overrides } = {}) {
  return {
    transaction_amount: 500,
    currency_id: 'MXN',
    reference: randomUUID(),
    payer_email: 'donovan@ejemplo.com',
    card: {
      number: '4242424242424242',
      expiration_month: 12,
      expiration_year: 2028,
      security_code: '123',
      cardholder_name,
      ...card,
    },
    ...rest,
  }
}

export function payout({ clabe = '012180000000001001', account = {}, ...rest }: Overrides & { account?: Overrides } = {}) {
  return {
    transaction_amount: 500,
    currency_id: 'MXN',
    reference: randomUUID(),
    payee_email: 'donovan@ejemplo.com',
    account: { clabe, account_holder: 'DONOVAN RODRIGUEZ', ...account },
    ...rest,
  }
}
