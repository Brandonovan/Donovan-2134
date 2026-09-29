import { hasControlChars, sanitizeEmail, sanitizeText } from '@/utils/sanitize'

export const FIELD_LIMITS = {
  fullName: { min: 3, max: 100 },
  email: { max: 254 },
  password: { min: 8, max: 128 },
}

// Letras de cualquier idioma (incluye acentos y ñ), separadas por un espacio,
// apóstrofo, punto o guion: "María José O'Brien-López".
const NAME_REGEX = /^[\p{L}\p{M}]+(?:[ '.-][\p{L}\p{M}]+)*\.?$/u
const EMAIL_REGEX = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `Entre ${FIELD_LIMITS.password.min} y ${FIELD_LIMITS.password.max} caracteres`,
    test: (value) =>
      value.length >= FIELD_LIMITS.password.min && value.length <= FIELD_LIMITS.password.max,
  },
  { id: 'lowercase', label: 'Una letra minúscula', test: (value) => /\p{Ll}/u.test(value) },
  { id: 'uppercase', label: 'Una letra mayúscula', test: (value) => /\p{Lu}/u.test(value) },
  { id: 'digit', label: 'Un número', test: (value) => /\d/.test(value) },
  {
    id: 'special',
    label: 'Un carácter especial (!@#$%…)',
    test: (value) => /[^\p{L}\p{N}\s]/u.test(value),
  },
]

// --- Limpieza -------------------------------------------------------------
// La contraseña NUNCA se modifica (ni trim): cambiarla haría que el usuario
// no pudiera volver a entrar con lo que escribió. Solo se valida.

export function sanitizeRegister({ fullName, email, password, confirmPassword }) {
  return {
    fullName: sanitizeText(fullName),
    email: sanitizeEmail(email),
    password,
    confirmPassword,
  }
}

export function sanitizeLogin({ email, password }) {
  return { email: sanitizeEmail(email), password }
}

// --- Validación (recibe valores ya limpios) --------------------------------

function validateEmail(email) {
  if (!email) return 'Ingresa tu correo electrónico'
  if (email.length > FIELD_LIMITS.email.max) return 'El correo es demasiado largo'
  if (!EMAIL_REGEX.test(email) || email.includes('..')) return 'Ingresa un correo válido'
  return null
}

function validateFullName(fullName) {
  const { min, max } = FIELD_LIMITS.fullName
  if (!fullName) return 'Ingresa tu nombre completo'
  if (fullName.length < min || fullName.length > max) {
    return `Debe tener entre ${min} y ${max} caracteres`
  }
  if (!NAME_REGEX.test(fullName)) return 'Solo se permiten letras, espacios, apóstrofos y guiones'
  if (fullName.split(' ').length < 2) return 'Ingresa nombre y apellido'
  return null
}

function validateNewPassword(password) {
  if (!password) return 'Ingresa una contraseña'
  if (hasControlChars(password)) return 'La contraseña contiene caracteres no permitidos'
  if (PASSWORD_RULES.some((rule) => !rule.test(password))) {
    return 'La contraseña no cumple todos los requisitos'
  }
  return null
}

function collectErrors(checks) {
  return Object.fromEntries(Object.entries(checks).filter(([, error]) => error))
}

export function validateRegister({ fullName, email, password, confirmPassword }) {
  return collectErrors({
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword: !confirmPassword
      ? 'Confirma tu contraseña'
      : confirmPassword !== password && 'Las contraseñas no coinciden',
  })
}

export function validateLogin({ email, password }) {
  return collectErrors({
    email: validateEmail(email),
    password: !password
      ? 'Ingresa tu contraseña'
      : password.length > FIELD_LIMITS.password.max && 'La contraseña es demasiado larga',
  })
}
