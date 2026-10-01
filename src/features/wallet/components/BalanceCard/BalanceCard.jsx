import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'
import { formatCurrency, formatSignedCurrency } from '@/utils/formatCurrency'
import styles from './BalanceCard.module.css'

function monthTotals(transactions, now) {
  const totals = { deposit: 0, withdrawal: 0 }
  transactions.forEach(({ type, amount, createdAt }) => {
    const date = new Date(createdAt)
    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      totals[type] += amount
    }
  })
  return totals
}

export function BalanceCard({ balance, transactions, loading, error, onRetry }) {
  const [now] = useState(() => new Date())
  const totals = transactions && monthTotals(transactions, now)
  const shownBalance = useAnimatedNumber(balance ?? 0)

  // Cuando el saldo cambia (tras una recarga o retiro) se muestra la diferencia
  // un momento. `key` reinicia la animación aunque el cambio se repita igual.
  const [previous, setPrevious] = useState(balance)
  const [change, setChange] = useState(null)
  if (balance !== previous) {
    setPrevious(balance)
    if (previous != null && balance != null) {
      setChange({ amount: balance - previous, key: (change?.key ?? 0) + 1 })
    }
  }

  return (
    <ChartCard title="Saldo disponible" loading={loading} error={error} onRetry={onRetry}>
      <div className={styles.content}>
        <div className={styles.amountRow}>
          <p key={`amount-${change?.key ?? 0}`} className={`${styles.amount} ${change ? styles.pulse : ''}`}>
            {formatCurrency(shownBalance)}
          </p>
          {change && (
            <span
              key={`change-${change.key}`}
              className={`${styles.change} ${change.amount >= 0 ? styles.in : styles.out}`}
              aria-hidden="true"
            >
              {formatSignedCurrency(change.amount)}
            </span>
          )}
        </div>
        <p className={styles.hint}>Listo para apostar o retirar cuando quieras.</p>
        {totals && (
          <dl className={styles.month}>
            <div>
              <dt>Recargado este mes</dt>
              <dd className={styles.in}>{formatCurrency(totals.deposit)}</dd>
            </div>
            <div>
              <dt>Retirado este mes</dt>
              <dd>{formatCurrency(totals.withdrawal)}</dd>
            </div>
          </dl>
        )}
      </div>
    </ChartCard>
  )
}
