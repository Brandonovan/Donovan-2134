// Formas del dominio del lobby: apuestas, carreras y clasificación.

export type TrophyId = 'hoja' | 'arce' | 'lechuga' | 'rocio' | 'huerto' | 'musgo'

export type Bet = {
  id: number
  placedAt: string
  race: string
  snail: string
  amount: number
  // Momio decimal: lo apostado se multiplica por este número si gana.
  odds: number
  won: boolean
}

export type SeasonRace = {
  id: number
  startsAt: string
  name: string
  // Orden de llegada, del 1.º al último.
  finish: string[]
}

export type BestOdd = {
  id: number
  snail: string
  race: string
  // Momio americano, ya formateado para mostrar ("+865").
  odds: string
  payout: number
}

export type UpcomingRace = {
  id: number
  name: string
  trophy: TrophyId
  startsAt: string
  participants: number
  location: { city: string; venue: string }
}

export type Standing = {
  snail: string
  points: number
  wins: number
  seconds: number
  podiums: number
  races: number
}

// Un punto de la serie de ganancia acumulada. El primero no tiene apuesta: es
// el arranque en cero.
export type ProfitPoint = {
  date: Date
  value: number
  bet: Bet | null
}
