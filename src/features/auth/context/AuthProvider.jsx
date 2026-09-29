import { useCallback, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getStoredUser)

  const login = useCallback(async (email, password) => {
    const loggedUser = await authService.login(email, password)
    setUser(loggedUser)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
