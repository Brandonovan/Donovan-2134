import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { formatCurrency } from '@/utils/formatCurrency'
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

  return (
    <ChartCard title="Saldo disponible" loading={loading} error={error} onRetry={onRetry}>
      <div className={styles.content}>
        <p className={styles.amount}>{formatCurrency(balance ?? 0)}</p>
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
