import snailpayLogo from '@/assets/brand/snailpay.png'
import styles from './SnailPayLoader.module.css'

// Pantalla de carga de SnailPay. Aparece con un pequeño retraso (en CSS)
// para no parpadear cuando la respuesta llega casi de inmediato.
export function SnailPayLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      {/* El logotipo se usa como máscara para teñirlo con el dorado de la marca. */}
      <span
        className={styles.logo}
        style={{ maskImage: `url(${snailpayLogo})`, WebkitMaskImage: `url(${snailpayLogo})` }}
        aria-hidden="true"
      />
      <div className={styles.track} aria-hidden="true">
        <span className={styles.bar} />
      </div>
      <p className={styles.title}>Conectando con SnailPay…</p>
      <p className={styles.subtitle}>Estamos preparando tu billetera de forma segura.</p>
    </div>
  )
}
