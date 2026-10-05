import { Link } from 'react-router-dom'
import snailSad from '@/assets/brand/snail-sad.png'
import { ROUTES } from '@/constants/routes'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      {/* El mismo dibujo que la pantalla de servicio caído. Se usa como máscara
          para teñirlo con un color del tema en lugar de incrustarlo con el suyo. */}
      <span
        className={styles.snail}
        style={{ maskImage: `url(${snailSad})`, WebkitMaskImage: `url(${snailSad})` }}
        aria-hidden="true"
      />
      <p className={styles.code}>404</p>
      <h1 className={styles.message}>Este caracol se perdió en el camino.</h1>
      <Link to={ROUTES.ROOT} className={styles.back}>
        Volver al inicio
      </Link>
    </div>
  )
}
