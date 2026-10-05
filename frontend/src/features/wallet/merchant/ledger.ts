import { getCurrentUserId } from '@/services/session'
import { TRANSACTIONS, WALLET } from '../mocks/wallet'
import type { Transaction, Wallet } from '../types'

type StoredWallet = Wallet & { transactions: Transaction[] }

// Libro de cuentas del comercio: saldo e historial de movimientos.
//
// Esto es lo que llevaría la base de datos del comercio, no la pasarela. La
// pasarela autoriza un cobro y devuelve un comprobante; quién tiene cuánto
// saldo es asunto de quien vende.
//
// Se indexa por id de usuario y no por token porque el token cambia en cada
// inicio de sesión: un backend real lo usa para resolver de quién es la
// petición, no como identidad.
const WALLETS_KEY = 'snailwin_fake_wallets'

function readAll(): Record<string, StoredWallet> {
  try {
    return (JSON.parse(localStorage.getItem(WALLETS_KEY) ?? 'null') as Record<string, StoredWallet>) ?? {}
  } catch {
    return {}
  }
}

export function readWallet(): StoredWallet {
  return readAll()[getCurrentUserId() ?? ''] ?? { ...WALLET, transactions: TRANSACTIONS }
}

function save(wallet: StoredWallet): void {
  try {
    localStorage.setItem(
      WALLETS_KEY,
      JSON.stringify({ ...readAll(), [getCurrentUserId() ?? '']: wallet }),
    )
  } catch {
    // Sin almacenamiento disponible (modo privado, cuota llena): la operación
    // se ve en pantalla, pero no sobrevive a recargar la página.
  }
}

// Asienta un movimiento ya autorizado y devuelve el saldo resultante.
// El redondeo a centavos evita que el saldo se desvíe de la suma de sus
// movimientos a base de acumular errores de coma flotante.
export function post(transaction: Transaction): number {
  const { transactions, ...wallet } = readWallet()
  const signed = transaction.type === 'deposit' ? transaction.amount : -transaction.amount
  const balance = Math.round((wallet.balance + signed) * 100) / 100

  save({ ...wallet, balance, transactions: [transaction, ...transactions] })
  return balance
}
