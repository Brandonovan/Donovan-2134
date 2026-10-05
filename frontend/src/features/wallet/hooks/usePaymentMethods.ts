import { useState } from 'react'
import type { OperationMode } from '../types'
import type { CardFormValues } from '../utils/card'
import { isExpired } from '../utils/card'
import type { AccountFormValues } from './useBankAccounts'
import { useBankAccounts } from './useBankAccounts'
import { useCards } from './useCards'

// Estado compartido entre "Mover saldo" y la tarjeta de métodos (tarjetas o cuentas):
// el modo de la operación y el método elegido.
export function usePaymentMethods() {
  const { cards, addCard, removeCard } = useCards()
  const { accounts, addAccount, removeAccount } = useBankAccounts()
  const [mode, setMode] = useState<OperationMode>('deposit')
  const [cardId, setCardId] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)

  // Si el método elegido se elimina (o nunca se eligió), se usa el primero disponible.
  const usableCards = cards.filter((card) => !isExpired(card))
  const selectedCard = usableCards.find((card) => card.id === cardId) ?? usableCards[0]
  const selectedAccount = accounts.find((account) => account.id === accountId) ?? accounts[0]

  // Un método recién agregado queda seleccionado.
  function addAndSelectCard(data: CardFormValues) {
    const card = addCard(data)
    setCardId(card.id)
    return card
  }

  function addAndSelectAccount(data: AccountFormValues) {
    const account = addAccount(data)
    setAccountId(account.id)
    return account
  }

  return {
    mode,
    changeMode: setMode,
    cards,
    selectedCard,
    selectCard: setCardId,
    addCard: addAndSelectCard,
    removeCard,
    accounts,
    selectedAccount,
    selectAccount: setAccountId,
    addAccount: addAndSelectAccount,
    removeAccount,
  }
}
