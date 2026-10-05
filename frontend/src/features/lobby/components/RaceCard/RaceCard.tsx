import type { UpcomingRace } from '../../types'
import { Button } from '@/components/ui/Button/Button'
import { formatDateTime } from '@/utils/formatDateTime'
import { TROPHIES } from '../../data/trophies'
import styles from './RaceCard.module.css'

type Props = {
  race: UpcomingRace
  onViewDetails?: (race: UpcomingRace) => void
}

export function RaceCard({ race, onViewDetails }: Props) {
  const trophy = TROPHIES[race.trophy]

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <time className={styles.date} dateTime={race.startsAt}>
          {formatDateTime(race.startsAt)}
        </time>
        <div className={styles.info}>
          <h3 className={styles.name}>{race.name}</h3>
          <p className={styles.participants}>{race.participants} participantes</p>
        </div>
        <p className={styles.location}>
          {race.location.city}, {race.location.venue}
        </p>
        <Button variant="secondary" className={styles.details} onClick={() => onViewDetails?.(race)}>
          Ver más detalles
        </Button>
      </div>
      {trophy && (
        <img className={styles.trophy} src={trophy.src} alt={`Trofeo: ${trophy.name}`} />
      )}
    </article>
  )
}
