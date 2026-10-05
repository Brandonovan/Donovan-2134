import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken, setToken } from '@/services/apiClient'
import { getStoredUser, login, logout, register } from './authService'

const USERS_KEY = 'snailwin_fake_users_v2'
const MENSAJE = 'Correo o contraseña incorrectos'

const datos = {
  fullName: 'Ada Lovelace',
  email: 'ada@ejemplo.com',
  password: 'Contrasena1!',
}

const guardados = () => localStorage.getItem(USERS_KEY) ?? ''

// Recargar la página es esto: el módulo se evalúa otra vez y lo único que
// persiste es localStorage.
async function recargar() {
  vi.resetModules()
  return import('./authService')
}

beforeEach(() => {
  localStorage.clear()
})

describe('register', () => {
  it('devuelve el usuario sin su hash', async () => {
    const user = await register(datos)

    expect(user).toMatchObject({ name: 'Ada Lovelace', email: 'ada@ejemplo.com' })
    expect(user).not.toHaveProperty('passwordHash')
    expect(user).not.toHaveProperty('password')
  })

  it('no guarda la contraseña en claro', async () => {
    await register(datos)

    expect(guardados()).not.toContain(datos.password)
    expect(guardados()).toContain('pbkdf2-sha256$600000$')
  })

  it('normaliza el correo', async () => {
    const user = await register({ ...datos, email: '  Ada@Ejemplo.COM ' })

    expect(user.email).toBe('ada@ejemplo.com')
  })

  it('abre sesión', async () => {
    await register(datos)

    expect(getToken()).toMatch(/^[0-9a-f]{64}$/)
    expect(getStoredUser()?.email).toBe('ada@ejemplo.com')
  })

  it('no admite dos cuentas con el mismo correo', async () => {
    await register(datos)

    await expect(register(datos)).rejects.toThrow(/Ya existe/)
  })
})

describe('login', () => {
  it('acepta las credenciales correctas', async () => {
    await register(datos)
    logout()

    const user = await login({ email: datos.email, password: datos.password })

    expect(user.email).toBe('ada@ejemplo.com')
  })

  it('emite un token nuevo en cada inicio de sesión', async () => {
    await register(datos)
    const primero = getToken()
    logout()

    await login({ email: datos.email, password: datos.password })

    expect(getToken()).not.toBe(primero)
  })

  it('rechaza la contraseña incorrecta', async () => {
    await register(datos)
    logout()

    await expect(login({ email: datos.email, password: 'Otra1234!' })).rejects.toThrow(MENSAJE)
  })

  it('da el mismo mensaje con un correo que no existe', async () => {
    await register(datos)
    logout()

    // Distinguirlos permitiría averiguar qué correos están registrados sin
    // adivinar ni una contraseña.
    await expect(login({ email: 'nadie@ejemplo.com', password: datos.password })).rejects.toThrow(
      MENSAJE,
    )
  })

  it('un intento fallido no deja sesión', async () => {
    await register(datos)
    logout()

    await expect(login({ email: datos.email, password: 'Otra1234!' })).rejects.toThrow()
    expect(getStoredUser()).toBeNull()
  })
})

describe('getStoredUser', () => {
  it('sin sesión no hay usuario', () => {
    expect(getStoredUser()).toBeNull()
  })

  it('sobrevive a recargar la página', async () => {
    await register(datos)

    const fresco = await recargar()

    // Lo único que viaja entre una carga y otra es localStorage: el token y la
    // tabla de sesiones bastan para reconstruir quién eres.
    expect(fresco.getStoredUser()?.email).toBe('ada@ejemplo.com')
  })

  it('tras cerrar sesión, recargar no la recupera', async () => {
    await register(datos)
    logout()

    const fresco = await recargar()

    expect(fresco.getStoredUser()).toBeNull()
  })

  it('se deriva del token, no se guarda aparte', async () => {
    await register(datos)

    // Si el usuario se guardara en su propia clave, borrar el registro dejaría
    // una sesión apuntando a nadie. Al derivarlo, la cadena falla entera.
    localStorage.removeItem(USERS_KEY)

    expect(getStoredUser()).toBeNull()
  })

  it('un token inventado no resucita a nadie', async () => {
    await register(datos)
    logout()
    setToken('a'.repeat(64))

    expect(getStoredUser()).toBeNull()
  })

  it('no existe una clave con el usuario suelto', async () => {
    await register(datos)

    // Había una, `snailwin_user`, y era una segunda fuente de verdad que podía
    // contradecir al registro. Se purga al arrancar.
    expect(localStorage.getItem('snailwin_user')).toBeNull()
  })
})

describe('datos de versiones anteriores', () => {
  it('se descartan las contraseñas guardadas en claro', async () => {
    localStorage.setItem('snailwin_fake_users', JSON.stringify([{ email: 'a@b.com', password: 'enClaro' }]))
    localStorage.setItem('snailwin_user', JSON.stringify({ id: 1 }))

    await recargar()

    // No es solo higiene: dejarlas ahí mantendría contraseñas en claro en el
    // navegador de quien probó una versión vieja.
    expect(localStorage.getItem('snailwin_fake_users')).toBeNull()
    expect(localStorage.getItem('snailwin_user')).toBeNull()
  })
})
