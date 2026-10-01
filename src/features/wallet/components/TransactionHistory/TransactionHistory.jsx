import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl'
import { formatSignedCurrency } from '@/utils/formatCurrency'
import { formatDateTime } from '@/utils/formatDateTime'
import styles from './TransactionHistory.module.css'

const PAGE_SIZE = 8

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'deposit', label: 'Recargas' },
  { value: 'withdrawal', label: 'Retiros' },
]

const TYPES = {
  deposit: { label: 'Recarga', icon: '↓', sign: 1 },
  withdrawal: { label: 'Retiro', icon: '↑', sign: -1 },
}

const EMPTY_MESSAGES = {
  all: 'Aún no tienes movimientos.',
  deposit: 'Aún no has hecho recargas.',
  withdrawal: 'Aún no has hecho retiros.',
}

const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })

// Agrupa por mes conservando el orden (la lista ya viene del más reciente al más antiguo).
function groupByMonth(transactions) {
  const groups = []
  transactions.forEach((transaction) => {
    const label = monthFormatter.format(new Date(transaction.createdAt))
    const last = groups.at(-1)
    if (last?.label === label) last.items.push(transaction)
    else groups.push({ label, items: [transaction] })
  })
  return groups
}

export function TransactionHistory({ transactions = [], loading, error, onRetry }) {
  const [filter, setFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const filtered = filter === 'all' ? transactions : transactions.filter(({ type }) => type === filter)
  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE)

  return (
    <ChartCard title="Historial de movimientos" loading={loading} error={error} onRetry={onRetry}>
      <div className={styles.content}>
        <SegmentedControl label="Filtrar movimientos" options={FILTERS} value={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <p className={styles.empty}>{EMPTY_MESSAGES[filter]}</p>
        ) : (
          groupByMonth(visible).map((group) => (
            <section key={group.label} className={styles.group} aria-label={group.label}>
              <h3 className={styles.month}>{group.label}</h3>
              <ul className={styles.list}>
                {group.items.map((transaction) => {
                  const type = TYPES[transaction.type]
                  return (
                    <li key={transaction.id} className={styles.row}>
                      <span className={`${styles.icon} ${styles[transaction.type]}`} aria-hidden="true">
                        {type.icon}
                      </span>
                      <div className={styles.info}>
                        <span className={styles.type}>{type.label}</span>
                        <span className={styles.meta}>
                          {transaction.method} · {formatDateTime(transaction.createdAt)}
                        </span>
                      </div>
                      <span className={`${styles.amount} ${styles[transaction.type]}`}>
                        {formatSignedCurrency(type.sign * transaction.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}

        {filtered.length > PAGE_SIZE && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
          >
            {showAll ? 'Ver menos' : `Ver los ${filtered.length} movimientos`}
          </button>
        )}
      </div>
    </ChartCard>
  )
}
