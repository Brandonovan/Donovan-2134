import { useId } from 'react'
import styles from './Input.module.css'

export function Input({ label, id, ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={styles.input} {...props} />
    </div>
  )
}
