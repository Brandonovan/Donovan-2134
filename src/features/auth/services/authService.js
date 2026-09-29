import { clearToken, getToken, setToken } from '@/services/apiClient'

const USER_KEY = 'snailwin_user'

// Simulación mientras no exista el backend.
// Cuando esté listo, reemplazar por: apiClient('/auth/login', { method: 'POST', body: { email, password } })
function fakeLoginRequest(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || password.length < 6) {
        reject(new Error('Correo o contraseña incorrectos'))
        return
      }
      resolve({
        token: 'fake-token',
        user: { id: 1, name: email.split('@')[0], email, balance: 1000 },
      })
    }, 600)
  })
}

export async function login(email, password) {
  const { token, user } = await fakeLoginRequest(email, password)
  setToken(token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
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
