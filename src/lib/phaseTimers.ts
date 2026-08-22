import type { GamePhase } from '../types'

export type TimedPhase = Extract<GamePhase, 'BUILDING' | 'PITCHING'>

const TIMER_CHANGE_EVENT = 'bwb:phase-timer-change'

function storageKey(gameId: string, round: number) {
  return `bwb-phase-timers:${gameId}:round:${round}`
}

export function getPhaseDuration(gameId: string, round: number, phase: TimedPhase, buildMinutes: number) {
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey(gameId, round)) || '{}') as Partial<Record<TimedPhase, number>>
      if (typeof saved[phase] === 'number' && saved[phase] > 0) return saved[phase]
    } catch { /* Use the event defaults when saved settings are invalid. */ }
  }
  return phase === 'BUILDING' ? buildMinutes * 60 : 3 * 60
}

export function setPhaseDuration(gameId: string, round: number, phase: TimedPhase, seconds: number) {
  const saved = typeof window === 'undefined' ? {} : JSON.parse(window.localStorage.getItem(storageKey(gameId, round)) || '{}')
  window.localStorage.setItem(storageKey(gameId, round), JSON.stringify({ ...saved, [phase]: seconds }))
  window.dispatchEvent(new CustomEvent(TIMER_CHANGE_EVENT))
}

export { TIMER_CHANGE_EVENT }
