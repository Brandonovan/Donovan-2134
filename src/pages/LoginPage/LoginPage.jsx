import { ROUTES } from '@/constants/routes'
import { AuthSwitchLink, LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <>
      <LoginForm />
      <AuthSwitchLink question="¿No tienes cuenta?" linkText="Regístrate aquí" to={ROUTES.REGISTER} />
    </>
  )
}
