import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { ROUTES } from '@/constants/routes'
import snailDown from '@/assets/brand/snail-down.png'
import styles from './ServiceDown.module.css'

// Dos causas distintas con el mismo aspecto pero distinto mensaje: que la
// pasarela conteste que está caída no es lo mismo que no poder alcanzarla.
// Confundirlas haría que el usuario revise su conexión cuando el problema es
// nuestro, o al revés.
const COPY = {
  major_outage: {
    title: 'SnailPay no está disponible',
    detail: 'Estamos trabajando para restablecer el servicio. Tu saldo está a salvo; inténtalo de nuevo en unos minutos.',
  },
  unreachable: {
    title: 'No pudimos conectar con SnailPay',
    detail: 'Revisa tu conexión a internet y vuelve a intentarlo. Si el problema sigue, el servicio podría estar en mantenimiento.',
  },
}

export function ServiceDown({ reason = 'major_outage', onRetry }) {
  const { title, detail } = COPY[reason] ?? COPY.major_outage

  return (
    <div className={styles.page} role="status" aria-live="polite">
      {/* El dibujo se usa como máscara para teñirlo con el color del texto
          apagado: es un estado temporal, no un error que el usuario cometió. */}
      <span
        className={styles.snail}
        style={{ maskImage: `url(${snailDown})`, WebkitMaskImage: `url(${snailDown})` }}
        aria-hidden="true"
      />

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.detail}>{detail}</p>

      <div className={styles.actions}>
        {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
        <Link to={ROUTES.LOBBY} className={styles.back}>
          Volver al lobby
        </Link>
      </div>
    </div>
  )
}
