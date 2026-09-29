import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { LineChart } from '@/components/charts/LineChart/LineChart'
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl'
import { formatCompactCurrency, formatSignedCurrency } from '@/utils/formatCurrency'
import { formatDateTime } from '@/utils/formatDateTime'
import { formatShortDate } from '@/utils/formatDate'
import { shortenName } from '@/utils/shortenName'
import { betProfit, buildProfitSeries } from '../../utils/bets'
import styles from './ProfitHistory.module.css'

const DAY_MS = 24 * 60 * 60 * 1000

const RANGES = [
  { value: '30', label: '30 días', days: 30 },
  { value: '90', label: '90 días', days: 90 },
  { value: 'all', label: 'Todo', days: null },
]

function PointTooltip({ point }) {
  if (!point.bet) {
    return (
      <>
        <strong>Inicio del periodo</strong>
        <span>{formatShortDate(point.date)}</span>
      </>
    )
  }
  const { bet } = point
  return (
    <>
      <span className={styles.tooltipDate}>{formatDateTime(bet.placedAt)}</span>
      <strong>
        {bet.won ? '✓' : '✕'} {shortenName(bet.snail)} · {bet.race}
      </strong>
      <span>
        {bet.won ? 'Ganó' : 'Perdió'} {formatSignedCurrency(betProfit(bet))}
      </span>
      <span className={styles.tooltipTotal}>Acumulado: {formatSignedCurrency(point.value)}</span>
    </>
  )
}

export function ProfitHistory({ history }) {
  // La hora de referencia se fija al montar, para que los rangos no cambien entre renders.
  const [now] = useState(() => new Date())
  const [range, setRange] = useState('90')
  const { days } = RANGES.find((option) => option.value === range)
  const since = days ? new Date(now.getTime() - days * DAY_MS) : null

  const series = buildProfitSeries(history, since)
  const net = series.at(-1)?.value ?? 0
  const betsCount = Math.max(series.length - 1, 0)
  const isUp = net >= 0

  return (
    <ChartCard title="Tus ganancias">
      <div className={styles.header}>
        <div>
          <p className={styles.net}>{formatSignedCurrency(net)}</p>
          <p className={`${styles.delta} ${isUp ? styles.up : styles.down}`}>
            <span aria-hidden="true">{isUp ? '▲' : '▼'}</span>
            {isUp ? 'Ganancia' : 'Pérdida'} neta en {betsCount} {betsCount === 1 ? 'apuesta' : 'apuestas'}
          </p>
        </div>
        <SegmentedControl label="Periodo" options={RANGES} value={range} onChange={setRange} />
      </div>

      {series.length > 1 ? (
        <LineChart
          data={series}
          formatValue={formatSignedCurrency}
          formatAxisValue={formatCompactCurrency}
          formatDate={formatShortDate}
          positiveColor="var(--chart-win)"
          negativeColor="var(--chart-loss)"
          ariaLabel={`Ganancia acumulada: ${formatSignedCurrency(net)} en ${betsCount} apuestas`}
          renderTooltip={(point) => <PointTooltip point={point} />}
        />
      ) : (
        <p className={styles.empty}>No hiciste apuestas en este periodo.</p>
      )}
    </ChartCard>
  )
}
