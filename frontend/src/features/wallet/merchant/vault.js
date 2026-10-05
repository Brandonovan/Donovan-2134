import { readUserList, saveUserList } from '../storage/userStorage'

// --- Bóveda de medios de pago -------------------------------------------
//
// ESTE ES EL ÚNICO MÓDULO QUE GUARDA DATOS COMPLETOS: el número de tarjeta y
// la CLABE. Todo lo demás del front trabaja con la versión enmascarada.
//
// Está aquí porque hace falta: la pasarela necesita el número completo en cada
// cobro, y no emite tokens —no guarda nada—, así que alguien tiene que
// recordarlo. En un montaje real ese alguien es el backend del comercio, y el
// navegador no vería este dato en su vida.
//
// LÍMITE CONOCIDO: esto deja el número en localStorage, legible por cualquier
// XSS o por quien tenga el dispositivo. Es deliberado y es lo que esta carpeta
// simula. Desaparece el día que la pasarela emita tokens: la bóveda se borra y
// el id de la tarjeta pasa a ser ese token.
//
// EL CVV NO ENTRA AQUÍ. Nunca, ni cifrado. Se pide en cada operación, viaja a
// la pasarela y muere. Esa regla no depende de que esto sea una simulación.

const KEYS = {
  cards: 'snailwin_card_vault',
  accounts: 'snailwin_account_vault',
}

function vaultFor(key) {
  return {
    save(id, data) {
      const rest = readUserList(key).filter((entry) => entry.id !== id)
      saveUserList(key, [{ id, ...data }, ...rest])
    },

    read(id) {
      return readUserList(key).find((entry) => entry.id === id) ?? null
    },

    has(id) {
      return readUserList(key).some((entry) => entry.id === id)
    },

    remove(id) {
      saveUserList(
        key,
        readUserList(key).filter((entry) => entry.id !== id),
      )
    },
  }
}

// { id, number, expMonth, expYear, holder }
export const cards = vaultFor(KEYS.cards)

// { id, clabe, holder }
export const accounts = vaultFor(KEYS.accounts)
