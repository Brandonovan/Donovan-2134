import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/AuthContext'

// El `throw` no es solo defensivo: es lo que permite devolver AuthContextValue
// en vez de `AuthContextValue | null`, así que nadie aguas abajo tiene que
// comprobar si hay contexto.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
