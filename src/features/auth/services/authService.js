import { clearToken, getToken, setToken } from '@/services/apiClient'

const USER_KEY = 'snailwin_user'
const FAKE_DB_KEY = 'snailwin_fake_users'
const INITIAL_BALANCE = 1000
const FAKE_DELAY_MS = 600

// --- Simulación del backend ---------------------------------------------
// Mientras no exista la API, los usuarios se guardan en localStorage.
// Solo para desarrollo: NUNCA guardar contraseñas así en producción.
// Cuando el backend esté listo, reemplazar fakeRegister/fakeLogin por:
//   apiClient('/auth/register', { method: 'POST', body: { fullName, email, password } })
//   apiClient('/auth/login', { method: 'POST', body: { email, password } })

function readFakeUsers() {
  try {
    return JSON.parse(localStorage.getItem(FAKE_DB_KEY)) ?? []
  } catch {
    return []
  }
}

function withDelay(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn())
      } catch (error) {
        reject(error)
      }
    }, FAKE_DELAY_MS)
  })
}

function toSession({ password: _password, ...user }) {
  return { token: `fake-token-${user.id}`, user }
}

function fakeRegister({ fullName, email, password }) {
  return withDelay(() => {
    const users = readFakeUsers()
    const normalizedEmail = email.trim().toLowerCase()

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('Ya existe una cuenta con ese correo')
    }

    const newUser = {
      id: Date.now(),
      name: fullName.trim(),
      email: normalizedEmail,
      password,
      balance: INITIAL_BALANCE,
    }
    localStorage.setItem(FAKE_DB_KEY, JSON.stringify([...users, newUser]))
    return toSession(newUser)
  })
}

function fakeLogin({ email, password }) {
  return withDelay(() => {
    const normalizedEmail = email.trim().toLowerCase()
    const user = readFakeUsers().find(
      (candidate) => candidate.email === normalizedEmail && candidate.password === password,
    )

    if (!user) {
      throw new Error('Correo o contraseña incorrectos')
    }
    return toSession(user)
  })
}
// -------------------------------------------------------------------------

function saveSession({ token, user }) {
  setToken(token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export async function register(data) {
  return saveSession(await fakeRegister(data))
}

export async function login(credentials) {
  return saveSession(await fakeLogin(credentials))
}

export function logout() {
  clearToken()
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser() {
  if (!getToken()) return null
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}
