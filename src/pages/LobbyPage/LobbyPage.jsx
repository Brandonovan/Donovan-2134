import { useAuth } from '@/features/auth'
import {
  BET_STATS,
  BetsSummary,
  SEASON_RESULTS,
  SeasonStandings,
  UPCOMING_RACES,
  UpcomingRaces,
} from '@/features/lobby'
import styles from './LobbyPage.module.css'

export function LobbyPage() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      <h1>¡Hola, {user.name}!</h1>
      <div className={styles.charts}>
        <BetsSummary stats={BET_STATS} />
        <SeasonStandings results={SEASON_RESULTS} />
      </div>
      <UpcomingRaces races={UPCOMING_RACES} />
    </div>
  )
}
