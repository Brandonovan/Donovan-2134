import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { DonutChart } from '@/components/charts/DonutChart/DonutChart'
import { computeBetStats } from '../../utils/bets'

export function BetsSummary({ history = [], loading, error, onRetry }) {
  const stats = computeBetStats(history)
  const total = stats.won + stats.lost
  const winRate = total === 0 ? 0 : Math.round((stats.won / total) * 100)

  const segments = [
    { id: 'won', label: 'Ganadas', value: stats.won, color: 'var(--chart-win)', icon: '✓' },
    { id: 'lost', label: 'Perdidas', value: stats.lost, color: 'var(--chart-loss)', icon: '✕' },
  ]

  return (
    <ChartCard title="Tu porcentaje de apuestas" loading={loading} error={error} onRetry={onRetry}>
      {total > 0 ? (
        <DonutChart
          segments={segments}
          totalLabel="Apuestas en total"
          ariaLabel={`Ganaste ${stats.won} de ${total} apuestas (${winRate}%)`}
        />
      ) : (
        <p>Aún no has hecho apuestas.</p>
      )}
    </ChartCard>
  )
}
