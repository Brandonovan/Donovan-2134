import { apiClient, getToken } from '@/services/apiClient'
import { mockRequest, USE_MOCKS } from '@/services/mockRequest'
import { TRANSACTIONS, WALLET } from '../mocks/wallet'

// --- Simulación del backend ---------------------------------------------
// Una billetera por sesión (el backend real la identifica por el token),
// guardada en localStorage para que los movimientos sobrevivan a recargar la página.
const FAKE_WALLETS_KEY = 'snailwin_fake_wallets'

function readFakeWallets() {
  try {
    return JSON.parse(localStorage.getItem(FAKE_WALLETS_KEY)) ?? {}
  } catch {
    return {}
  }
}

function readFakeWallet() {
  return readFakeWallets()[getToken()] ?? { ...WALLET, transactions: TRANSACTIONS }
}

function saveFakeWallet(wallet) {
  localStorage.setItem(FAKE_WALLETS_KEY, JSON.stringify({ ...readFakeWallets(), [getToken()]: wallet }))
}

function fakeMovement(type, amount) {
  return () => {
    const { transactions, ...wallet } = readFakeWallet()
    if (type === 'withdrawal' && amount > wallet.balance) {
      throw new Error('No tienes saldo suficiente para este retiro')
    }

    const transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      method: type === 'deposit' ? wallet.paymentMethod : wallet.payoutAccount,
      createdAt: new Date().toISOString(),
    }
    const balance = Math.round((wallet.balance + (type === 'deposit' ? amount : -amount)) * 100) / 100

    saveFakeWallet({ ...wallet, balance, transactions: [transaction, ...transactions] })
    return { balance, transaction }
  }
}
// -------------------------------------------------------------------------

// → { balance, paymentMethod, payoutAccount }
export function getWallet() {
  if (!USE_MOCKS) return apiClient('/wallet')
  return mockRequest(() => {
    const { transactions: _transactions, ...wallet } = readFakeWallet()
    return wallet
  })
}

// → [{ id, type: 'deposit' | 'withdrawal', amount, method, createdAt }], del más reciente al más antiguo
export function getTransactions() {
  if (!USE_MOCKS) return apiClient('/wallet/transactions')
  return mockRequest(() => readFakeWallet().transactions)
}

// → { balance, transaction }
export function deposit(amount) {
  if (!USE_MOCKS) return apiClient('/wallet/deposits', { method: 'POST', body: { amount } })
  return mockRequest(fakeMovement('deposit', amount), { delay: 1200 })
}

// → { balance, transaction }
export function withdraw(amount) {
  if (!USE_MOCKS) return apiClient('/wallet/withdrawals', { method: 'POST', body: { amount } })
  return mockRequest(fakeMovement('withdrawal', amount), { delay: 1200 })
}
