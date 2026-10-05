import { getCurrentUserId } from '@/services/session'

// Listas guardadas en este navegador, separadas por usuario. Es solo el
// mecanismo de almacenamiento: qué va dentro lo decide quien lo use.
//
// Las listas que ve la interfaz (tarjetas, cuentas CLABE) guardan únicamente lo
// necesario para mostrarlas, nunca el número completo ni el CVV. La excepción
// es merchant/vault.js, que simula una bóveda de servidor y está documentada
// como tal.
export const STORAGE_KEYS = {
  cards: 'snailwin_cards',
  bankAccounts: 'snailwin_bank_accounts',
}

function readAll(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? {}
  } catch {
    return {}
  }
}

export function readUserList(key) {
  const list = readAll(key)[getCurrentUserId()]
  return Array.isArray(list) ? list : []
}

export function saveUserList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...readAll(key), [getCurrentUserId()]: list }))
  } catch {
    // Sin almacenamiento disponible (modo privado, cuota llena): la lista
    // sigue en memoria durante la sesión.
  }
}
