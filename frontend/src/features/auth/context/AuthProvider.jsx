import { useCallback, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getStoredUser)

  const register = useCallback(async (data) => {
    setUser(await authService.register(data))
  }, [])

  const login = useCallback(async (credentials) => {
    setUser(await authService.login(credentials))
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), register, login, logout }),
    [user, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
