import { formatDateTime } from '@/utils/formatDateTime'
import styles from './RaceCard.module.css'

export function RaceCard({ race }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.name}>{race.name}</h3>
      <p className={styles.date}>{formatDateTime(race.startsAt)}</p>
      <p className={styles.snails}>{race.snails.length} caracoles compitiendo</p>
    </article>
  )
}
