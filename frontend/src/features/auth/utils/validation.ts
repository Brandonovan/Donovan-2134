import { hasControlChars, sanitizeEmail, sanitizeText } from '@/utils/sanitize'

// Lo que escribe cada formulario. Tenerlo aquí, junto a sus reglas, evita que
// el formulario y su validación se desincronicen sin que nadie se entere.
export type RegisterValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type LoginValues = {
  email: string
  password: string
}

// Un mensaje por campo, y solo para los campos que fallaron.
export type FieldErrors<T> = Partial<Record<keyof T, string>>

type Check = string | false | null

export const FIELD_LIMITS = {
  fullName: { min: 3, max: 100 },
  email: { max: 254 },
  password: { min: 8, max: 128 },
}

// Letras de cualquier idioma (incluye acentos y ñ), separadas por un espacio,
// apóstrofo, punto o guion: "María José O'Brien-López".
const NAME_REGEX = /^[\p{L}\p{M}]+(?:[ '.-][\p{L}\p{M}]+)*\.?$/u
const EMAIL_REGEX = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/

export type PasswordRule = { id: string; label: string; test: (value: string) => boolean }

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `Entre ${FIELD_LIMITS.password.min} y ${FIELD_LIMITS.password.max} caracteres`,
    test: (value: string) =>
      value.length >= FIELD_LIMITS.password.min && value.length <= FIELD_LIMITS.password.max,
  },
  { id: 'lowercase', label: 'Una letra minúscula', test: (value: string) => /\p{Ll}/u.test(value) },
  { id: 'uppercase', label: 'Una letra mayúscula', test: (value: string) => /\p{Lu}/u.test(value) },
  { id: 'digit', label: 'Un número', test: (value: string) => /\d/.test(value) },
  {
    id: 'special',
    label: 'Un carácter especial (!@#$%…)',
    test: (value: string) => /[^\p{L}\p{N}\s]/u.test(value),
  },
]

// --- Limpieza -------------------------------------------------------------
// La contraseña NUNCA se modifica (ni trim): cambiarla haría que el usuario
// no pudiera volver a entrar con lo que escribió. Solo se valida.

export function sanitizeRegister({
  fullName,
  email,
  password,
  confirmPassword,
}: RegisterValues): RegisterValues {
  return {
    fullName: sanitizeText(fullName),
    email: sanitizeEmail(email),
    password,
    confirmPassword,
  }
}

export function sanitizeLogin({ email, password }: LoginValues): LoginValues {
  return { email: sanitizeEmail(email), password }
}

// --- Validación (recibe valores ya limpios) --------------------------------

function validateEmail(email: string): Check {
  if (!email) return 'Ingresa tu correo electrónico'
  if (email.length > FIELD_LIMITS.email.max) return 'El correo es demasiado largo'
  if (!EMAIL_REGEX.test(email) || email.includes('..')) return 'Ingresa un correo válido'
  return null
}

function validateFullName(fullName: string): Check {
  const { min, max } = FIELD_LIMITS.fullName
  if (!fullName) return 'Ingresa tu nombre completo'
  if (fullName.length < min || fullName.length > max) {
    return `Debe tener entre ${min} y ${max} caracteres`
  }
  if (!NAME_REGEX.test(fullName)) return 'Solo se permiten letras, espacios, apóstrofos y guiones'
  if (fullName.split(' ').length < 2) return 'Ingresa nombre y apellido'
  return null
}

function validateNewPassword(password: string): Check {
  if (!password) return 'Ingresa una contraseña'
  if (hasControlChars(password)) return 'La contraseña contiene caracteres no permitidos'
  if (PASSWORD_RULES.some((rule) => !rule.test(password))) {
    return 'La contraseña no cumple todos los requisitos'
  }
  return null
}

// Deja fuera los campos sin error, para que `Object.keys(errores).length`
// signifique "cuántos campos fallaron".
function collectErrors<T>(checks: Record<keyof T & string, Check>): FieldErrors<T> {
  return Object.fromEntries(
    Object.entries(checks).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as FieldErrors<T>
}

export function validateRegister({
  fullName,
  email,
  password,
  confirmPassword,
}: RegisterValues): FieldErrors<RegisterValues> {
  return collectErrors({
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword: !confirmPassword
      ? 'Confirma tu contraseña'
      : confirmPassword !== password && 'Las contraseñas no coinciden',
  })
}

export function validateLogin({ email, password }: LoginValues): FieldErrors<LoginValues> {
  return collectErrors({
    email: validateEmail(email),
    password: !password
      ? 'Ingresa tu contraseña'
      : password.length > FIELD_LIMITS.password.max && 'La contraseña es demasiado larga',
  })
}
