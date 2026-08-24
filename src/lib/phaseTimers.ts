import type { Game, GamePhase } from '../types'

export type TimedPhase = Extract<GamePhase, 'BUILDING' | 'PITCHING' | 'JUDGE_ATTACK'>

const TIMER_CHANGE_EVENT = 'bwb:phase-timer-change'

function storageKey(gameId: string, round: number) {
  return `bwb-phase-timers:${gameId}:round:${round}`
}

export function getDefaultBuildMinutes(round: number, fallbackBuildMinutes?: number): number {
  if (round === 1) return 45
  if (round === 2) return 30
  if (round === 3) return 30
  return fallbackBuildMinutes || 45
}

export function getPhaseDuration(gameId: string, round: number, phase: TimedPhase, buildMinutes?: number) {
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey(gameId, round)) || '{}') as Partial<Record<TimedPhase, number>>
      if (typeof saved[phase] === 'number' && saved[phase] > 0) return saved[phase]
    } catch { /* Use the event defaults when saved settings are invalid. */ }
  }
  const defaultMinutes = getDefaultBuildMinutes(round, buildMinutes)
  return phase === 'BUILDING' ? defaultMinutes * 60 : phase === 'JUDGE_ATTACK' ? 30 : 3 * 60
}

export function getSyncedPhaseDuration(game: Partial<Game>, phase?: TimedPhase): number {
  if (game.phaseDurationSeconds && game.phaseDurationSeconds > 0) {
    return game.phaseDurationSeconds
  }
  const currentRound = game.currentRound || 1
  const targetPhase = (phase || game.phase || 'BUILDING') as TimedPhase
  return getPhaseDuration(game.id || '', currentRound, targetPhase, game.buildDurationMinutes)
}

export function getSyncedPhaseRemaining(game: Partial<Game>): number {
  if (game.phaseExpiresAt) {
    const targetMs = new Date(game.phaseExpiresAt).getTime()
    if (!isNaN(targetMs) && targetMs > 0) {
      return Math.max(0, Math.round((targetMs - Date.now()) / 1000))
    }
  }
  return getSyncedPhaseDuration(game)
}

export function setPhaseDuration(gameId: string, round: number, phase: TimedPhase, seconds: number) {
  const saved = typeof window === 'undefined' ? {} : JSON.parse(window.localStorage.getItem(storageKey(gameId, round)) || '{}')
  window.localStorage.setItem(storageKey(gameId, round), JSON.stringify({ ...saved, [phase]: seconds }))
  window.dispatchEvent(new CustomEvent(TIMER_CHANGE_EVENT))
}

export { TIMER_CHANGE_EVENT }

