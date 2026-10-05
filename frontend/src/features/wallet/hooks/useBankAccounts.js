import { useCallback } from 'react'
import * as vault from '../merchant/vault'
import { STORAGE_KEYS } from '../storage/userStorage'
import { accountLabel, MAX_ACCOUNTS } from '../utils/clabe'
import { useStoredList } from './useStoredList'

// Recibe la CLABE ya validada y devuelve el registro que ve la interfaz: sin la
// CLABE completa. La CLABE va a la bóveda (ver merchant/vault).
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
  // Las cuentas registradas antes de que existiera la bóveda no tienen CLABE
  // guardada, así que no pueden recibir un retiro. Se descartan al cargar.
  const [accounts, update] = useStoredList(STORAGE_KEYS.bankAccounts, (account) =>
    vault.accounts.has(account.id),
  )

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

      vault.accounts.save(account.id, { clabe: data.clabe, holder: account.holder })
      update([account, ...accounts])
      return account
    },
    [accounts, update],
  )

  // Al borrar la cuenta se borra también su CLABE de la bóveda.
  const removeAccount = useCallback(
    (id) => {
      vault.accounts.remove(id)
      update(accounts.filter((account) => account.id !== id))
    },
    [accounts, update],
  )

  return { accounts, addAccount, removeAccount }
}
