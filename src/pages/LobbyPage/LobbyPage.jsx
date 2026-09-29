import { useAuth } from '@/features/auth'
import { UPCOMING_RACES, UpcomingRaces } from '@/features/lobby'
import styles from './LobbyPage.module.css'

export function LobbyPage() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      <h1>¡Hola, {user.name}!</h1>
      <UpcomingRaces races={UPCOMING_RACES} />
    </div>
  )
}
