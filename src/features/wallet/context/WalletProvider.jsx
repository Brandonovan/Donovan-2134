import { useCallback, useMemo } from 'react'
import { useRequest } from '@/hooks/useRequest'
import * as walletService from '../services/walletService'
import { WalletContext } from './WalletContext'

// El saldo se comparte entre el header y la página de SnailPay:
// al recargar o retirar, ambos se actualizan con la respuesta del servidor.
export function WalletProvider({ children }) {
  const { data: wallet, loading, error, retry, setData } = useRequest(walletService.getWallet)

  const applyMovement = useCallback(
    async (operation, amount) => {
      const { balance, transaction } = await operation(amount)
      setData((current) => current && { ...current, balance })
      return transaction
    },
    [setData],
  )

  const deposit = useCallback((amount) => applyMovement(walletService.deposit, amount), [applyMovement])
  const withdraw = useCallback((amount) => applyMovement(walletService.withdraw, amount), [applyMovement])

  const value = useMemo(
    () => ({ wallet, loading, error, retry, deposit, withdraw }),
    [wallet, loading, error, retry, deposit, withdraw],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
