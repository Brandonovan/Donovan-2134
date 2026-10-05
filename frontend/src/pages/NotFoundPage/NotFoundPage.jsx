import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1>404</h1>
      <p>Este caracol se perdió en el camino.</p>
      <Link to={ROUTES.ROOT}>Volver al inicio</Link>
    </div>
  )
}
