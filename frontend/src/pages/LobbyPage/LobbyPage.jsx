import { useAuth } from '@/features/auth'
import {
  BestOdds,
  BetsSummary,
  getBestOdds,
  getBetHistory,
  getSeasonRaces,
  getUpcomingRaces,
  ProfitHistory,
  SeasonStandings,
  UpcomingRaces,
} from '@/features/lobby'
import { useRequest } from '@/hooks/useRequest'
import styles from './LobbyPage.module.css'

// Props de estado comunes para los componentes que muestran una petición.
const requestProps = ({ loading, error, retry }) => ({ loading, error, onRetry: retry })

export function LobbyPage() {
  const { user } = useAuth()
  const bets = useRequest(getBetHistory)
  const seasonRaces = useRequest(getSeasonRaces)
  const bestOdds = useRequest(getBestOdds)
  const upcomingRaces = useRequest(getUpcomingRaces)

  return (
    <div className={styles.page}>
      <h1>¡Hola, {user.name}!</h1>
      <section className={styles.grid} aria-label="Tus apuestas">
        <BetsSummary history={bets.data} {...requestProps(bets)} />
        <ProfitHistory history={bets.data} {...requestProps(bets)} />
      </section>
      <section className={styles.grid} aria-label="Temporada">
        <SeasonStandings races={seasonRaces.data} {...requestProps(seasonRaces)} />
        <BestOdds odds={bestOdds.data} {...requestProps(bestOdds)} />
      </section>
      <UpcomingRaces races={upcomingRaces.data} {...requestProps(upcomingRaces)} />
    </div>
  )
}
