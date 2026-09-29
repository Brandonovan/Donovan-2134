import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { useAuth } from '../../hooks/useAuth'
import { useAuthForm } from '../../hooks/useAuthForm'
import { PASSWORD_MIN_LENGTH, validateRegister } from '../../utils/validation'
import styles from '../AuthForm/AuthForm.module.css'

const INITIAL_VALUES = { fullName: '', email: '', password: '', confirmPassword: '' }

export function RegisterForm() {
  const { register } = useAuth()
  const { values, errors, submitError, isSubmitting, handleChange, handleSubmit } = useAuthForm({
    initialValues: INITIAL_VALUES,
    validate: validateRegister,
    onSubmit: ({ fullName, email, password }) => register({ fullName, email, password }),
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Nombre completo"
        name="fullName"
        value={values.fullName}
        onChange={handleChange}
        error={errors.fullName}
        autoComplete="name"
      />
      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres, con letras y números`}
        autoComplete="new-password"
      />
      <Input
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
