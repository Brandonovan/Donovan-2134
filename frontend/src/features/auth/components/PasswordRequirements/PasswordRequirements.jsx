import { PASSWORD_RULES } from '../../utils/validation'
import styles from './PasswordRequirements.module.css'

export function PasswordRequirements({ password, id }) {
  return (
    <ul id={id} className={styles.list} aria-label="Requisitos de la contraseña">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.test(password)
        return (
          <li key={rule.id} className={isMet ? styles.met : styles.pending}>
            <span aria-hidden="true">{isMet ? '✓' : '•'}</span>
            {rule.label}
            <span className={styles.srOnly}>{isMet ? ' (cumplido)' : ' (pendiente)'}</span>
          </li>
        )
      })}
    </ul>
  )
}
