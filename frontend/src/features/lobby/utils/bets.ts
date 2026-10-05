import type { Bet, ProfitPoint } from '../types'

export function betProfit({ amount, odds, won }: Pick<Bet, 'amount' | 'odds' | 'won'>): number {
  return won ? amount * (odds - 1) : -amount
}

export function computeBetStats(history: Bet[]): { won: number; lost: number } {
  const won = history.filter((bet) => bet.won).length
  return { won, lost: history.length - won }
}

// Ganancia acumulada apuesta por apuesta, empezando en 0 al inicio del periodo.
// Devuelve [{ date, value, bet }]; el primer punto (sin bet) es el arranque en $0.
export function buildProfitSeries(history: Bet[], since: Date | null = null): ProfitPoint[] {
  const bets = history
    .filter((bet) => !since || new Date(bet.placedAt) >= since)
    // getTime() explicito: restar Dates funciona por coercion, pero el tipo no
    // lo admite y esconder eso detras de un cast seria peor.
    .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime())

  const primera = bets[0]
  if (!primera) return []

  const start = since ?? new Date(primera.placedAt)
  let cumulative = 0
  return [
    { date: start, value: 0, bet: null },
    ...bets.map((bet) => {
      cumulative += betProfit(bet)
      return { date: new Date(bet.placedAt), value: Math.round(cumulative * 100) / 100, bet }
    }),
  ]
}
