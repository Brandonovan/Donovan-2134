import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { User } from '../services/authService'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getStoredUser)

  const register = useCallback<AuthContextValue['register']>(async (data) => {
    setUser(await authService.register(data))
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (credentials) => {
    setUser(await authService.login(credentials))
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), register, login, logout }),
    [user, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
