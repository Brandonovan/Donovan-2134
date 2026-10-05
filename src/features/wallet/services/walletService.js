import { apiClient } from '@/services/apiClient'
import { getCurrentUserId } from '@/services/session'
import { mockRequest, USE_MOCKS } from '@/services/mockRequest'
import { TRANSACTIONS, WALLET } from '../mocks/wallet'
import { validateAmount } from '../utils/amount'
import { cardLabel } from '../utils/card'
import { accountLabel } from '../utils/clabe'

// --- Simulación del backend ---------------------------------------------
// Una billetera por usuario, guardada en localStorage para que los movimientos
// sobrevivan a recargar la página. Se indexa por id de usuario y no por token
// porque el token cambia en cada inicio de sesión: el backend real lo usa para
// resolver de quién es la petición, no como identidad.
const FAKE_WALLETS_KEY = 'snailwin_fake_wallets'

function readFakeWallets() {
  try {
    return JSON.parse(localStorage.getItem(FAKE_WALLETS_KEY)) ?? {}
  } catch {
    return {}
  }
}

function readFakeWallet() {
  return readFakeWallets()[getCurrentUserId()] ?? { ...WALLET, transactions: TRANSACTIONS }
}

function saveFakeWallet(wallet) {
  try {
    localStorage.setItem(FAKE_WALLETS_KEY, JSON.stringify({ ...readFakeWallets(), [getCurrentUserId()]: wallet }))
  } catch {
    // Sin almacenamiento disponible (modo privado, cuota llena): la operación
    // se ve en pantalla, pero no sobrevive a recargar la página.
  }
}

// CVV para probar un cobro rechazado por el banco.
const FAKE_DECLINED_CVV = '000'

function fakeMovement(type, amount, { card, cvv, account }) {
  return () => {
    const { transactions, ...wallet } = readFakeWallet()

    // Se revalida el monto aunque el formulario ya lo hiciera: las reglas del
    // cliente son UX y cualquiera puede saltárselas llamando al servicio.
    // El backend real tendrá que repetir esta misma comprobación.
    const amountError = validateAmount(amount, type, wallet.balance)
    if (amountError) throw new Error(amountError)
    // El CVV solo se usa para autorizar este cobro; no se guarda en ningún lado.
    if (type === 'deposit' && cvv === FAKE_DECLINED_CVV) {
      throw new Error('Tu banco rechazó el cobro. Revisa los datos o usa otra tarjeta.')
    }

    const transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      method: type === 'deposit' ? cardLabel(card) : `CLABE ${accountLabel(account)}`,
      createdAt: new Date().toISOString(),
    }
    const balance = Math.round((wallet.balance + (type === 'deposit' ? amount : -amount)) * 100) / 100

    saveFakeWallet({ ...wallet, balance, transactions: [transaction, ...transactions] })
    return { balance, transaction }
  }
}
// -------------------------------------------------------------------------

// → { balance }
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

// card = tarjeta guardada en el navegador; cvv = el que el usuario escribió para este cobro.
// Cuando haya tokenización, se enviará el token de la tarjeta en lugar de su id.
// → { balance, transaction }
export function deposit(amount, { card, cvv }) {
  if (!USE_MOCKS) {
    return apiClient('/wallet/deposits', { method: 'POST', body: { amount, cardId: card.id, cvv } })
  }
  return mockRequest(fakeMovement('deposit', amount, { card, cvv }), { delay: 1200 })
}

// account = cuenta CLABE registrada a la que se enviará el retiro por SPEI.
// → { balance, transaction }
export function withdraw(amount, { account }) {
  if (!USE_MOCKS) {
    return apiClient('/wallet/withdrawals', { method: 'POST', body: { amount, accountId: account.id } })
  }
  return mockRequest(fakeMovement('withdrawal', amount, { account }), { delay: 1200 })
}
