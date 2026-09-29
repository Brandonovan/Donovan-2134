import { Carousel } from '@/components/ui/Carousel/Carousel'
import { RaceCard } from '../RaceCard/RaceCard'
import styles from './UpcomingRaces.module.css'

export function UpcomingRaces({ races, onViewDetails }) {
  return (
    <section className={styles.section} aria-labelledby="upcoming-races-title">
      <h2 id="upcoming-races-title" className={styles.title}>
        Próximas carreras
      </h2>
      {races.length > 0 ? (
        <Carousel
          label="Próximas carreras"
          itemLabel="Carrera"
          items={races}
          getKey={(race) => race.id}
          renderItem={(race) => <RaceCard race={race} onViewDetails={onViewDetails} />}
        />
      ) : (
        <p className={styles.empty}>No hay carreras programadas por ahora.</p>
      )}
    </section>
  )
}
