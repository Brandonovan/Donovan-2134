import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { formatCurrency } from '@/utils/formatCurrency'
import { shortenName } from '@/utils/shortenName'
import styles from './BestOdds.module.css'

const STAKE = 100

const wholeCurrency = (amount) => formatCurrency(amount).replace(/\.00$/, '')

export function BestOdds({ odds = [], loading, error, onRetry }) {
  return (
    <ChartCard
      title="Mejores momios"
      description={`Lo que cobrarías apostando ${wholeCurrency(STAKE)}`}
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      {odds.length === 0 ? (
        <p className={styles.empty}>Aún no hay momios para las próximas carreras.</p>
      ) : (
        <ol className={styles.list}>
          {odds.map((row) => (
            <li key={row.id} className={styles.row}>
              <div className={styles.who}>
                <span className={styles.snail} title={row.snail}>
                  {shortenName(row.snail)}
                </span>
                <span className={styles.race}>{row.race}</span>
              </div>
              <span className={styles.odds}>{row.odds}</span>
              <span className={styles.payout}>{wholeCurrency(row.payout)}</span>
            </li>
          ))}
        </ol>
      )}
    </ChartCard>
  )
}
