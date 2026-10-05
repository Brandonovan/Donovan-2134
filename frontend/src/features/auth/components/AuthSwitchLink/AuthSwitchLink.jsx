import { Link } from 'react-router-dom'
import styles from './AuthSwitchLink.module.css'

export function AuthSwitchLink({ question, linkText, to }) {
  return (
    <p className={styles.text}>
      {question}{' '}
      <Link to={to} replace className={styles.link}>
        {linkText}
      </Link>
    </p>
  )
}
