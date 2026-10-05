import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearToken, getToken, setToken } from './apiClient'
import { endSession, getCurrentUserId, startSession } from './session'

const SESSIONS_KEY = 'snailwin_fake_sessions'
const DIA = 24 * 60 * 60 * 1000

const tabla = (): Record<string, unknown> =>
  JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '{}')

const escribirTabla = (filas: Record<string, unknown>) =>
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filas))

beforeEach(() => {
  clearToken()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('startSession', () => {
  it('emite un token opaco de 64 hexadecimales', () => {
    const token = startSession('usuario-ada')

    // Del anterior (`fake-token-${id}`) se deducía el del resto de usuarios con
    // solo conocer un id. Este no dice nada de nadie.
    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(token).not.toContain('usuario-ada')
  })

  it('lo guarda y lo deja como sesión actual', () => {
    const token = startSession('usuario-ada')

    expect(getToken()).toBe(token)
    expect(getCurrentUserId()).toBe('usuario-ada')
  })

  it('emite un token distinto en cada inicio de sesión', () => {
    const primero = startSession('usuario-ada')
    const segundo = startSession('usuario-ada')

    expect(segundo).not.toBe(primero)
  })

  it('guarda la fila con su caducidad a 24 horas', () => {
    const token = startSession('usuario-ada')
    const fila = tabla()[token] as { userId: string; expiresAt: number }

    expect(fila.userId).toBe('usuario-ada')
    expect(Math.abs(fila.expiresAt - Date.now() - DIA)).toBeLessThan(5_000)
  })
})

describe('getCurrentUserId', () => {
  it('sin token no hay usuario', () => {
    expect(getCurrentUserId()).toBeNull()
  })

  it('un token inventado no autentica', () => {
    startSession('usuario-ada')
    setToken('a'.repeat(64))

    // Es la razón de existir de la tabla: que el token signifique algo. Antes
    // bastaba cualquier cadena para abrir sesión.
    expect(getCurrentUserId()).toBeNull()
  })

  it('un token con otro formato tampoco', () => {
    setToken('fake-token-1')

    expect(getCurrentUserId()).toBeNull()
  })

  it('sobrevive a recargar la página', () => {
    startSession('usuario-ada')

    // Recargar no es más que volver a leer: nada vive en memoria.
    expect(getCurrentUserId()).toBe('usuario-ada')
    expect(getCurrentUserId()).toBe('usuario-ada')
  })

  it('leer no reescribe la tabla si no hay nada que podar', () => {
    const token = startSession('usuario-ada')
    const antes = localStorage.getItem(SESSIONS_KEY)

    getCurrentUserId()

    // Esta función la llama también la billetera: tocar localStorage en cada
    // lectura sería gratuito solo en apariencia.
    expect(localStorage.getItem(SESSIONS_KEY)).toBe(antes)
    expect(tabla()[token]).toBeDefined()
  })
})

describe('caducidad', () => {
  it('una sesión vencida deja de autenticar', () => {
    vi.useFakeTimers()
    startSession('usuario-ada')

    vi.setSystemTime(Date.now() + DIA + 1_000)

    expect(getCurrentUserId()).toBeNull()
  })

  it('sigue valiendo justo antes de caducar', () => {
    vi.useFakeTimers()
    startSession('usuario-ada')

    vi.setSystemTime(Date.now() + DIA - 60_000)

    expect(getCurrentUserId()).toBe('usuario-ada')
  })

  it('al leer se borra la fila vencida', () => {
    vi.useFakeTimers()
    const token = startSession('usuario-ada')

    vi.setSystemTime(Date.now() + DIA + 1_000)
    getCurrentUserId()

    expect(tabla()[token]).toBeUndefined()
  })
})

describe('poda de filas huérfanas', () => {
  it('descarta las vencidas y conserva las vigentes', () => {
    const vivo = startSession('usuario-ada')
    escribirTabla({
      ...tabla(),
      vencida: { userId: 'x', expiresAt: Date.now() - DIA },
      otraViva: { userId: 'y', expiresAt: Date.now() + DIA },
    })

    getCurrentUserId()

    // Una sesión que nunca se cerró —cerrar el navegador, borrar el token a
    // mano— desaparece al caducar en vez de quedarse para siempre.
    expect(Object.keys(tabla()).sort()).toEqual([vivo, 'otraViva'].sort())
  })

  it('descarta filas con un formato que no reconoce', () => {
    startSession('usuario-ada')
    escribirTabla({ ...tabla(), formatoViejo: 'solo-un-id', nula: null })

    getCurrentUserId()

    expect(tabla()['formatoViejo']).toBeUndefined()
    expect(tabla()['nula']).toBeUndefined()
  })

  it('un inicio de sesión nuevo también limpia', () => {
    escribirTabla({ basura: { userId: 'z', expiresAt: Date.now() - 1 } })

    startSession('usuario-ada')

    expect(tabla()['basura']).toBeUndefined()
  })

  it('aguanta una tabla corrupta sin reventar', () => {
    localStorage.setItem(SESSIONS_KEY, 'esto no es json')

    expect(() => startSession('usuario-ada')).not.toThrow()
    expect(getCurrentUserId()).toBe('usuario-ada')
  })
})

describe('endSession', () => {
  it('deja la sesión sin efecto', () => {
    startSession('usuario-ada')
    endSession()

    expect(getToken()).toBeNull()
    expect(getCurrentUserId()).toBeNull()
  })

  it('revoca de verdad: reponer el token viejo no la revive', () => {
    const token = startSession('usuario-ada')
    endSession()

    setToken(token)

    // Borra la fila, no solo el token local. Es lo que hace una tabla de
    // sesiones de servidor, y lo que un JWT no puede hacer.
    expect(getCurrentUserId()).toBeNull()
  })

  it('no toca las sesiones de otros', () => {
    escribirTabla({ deOtro: { userId: 'bea', expiresAt: Date.now() + DIA } })
    startSession('usuario-ada')
    endSession()

    expect(tabla()['deOtro']).toBeDefined()
  })
})
