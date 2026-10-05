import { Link } from 'react-router-dom'
import type { Route } from '@/constants/routes'
import styles from './AuthSwitchLink.module.css'

type Props = {
  question: string
  linkText: string
  to: Route
}

export function AuthSwitchLink({ question, linkText, to }: Props) {
  return (
    <p className={styles.text}>
      {question}{' '}
      <Link to={to} replace className={styles.link}>
        {linkText}
      </Link>
    </p>
  )
}
