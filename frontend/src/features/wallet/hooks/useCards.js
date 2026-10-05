import { useCallback } from 'react'
import * as vault from '../merchant/vault'
import { STORAGE_KEYS } from '../storage/userStorage'
import { detectBrand, MAX_CARDS } from '../utils/card'
import { useStoredList } from './useStoredList'

// Recibe los datos ya limpios y validados del formulario y devuelve el registro
// que ve la interfaz: sin el número completo. El número va a la bóveda (ver
// merchant/vault), que es el único sitio que lo guarda.
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
  // Las tarjetas registradas antes de que existiera la bóveda no tienen número
  // guardado, así que no pueden cobrar. Se descartan al cargar.
  const [cards, update] = useStoredList(STORAGE_KEYS.cards, (card) => vault.cards.has(card.id))

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

      vault.cards.save(card.id, {
        number: data.number,
        expMonth: card.expMonth,
        expYear: card.expYear,
        holder: card.holder,
      })
      update([card, ...cards])
      return card
    },
    [cards, update],
  )

  // Al borrar una tarjeta se borra también su entrada en la bóveda: un número
  // huérfano no le sirve a nadie y sigue siendo un dato sensible guardado.
  const removeCard = useCallback(
    (id) => {
      vault.cards.remove(id)
      update(cards.filter((card) => card.id !== id))
    },
    [cards, update],
  )

  return { cards, addCard, removeCard }
}
