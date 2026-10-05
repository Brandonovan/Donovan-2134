import type { UpcomingRace } from '../../types'
import { Carousel } from '@/components/ui/Carousel/Carousel'
import { RaceCard } from '../RaceCard/RaceCard'
import styles from './UpcomingRaces.module.css'

type Props = {
  races: UpcomingRace[] | undefined
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  onViewDetails?: (race: UpcomingRace) => void
}

function Content({ races = [], loading, error, onRetry, onViewDetails }: Props) {
  if (loading) {
    return <p className={styles.empty} role="status">Cargando carreras…</p>
  }
  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>No pudimos cargar las próximas carreras.</p>
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    )
  }
  if (races.length === 0) {
    return <p className={styles.empty}>No hay carreras programadas por ahora.</p>
  }
  return (
    <Carousel
      label="Próximas carreras"
      itemLabel="Carrera"
      items={races}
      getKey={(race) => race.id}
      renderItem={(race) => <RaceCard race={race} onViewDetails={onViewDetails} />}
    />
  )
}

export function UpcomingRaces({ races = [], loading, error, onRetry, onViewDetails }: Props) {
  return (
    <section className={styles.section} aria-labelledby="upcoming-races-title" aria-busy={loading || undefined}>
      <h2 id="upcoming-races-title" className={styles.title}>
        Próximas carreras
      </h2>
      <Content
        races={races}
        loading={loading}
        error={error}
        onRetry={onRetry}
        onViewDetails={onViewDetails}
      />
    </section>
  )
}
