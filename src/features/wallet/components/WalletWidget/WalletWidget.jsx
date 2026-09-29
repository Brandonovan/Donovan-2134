import snailpayIcon from '@/assets/brand/snailpay-icon.png'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './WalletWidget.module.css'

// La carga de saldo aún no está implementada: onTopUp es opcional por ahora.
export function WalletWidget({ balance, onTopUp }) {
  return (
    <div className={styles.wallet}>
      <div className={styles.balance}>
        <span className={styles.label}>Saldo</span>
        <span className={styles.amount}>{formatCurrency(balance)}</span>
      </div>
      <button type="button" className={styles.topUp} onClick={onTopUp}>
        {/* El logotipo se usa como máscara para teñirlo con el color del texto del botón. */}
        <span
          className={styles.logo}
          style={{ maskImage: `url(${snailpayIcon})`, WebkitMaskImage: `url(${snailpayIcon})` }}
          aria-hidden="true"
        />
        <span>Cargar saldo</span>
      </button>
    </div>
  )
}
