import { apiClient } from '@/services/apiClient'
import type { BestOdd, Bet, SeasonRace, UpcomingRace } from '../types'
import { mockRequest, USE_MOCKS } from '@/services/mockRequest'
import { BEST_ODDS } from '../mocks/bestOdds'
import { BET_HISTORY } from '../mocks/betHistory'
import { SEASON_RACES } from '../mocks/seasonRaces'
import { UPCOMING_RACES } from '../mocks/upcomingRaces'

export function getBetHistory(): Promise<Bet[]> {
  return USE_MOCKS ? mockRequest(BET_HISTORY) : apiClient<Bet[]>('/me/bets')
}

export function getSeasonRaces(): Promise<SeasonRace[]> {
  return USE_MOCKS
    ? mockRequest(SEASON_RACES)
    : apiClient<SeasonRace[]>('/seasons/current/races')
}

export function getBestOdds(): Promise<BestOdd[]> {
  return USE_MOCKS ? mockRequest(BEST_ODDS) : apiClient<BestOdd[]>('/odds/best')
}

export function getUpcomingRaces(): Promise<UpcomingRace[]> {
  return USE_MOCKS
    ? mockRequest(UPCOMING_RACES)
    : apiClient<UpcomingRace[]>('/races/upcoming')
}
