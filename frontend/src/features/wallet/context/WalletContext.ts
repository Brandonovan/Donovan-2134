import { createContext } from 'react'
import type { deposit, withdraw } from '../services/walletService'
import type { Wallet } from '../types'

export type WalletContextValue = {
  wallet: Wallet | undefined
  loading: boolean
  error: Error | null
  retry: () => void
  // Se toman del servicio en vez de redeclararlas: si allí cambia la firma,
  // aquí deja de compilar en lugar de desincronizarse en silencio.
  deposit: typeof deposit
  withdraw: typeof withdraw
  updateBalance: (balance: number) => void
}

export const WalletContext = createContext<WalletContextValue | null>(null)
