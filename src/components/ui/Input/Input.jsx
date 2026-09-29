import { useId } from 'react'
import styles from './Input.module.css'

export function Input({ label, id, error, hint, 'aria-describedby': describedBy, ...props }) {
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
