import { ROUTES } from '@/constants/routes'
import { AuthSwitchLink, RegisterForm } from '@/features/auth'

export function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <AuthSwitchLink question="¿Ya tienes cuenta?" linkText="Inicia sesión aquí" to={ROUTES.LOGIN} />
    </>
  )
}
