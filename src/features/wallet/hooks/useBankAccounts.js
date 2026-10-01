import { useCallback } from 'react'
import { STORAGE_KEYS } from '../storage/userStorage'
import { accountLabel, MAX_ACCOUNTS } from '../utils/clabe'
import { useStoredList } from './useStoredList'

// Recibe la CLABE ya validada y devuelve el registro a guardar: sin la CLABE completa.
function toStoredAccount({ clabe, holder }) {
  return {
    id: crypto.randomUUID(),
    bankCode: clabe.slice(0, 3),
    last4: clabe.slice(-4),
    holder,
    createdAt: new Date().toISOString(),
  }
}

export function useBankAccounts() {
  const [accounts, update] = useStoredList(STORAGE_KEYS.bankAccounts)

  // Lanza un Error con un mensaje para el usuario si no se puede agregar.
  const addAccount = useCallback(
    (data) => {
      const account = toStoredAccount(data)
      if (accounts.length >= MAX_ACCOUNTS) {
        throw new Error(`Puedes registrar hasta ${MAX_ACCOUNTS} cuentas`)
      }
      const duplicated = accounts.some(
        (saved) => saved.bankCode === account.bankCode && saved.last4 === account.last4,
      )
      if (duplicated) throw new Error(`Ya tienes registrada tu cuenta ${accountLabel(account)}`)

      update([account, ...accounts])
      return account
    },
    [accounts, update],
  )

  const removeAccount = useCallback(
    (id) => update(accounts.filter((account) => account.id !== id)),
    [accounts, update],
  )

  return { accounts, addAccount, removeAccount }
}
