import { useState } from 'react'
import { BarChart } from '@/components/charts/BarChart/BarChart'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl'
import { shortenName } from '@/utils/shortenName'
import { computeStandings } from '../../utils/standings'
import styles from './SeasonStandings.module.css'

const TOP = 6

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`

const METRICS = {
  points: {
    label: 'Puntos',
    description: 'Puntaje de la temporada actual',
    format: (value) => `${value} pts`,
  },
  wins: {
    label: 'Victorias',
    description: 'Carreras terminadas en 1.er lugar',
    format: (value) => plural(value, 'victoria', 'victorias'),
  },
  podiums: {
    label: 'Podios',
    description: 'Carreras terminadas entre los 3 primeros',
    format: (value) => plural(value, 'podio', 'podios'),
  },
}

const METRIC_OPTIONS = Object.entries(METRICS).map(([value, { label }]) => ({ value, label }))

// Ordena por la métrica elegida; en empate, por puntos (el criterio oficial).
function rankBy(standings, metric) {
  return [...standings].sort((a, b) => b[metric] - a[metric] || b.points - a.points)
}

function detailsFor(row) {
  return [
    `${row.points} pts`,
    plural(row.wins, 'victoria', 'victorias'),
    plural(row.podiums, 'podio', 'podios'),
    plural(row.races, 'carrera', 'carreras'),
  ].join(' · ')
}

export function SeasonStandings({ races }) {
  const [metric, setMetric] = useState('points')
  const [showAll, setShowAll] = useState(false)

  const ranked = rankBy(computeStandings(races), metric)
  const visible = showAll ? ranked : ranked.slice(0, TOP)
  const { description, format } = METRICS[metric]

  return (
    <ChartCard title="Mejores caracoles de la temporada" description={description}>
      <div className={styles.content}>
        <SegmentedControl
          label="Ordenar por"
          options={METRIC_OPTIONS}
          value={metric}
          onChange={setMetric}
        />
        <BarChart
          ariaLabel={`Caracoles ordenados por ${METRICS[metric].label.toLowerCase()}`}
          formatValue={format}
          data={visible.map((row) => ({
            id: row.snail,
            label: shortenName(row.snail),
            fullLabel: row.snail,
            value: row[metric],
            details: detailsFor(row),
          }))}
        />
        {ranked.length > TOP && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
          >
            {showAll ? `Ver top ${TOP}` : `Ver los ${ranked.length} caracoles`}
            <span className={`${styles.chevron} ${showAll ? styles.open : ''}`} aria-hidden="true">
              ▾
            </span>
          </button>
        )}
      </div>
    </ChartCard>
  )
}
