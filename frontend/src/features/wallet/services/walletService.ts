import { apiClient } from '@/services/apiClient'
import { USE_MOCKS } from '@/services/mockRequest'
import * as merchant from '../merchant'
import type { BankAccount, Card, MovementResult, Transaction, Wallet } from '../types'

// Fachada que consumen los componentes. Su firma no cambia nunca: lo único que
// decide es a quién delega.
//
// Con USE_MOCKS, el navegador hace de backend del comercio (ver merchant/).
// Sin él, habla con uno real y esa carpeta sobra.

// → { balance }
export function getWallet(): Promise<Wallet> {
  return USE_MOCKS ? merchant.getWallet() : apiClient<Wallet>('/wallet')
}

// → [{ id, type: 'deposit' | 'withdrawal', amount, method, createdAt }], del más reciente al más antiguo
export function getTransactions(): Promise<Transaction[]> {
  return USE_MOCKS ? merchant.getTransactions() : apiClient<Transaction[]>('/wallet/transactions')
}

// card = tarjeta guardada; cvv = el que el usuario escribió para este cobro.
// → { balance, transaction }
export function deposit(
  amount: number,
  { card, cvv, payerEmail }: { card: Card; cvv: string; payerEmail: string },
): Promise<MovementResult> {
  if (!USE_MOCKS) {
    return apiClient<MovementResult>('/wallet/deposits', {
      method: 'POST',
      body: { amount, cardId: card.id, cvv },
    })
  }
  return merchant.deposit(amount, { card, cvv, payerEmail })
}

// account = cuenta CLABE registrada a la que se enviará el retiro por SPEI.
// → { balance, transaction }
export function withdraw(
  amount: number,
  { account, payerEmail }: { account: BankAccount; payerEmail: string },
): Promise<MovementResult> {
  if (!USE_MOCKS) {
    return apiClient<MovementResult>('/wallet/withdrawals', {
      method: 'POST',
      body: { amount, accountId: account.id },
    })
  }
  return merchant.withdraw(amount, { account, payerEmail })
}
