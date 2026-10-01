import { useCallback, useMemo } from 'react'
import { useRequest } from '@/hooks/useRequest'
import * as walletService from '../services/walletService'
import { WalletContext } from './WalletContext'

// El saldo se comparte entre el header y la página de SnailPay.
// deposit/withdraw devuelven { balance, transaction } sin tocar el saldo mostrado:
// la UI lo aplica con updateBalance cuando el usuario cierra el comprobante,
// para que vea el cambio (y su animación) en lugar de que pase detrás del diálogo.
export function WalletProvider({ children }) {
  const { data: wallet, loading, error, retry, setData } = useRequest(walletService.getWallet)

  const updateBalance = useCallback(
    (balance) => setData((current) => current && { ...current, balance }),
    [setData],
  )

  const value = useMemo(
    () => ({
      wallet,
      loading,
      error,
      retry,
      deposit: walletService.deposit,
      withdraw: walletService.withdraw,
      updateBalance,
    }),
    [wallet, loading, error, retry, updateBalance],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
