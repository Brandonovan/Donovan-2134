import { useCallback } from 'react'
import { STORAGE_KEYS } from '../storage/userStorage'
import { detectBrand, MAX_CARDS } from '../utils/card'
import { useStoredList } from './useStoredList'

// Recibe los datos ya limpios y validados del formulario y devuelve
// el registro a guardar: sin el número completo.
function toStoredCard({ number, holder, expiry, type }) {
  const [month, year] = expiry.split('/').map(Number)
  return {
    id: crypto.randomUUID(),
    brand: detectBrand(number),
    type,
    last4: number.slice(-4),
    holder,
    expMonth: month,
    expYear: 2000 + year,
    createdAt: new Date().toISOString(),
  }
}

export function useCards() {
  const [cards, update] = useStoredList(STORAGE_KEYS.cards)

  // Lanza un Error con un mensaje para el usuario si no se puede agregar.
  const addCard = useCallback(
    (data) => {
      const card = toStoredCard(data)
      if (cards.length >= MAX_CARDS) {
        throw new Error(`Puedes guardar hasta ${MAX_CARDS} tarjetas`)
      }
      const duplicated = cards.some(
        (saved) =>
          saved.brand === card.brand &&
          saved.last4 === card.last4 &&
          saved.expMonth === card.expMonth &&
          saved.expYear === card.expYear,
      )
      if (duplicated) throw new Error('Ya tienes guardada esta tarjeta')

      update([card, ...cards])
      return card
    },
    [cards, update],
  )

  const removeCard = useCallback((id) => update(cards.filter((card) => card.id !== id)), [cards, update])

  return { cards, addCard, removeCard }
}
