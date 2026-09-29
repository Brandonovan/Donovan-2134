import { useAuth } from '@/features/auth'
import { RaceCard, UPCOMING_RACES } from '@/features/lobby'
import styles from './LobbyPage.module.css'

export function LobbyPage() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      <header>
        <h1>¡Hola, {user.name}!</h1>
        <p className={styles.subtitle}>Estas son las próximas carreras</p>
      </header>
      <section className={styles.grid}>
        {UPCOMING_RACES.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </section>
    </div>
  )
}
