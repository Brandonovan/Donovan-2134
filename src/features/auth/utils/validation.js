const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PASSWORD_MIN_LENGTH = 8

function validateEmail(email) {
  if (!email.trim()) return 'Ingresa tu correo electrónico'
  if (!EMAIL_REGEX.test(email.trim())) return 'Ingresa un correo válido'
  return null
}

export function validateRegister({ fullName, email, password, confirmPassword }) {
  const errors = {}

  const nameParts = fullName.trim().split(/\s+/).filter(Boolean)
  if (nameParts.length === 0) errors.fullName = 'Ingresa tu nombre completo'
  else if (nameParts.length < 2) errors.fullName = 'Ingresa nombre y apellido'

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  if (!password) errors.password = 'Ingresa una contraseña'
  else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Debe incluir al menos una letra y un número'
  }

  if (!confirmPassword) errors.confirmPassword = 'Confirma tu contraseña'
  else if (confirmPassword !== password) errors.confirmPassword = 'Las contraseñas no coinciden'

  return errors
}

export function validateLogin({ email, password }) {
  const errors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  if (!password) errors.password = 'Ingresa tu contraseña'

  return errors
}
