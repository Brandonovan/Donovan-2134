import { getCurrentUserId } from '@/services/session'

// Listas guardadas en este navegador (tarjetas, cuentas CLABE), separadas por usuario.
// Solo se guarda lo necesario para mostrarlas: NUNCA el número completo de una tarjeta,
// su CVV ni la CLABE completa. Cuando exista el backend, cada método se registrará en el
// servidor (las tarjetas, tokenizadas con la pasarela) y aquí solo quedará su referencia.
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
