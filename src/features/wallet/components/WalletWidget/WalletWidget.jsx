import { Logo } from '@/components/ui/Logo/Logo'
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
        <Logo brand="snailpay" variant="icon" className={styles.logo} decorative />
        <span>Cargar saldo</span>
      </button>
    </div>
  )
}
