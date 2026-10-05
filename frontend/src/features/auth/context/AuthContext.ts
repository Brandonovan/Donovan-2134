import { createContext } from 'react'
import type { LoginCredentials, RegisterData, User } from '../services/authService'

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  register: (data: RegisterData) => Promise<void>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

// null como valor por defecto, y useAuth lo convierte en error: así un
// componente fuera del proveedor falla al instante con un mensaje claro, en vez
// de recibir un objeto vacío y romperse más adelante sin pistas.
export const AuthContext = createContext<AuthContextValue | null>(null)
