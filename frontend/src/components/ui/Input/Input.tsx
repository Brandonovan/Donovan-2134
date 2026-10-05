import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Input.module.css'

// Hereda los atributos nativos del input y añade los suyos. Así `type`,
// `maxLength` o `autoComplete` siguen comprobándose contra el DOM real, y una
// errata como `autoCompleet` deja de compilar.
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label?: ReactNode
  id?: string
  error?: string
  hint?: ReactNode
}

export function Input({
  label,
  id,
  error,
  hint,
  'aria-describedby': describedBy,
  ...props
}: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error ?? hint
  const describedByIds = [message && messageId, describedBy].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.invalid : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByIds || undefined}
        {...props}
      />
      {message && (
        <p id={messageId} className={error ? styles.error : styles.hint}>
          {message}
        </p>
      )}
    </div>
  )
}
