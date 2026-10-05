// Sistema de puntos de la Fórmula 1: del 1.º al 10.º lugar (con 6 caracoles, puntúan todos).
export const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

export function pointsForPosition(position) {
  return F1_POINTS[position - 1] ?? 0
}

// races: [{ finish: [1.º, 2.º, …] }] → [{ snail, positions: [posición en cada carrera] }]
function positionsBySnail(races) {
  const bySnail = new Map()
  races.forEach(({ finish }) => {
    finish.forEach((snail, index) => {
      if (!bySnail.has(snail)) bySnail.set(snail, [])
      bySnail.get(snail).push(index + 1)
    })
  })
  return [...bySnail].map(([snail, positions]) => ({ snail, positions }))
}

// Igual que en la F1: ordena por puntos y desempata por victorias y después por segundos lugares.
export function computeStandings(races) {
  return positionsBySnail(races)
    .map(({ snail, positions }) => {
      const finished = positions.filter((position) => position != null)
      return {
        snail,
        points: finished.reduce((sum, position) => sum + pointsForPosition(position), 0),
        wins: finished.filter((position) => position === 1).length,
        seconds: finished.filter((position) => position === 2).length,
        podiums: finished.filter((position) => position <= 3).length,
        races: finished.length,
      }
    })
    .sort((a, b) => b.points - a.points || b.wins - a.wins || b.seconds - a.seconds)
}
