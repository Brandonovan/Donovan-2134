import { describe, expect, it } from 'vitest'
import {
  FIELD_LIMITS,
  PASSWORD_RULES,
  sanitizeRegister,
  validateLogin,
  validateRegister,
} from './validation'

const base = {
  fullName: 'Donovan Rodriguez',
  email: 'donovan@ejemplo.com',
  password: 'Contrasena1!',
  confirmPassword: 'Contrasena1!',
}

const registrar = (cambios: Partial<typeof base> = {}) => validateRegister({ ...base, ...cambios })

describe('reglas de la contraseña', () => {
  const cumple = (password: string) => PASSWORD_RULES.filter((regla) => regla.test(password))

  it('una contraseña válida cumple las cinco', () => {
    expect(cumple('Contrasena1!')).toHaveLength(PASSWORD_RULES.length)
  })

  const faltantes = [
    ['contrasena1!', 'uppercase'],
    ['CONTRASENA1!', 'lowercase'],
    ['Contrasenaa!', 'digit'],
    ['Contrasena12', 'special'],
    ['Cont1!', 'length'],
  ] as const

  it.each(faltantes)('%s no cumple la regla %s', (password, regla) => {
    const incumplidas = PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.id)

    expect(incumplidas).toContain(regla)
  })

  it('rechaza una más larga que el máximo', () => {
    const larga = 'A1!a'.repeat(FIELD_LIMITS.password.max)

    expect(PASSWORD_RULES.find((r) => r.id === 'length')!.test(larga)).toBe(false)
  })

  it('acepta acentos y ñ como letras', () => {
    // Las reglas usan categorías Unicode, no [a-z]: una contraseña en español
    // no puede quedar fuera por llevar tilde.
    expect(cumple('Contraseñá1!')).toHaveLength(PASSWORD_RULES.length)
  })
})

describe('validateRegister', () => {
  it('no devuelve errores con datos buenos', () => {
    expect(registrar()).toEqual({})
  })

  it('exige nombre y apellido', () => {
    expect(registrar({ fullName: 'Donovan' })).toHaveProperty('fullName')
  })

  it('rechaza dígitos en el nombre', () => {
    expect(registrar({ fullName: 'Donovan 2134' })).toHaveProperty('fullName')
  })

  it('acepta apóstrofos y guiones', () => {
    expect(registrar({ fullName: "María José O'Brien-López" })).toEqual({})
  })

  it('rechaza correos mal formados', () => {
    for (const email of ['sin-arroba', 'a@b', 'a..b@c.com', '@ejemplo.com', '']) {
      expect(registrar({ email }), email).toHaveProperty('email')
    }
  })

  it('exige que la confirmación coincida', () => {
    expect(registrar({ confirmPassword: 'Otra1!aa' })).toHaveProperty('confirmPassword')
  })

  it('rechaza una contraseña con caracteres de control', () => {
    // Invisibles que sirven para esconder contenido o romper parsers.
    expect(registrar({ password: `Contrasena1!${String.fromCharCode(0x200b)}` })).toHaveProperty(
      'password',
    )
  })
})

describe('sanitizeRegister', () => {
  it('limpia el nombre y el correo', () => {
    const limpio = sanitizeRegister({
      ...base,
      fullName: '  Donovan   Rodriguez  ',
      email: '  Donovan@Ejemplo.COM ',
    })

    expect(limpio.fullName).toBe('Donovan Rodriguez')
    expect(limpio.email).toBe('donovan@ejemplo.com')
  })

  it('NO toca la contraseña', () => {
    // Un trim silencioso dejaría al usuario fuera de su propia cuenta: la
    // contraseña que escribió ya no coincidiría con la que se guardó.
    const conEspacios = '  Contrasena1!  '
    const limpio = sanitizeRegister({ ...base, password: conEspacios })

    expect(limpio.password).toBe(conEspacios)
  })
})

describe('validateLogin', () => {
  it('acepta credenciales con forma válida', () => {
    expect(validateLogin({ email: base.email, password: base.password })).toEqual({})
  })

  it('no aplica las reglas de fortaleza al entrar', () => {
    // Quien se registró antes de que existieran las reglas debe poder entrar.
    expect(validateLogin({ email: base.email, password: 'vieja' })).toEqual({})
  })

  it('exige los dos campos', () => {
    expect(validateLogin({ email: '', password: '' })).toHaveProperty('email')
    expect(validateLogin({ email: base.email, password: '' })).toHaveProperty('password')
  })
})
