import type { User } from '../services/authService'
import { useAuth } from './useAuth'

// Para pantallas detrás de ProtectedRoute, donde siempre hay usuario.
//
// El guard ya lo garantiza, pero esa garantía vivía en el router y las páginas
// tenían que fiarse. Este hook la convierte en tipo: devuelve User y no
// `User | null`, así que nadie aguas abajo comprueba lo que no puede fallar.
//
// Mismo patrón que useAuth frente al proveedor: si la invariante se rompe, el
// error dice dónde y por qué, en vez de reventar más adelante sin pistas.
export function useAuthenticatedUser(): User {
  const { user } = useAuth()
  if (!user) {
    throw new Error('useAuthenticatedUser debe usarse en una ruta protegida')
  }
  return user
}
