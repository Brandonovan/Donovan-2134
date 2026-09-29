import { useAuth } from '@/features/auth'
import {
  BEST_ODDS,
  BET_HISTORY,
  BestOdds,
  BetsSummary,
  computeBetStats,
  ProfitHistory,
  SEASON_RACES,
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
      <section className={styles.grid} aria-label="Tus apuestas">
        <BetsSummary stats={computeBetStats(BET_HISTORY)} />
        <ProfitHistory history={BET_HISTORY} />
      </section>
      <section className={styles.grid} aria-label="Temporada">
        <SeasonStandings races={SEASON_RACES} />
        <BestOdds odds={BEST_ODDS} />
      </section>
      <UpcomingRaces races={UPCOMING_RACES} />
    </div>
  )
}
