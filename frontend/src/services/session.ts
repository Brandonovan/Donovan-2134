import { clearToken, getToken, setToken } from './apiClient'

// --- Simulación del backend ---------------------------------------------
// Tabla de sesiones: token -> { userId, expiresAt }, el equivalente a la tabla
// que llevaría el servidor. Existe para que el token signifique algo: solo vale
// si alguien lo emitió al autenticarse, y al cerrar sesión se revoca borrando su
// fila, no solo olvidándolo en este navegador.
//
// Que viva aquí y no en features/auth es a propósito: resolver "quién es el
// usuario actual" lo necesitan también la billetera y las listas guardadas,
// y ninguna de las dos debería depender del módulo de autenticación.
//
// Esto NO impide que alguien edite localStorage a mano; nada en el front puede.
// Lo que da es una única fuente de verdad: no existen sesiones a medias.
const SESSIONS_KEY = 'snailwin_fake_sessions'
const TOKEN_BYTES = 32

// Caducidad absoluta: se fija al iniciar sesión y no se renueva con el uso.
// Recargar la página no la afecta, porque vive en localStorage junto al token.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

type Session = { userId: string; expiresAt: number }

// Lo que sale de localStorage no es de fiar: puede ser de una versión anterior
// o editado a mano. Se lee como desconocido y se valida antes de usarse.
type StoredSessions = Record<string, unknown>

function readSessions(): StoredSessions {
  try {
    return (JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? 'null') as StoredSessions) ?? {}
  } catch {
    return {}
  }
}

function writeSessions(sessions: Record<string, Session>): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

function isActive(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const session = value as Partial<Session>
  return typeof session.userId === 'string' && typeof session.expiresAt === 'number'
}

// Deja solo las sesiones vigentes. Es lo que recoge las filas huérfanas: una
// sesión que nunca se cerró —cerrar el navegador, borrar el token a mano—
// desaparece en cuanto caduca, en vez de quedarse para siempre.
// Las filas con un formato que no se reconoce también se descartan.
function activeSessions(sessions: StoredSessions): Record<string, Session> {
  const now = Date.now()
  return Object.fromEntries(
    Object.entries(sessions).filter(
      (entry): entry is [string, Session] => isActive(entry[1]) && entry[1].expiresAt > now,
    ),
  )
}

// Token opaco y aleatorio: del anterior (`fake-token-${id}`) se deducía el del
// resto de usuarios con solo conocer un id.
function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export function startSession(userId: string): string {
  const token = randomToken()
  writeSessions({
    ...activeSessions(readSessions()),
    [token]: { userId, expiresAt: Date.now() + SESSION_TTL_MS },
  })
  setToken(token)
  return token
}

// null si no hay token, si el que hay no corresponde a ninguna sesión emitida,
// o si esa sesión ya caducó.
export function getCurrentUserId(): string | null {
  const token = getToken()
  if (!token) return null

  const sessions = readSessions()
  const active = activeSessions(sessions)

  // Solo se reescribe cuando la poda encontró algo, para no tocar localStorage
  // en cada lectura: esta función se llama también desde la billetera.
  if (Object.keys(active).length !== Object.keys(sessions).length) writeSessions(active)

  return active[token]?.userId ?? null
}

export function endSession(): void {
  const token = getToken()
  if (token) {
    const { [token]: _revoked, ...rest } = readSessions()
    writeSessions(activeSessions(rest))
  }
  clearToken()
}
