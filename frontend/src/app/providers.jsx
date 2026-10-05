import { AuthProvider } from '@/features/auth'

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
