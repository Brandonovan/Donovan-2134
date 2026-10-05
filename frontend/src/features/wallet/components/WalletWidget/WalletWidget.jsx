import { Link } from 'react-router-dom'
import snailpayIcon from '@/assets/brand/snailpay-icon.png'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { useWallet } from '../../hooks/useWallet'
import styles from './WalletWidget.module.css'

export function WalletWidget() {
  const { wallet } = useWallet()

  return (
    <div className={styles.wallet}>
      <div className={styles.balance}>
        <span className={styles.label}>Saldo</span>
        <span className={styles.amount}>{wallet ? formatCurrency(wallet.balance) : '—'}</span>
      </div>
      <Link to={ROUTES.SNAILPAY} className={styles.topUp}>
        {/* El logotipo se usa como máscara para teñirlo con el color del texto del botón. */}
        <span
          className={styles.logo}
          style={{ maskImage: `url(${snailpayIcon})`, WebkitMaskImage: `url(${snailpayIcon})` }}
          aria-hidden="true"
        />
        <span>Cargar saldo</span>
      </Link>
    </div>
  )
}
