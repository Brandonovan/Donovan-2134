export function betProfit({ amount, odds, won }) {
  return won ? amount * (odds - 1) : -amount
}

export function computeBetStats(history) {
  const won = history.filter((bet) => bet.won).length
  return { won, lost: history.length - won }
}

// Ganancia acumulada apuesta por apuesta, empezando en 0 al inicio del periodo.
// Devuelve [{ date, value, bet }]; el primer punto (sin bet) es el arranque en $0.
export function buildProfitSeries(history, since = null) {
  const bets = history
    .filter((bet) => !since || new Date(bet.placedAt) >= since)
    .sort((a, b) => new Date(a.placedAt) - new Date(b.placedAt))

  if (bets.length === 0) return []

  const start = since ?? new Date(bets[0].placedAt)
  let cumulative = 0
  return [
    { date: start, value: 0, bet: null },
    ...bets.map((bet) => {
      cumulative += betProfit(bet)
      return { date: new Date(bet.placedAt), value: Math.round(cumulative * 100) / 100, bet }
    }),
  ]
}
