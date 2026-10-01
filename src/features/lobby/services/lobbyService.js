import { apiClient } from '@/services/apiClient'
import { mockRequest, USE_MOCKS } from '@/services/mockRequest'
import { BEST_ODDS } from '../mocks/bestOdds'
import { BET_HISTORY } from '../mocks/betHistory'
import { SEASON_RACES } from '../mocks/seasonRaces'
import { UPCOMING_RACES } from '../mocks/upcomingRaces'

export function getBetHistory() {
  return USE_MOCKS ? mockRequest(BET_HISTORY) : apiClient('/me/bets')
}

export function getSeasonRaces() {
  return USE_MOCKS ? mockRequest(SEASON_RACES) : apiClient('/seasons/current/races')
}

export function getBestOdds() {
  return USE_MOCKS ? mockRequest(BEST_ODDS) : apiClient('/odds/best')
}

export function getUpcomingRaces() {
  return USE_MOCKS ? mockRequest(UPCOMING_RACES) : apiClient('/races/upcoming')
}
