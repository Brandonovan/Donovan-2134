import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { useAuth } from '../../hooks/useAuth'
import { useAuthForm } from '../../hooks/useAuthForm'
import { FIELD_LIMITS, sanitizeLogin, validateLogin } from '../../utils/validation'
import styles from '../AuthForm/AuthForm.module.css'

const INITIAL_VALUES = { email: '', password: '' }

export function LoginForm() {
  const { login } = useAuth()
  const { values, errors, submitError, isSubmitting, handleChange, handleSubmit } = useAuthForm({
    initialValues: INITIAL_VALUES,
    sanitize: sanitizeLogin,
    validate: validateLogin,
    onSubmit: login,
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        maxLength={FIELD_LIMITS.email.max}
        autoComplete="email"
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        maxLength={FIELD_LIMITS.password.max}
        autoComplete="current-password"
      />
      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
