import { Link } from 'react-router-dom'
import type { GatewayStatus } from '../../merchant/gateway'
import { Button } from '@/components/ui/Button/Button'
import { ROUTES } from '@/constants/routes'
import snailSad from '@/assets/brand/snail-sad.png'
import styles from './ServiceDown.module.css'

// Dos causas distintas con el mismo aspecto pero distinto mensaje: que la
// pasarela conteste que está caída no es lo mismo que no poder alcanzarla.
// Confundirlas haría que el usuario revise su conexión cuando el problema es
// nuestro, o al revés.
//
// Ninguno de los dos menciona el saldo a propósito. Esta pantalla aparece al
// abrir SnailPay, antes de que el usuario intente nada: tranquilizarle sobre
// un dinero por el que todavía no ha preguntado le planta la duda en vez de
// quitársela. Esa frase va en el error del diálogo, donde la duda ya existe.
const COPY: Record<Exclude<GatewayStatus, 'operational'>, { title: string; detail: string }> = {
  major_outage: {
    title: 'SnailPay no está disponible',
    detail: 'Estamos trabajando para restablecer el servicio. Inténtalo de nuevo en unos minutos.',
  },
  unreachable: {
    title: 'No pudimos conectar con SnailPay',
    detail: 'No obtuvimos respuesta del servicio. Revisa tu conexión e inténtalo de nuevo.',
  },
}

type Props = {
  reason?: Exclude<GatewayStatus, 'operational'>
  onRetry?: () => void
}

export function ServiceDown({ reason = 'major_outage', onRetry }: Props) {
  const { title, detail } = COPY[reason] ?? COPY.major_outage

  return (
    <div className={styles.page} role="status" aria-live="polite">
      {/* El dibujo se usa como máscara para teñirlo con el color del texto
          apagado: es un estado temporal, no un error que el usuario cometió. */}
      <span
        className={styles.snail}
        style={{ maskImage: `url(${snailSad})`, WebkitMaskImage: `url(${snailSad})` }}
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
