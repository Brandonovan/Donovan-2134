import { endSession, getCurrentUserId, startSession } from '@/services/session'
import { dummyVerify, hashPassword, verifyPassword } from '../utils/passwordHash'

const FAKE_DB_KEY = 'snailwin_fake_users_v2'
const LEGACY_KEYS = ['snailwin_fake_users', 'snailwin_user']
const INITIAL_BALANCE = 1000

// --- Simulación del backend ---------------------------------------------
// Mientras no exista la API, los usuarios se guardan en localStorage. La
// contraseña nunca se almacena: solo su hash con salt (ver utils/passwordHash),
// igual que haría el servidor.
//
// El usuario tampoco se guarda aparte: se deriva del token en cada lectura
// (token -> sesión -> registro), para que no pueda existir un usuario en
// pantalla que no corresponda a ningún registro.
//
// Cuando el backend esté listo, reemplazar fakeRegister/fakeLogin por:
//   apiClient('/auth/register', { method: 'POST', body: { fullName, email, password } })
//   apiClient('/auth/login', { method: 'POST', body: { email, password } })
// y borrar utils/passwordHash: hashear pasa a ser responsabilidad del servidor.

// Versiones anteriores guardaban la contraseña en claro y el usuario suelto en
// localStorage. Se borran al arrancar para no dejar ese rastro en el navegador.
LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))

function readFakeUsers() {
  try {
    return JSON.parse(localStorage.getItem(FAKE_DB_KEY)) ?? []
  } catch {
    return []
  }
}

// Lo que ve la aplicación: el registro sin su hash.
function toPublicUser({ passwordHash: _passwordHash, ...user }) {
  return user
}

async function fakeRegister({ fullName, email, password }) {
  const users = readFakeUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Ya existe una cuenta con ese correo')
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: fullName.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    balance: INITIAL_BALANCE,
  }
  localStorage.setItem(FAKE_DB_KEY, JSON.stringify([...users, newUser]))
  return newUser
}

async function fakeLogin({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = readFakeUsers().find((candidate) => candidate.email === normalizedEmail)

  // Si el correo no existe se deriva igualmente un hash que se tira: sin esto el
  // intento fallaría al instante y el tiempo de respuesta delataría qué correos
  // están registrados. Por lo mismo el mensaje de error no distingue los casos.
  const isValid = user
    ? await verifyPassword(password, user.passwordHash)
    : await dummyVerify(password)

  if (!isValid) throw new Error('Correo o contraseña incorrectos')
  return user
}
// -------------------------------------------------------------------------

// El token solo se emite aquí, después de registrar o de verificar la contraseña.
function openSession(user) {
  startSession(user.id)
  return toPublicUser(user)
}

export async function register(data) {
  return openSession(await fakeRegister(data))
}

export async function login(credentials) {
  return openSession(await fakeLogin(credentials))
}

export function logout() {
  endSession()
}

export function getStoredUser() {
  const userId = getCurrentUserId()
  if (!userId) return null

  const user = readFakeUsers().find((candidate) => candidate.id === userId)
  return user ? toPublicUser(user) : null
}
