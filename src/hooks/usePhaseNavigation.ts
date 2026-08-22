import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import type { GamePhase } from '../types'

const PHASE_ROUTES: Partial<Record<GamePhase, string>> = {
  LOBBY: '/lobby',
  PROBLEM_REVEAL: '/problem-select',
  CARD_REVEAL: '/card-reveal',
  BUILDING: '/game',
  SUBMISSION_LOCKED: '/game',
  PITCHING: '/pitch',
  JUDGE_ATTACK: '/pitch',
  JUDGING: '/judging',
  LEADERBOARD: '/leaderboard',

  FINAL_ROUND: '/leaderboard',
  RESULTS: '/leaderboard',
}

const EXCLUDED_PREFIXES = ['/host', '/judge', '/projector', '/how-to-play']

/** Auto-navigate player screens when the host changes game phase via SSE. */
export function usePhaseNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { game, session } = useGameStore()
  const phase = game.phase

  useEffect(() => {
    // Only auto-navigate active team players
    if (!session || !game.id) return

    const currentPath = location.pathname
    // Do not redirect hosts, judges, projector, landing, or how-to-play
    if (
      currentPath === '/' ||
      currentPath === '/join' ||
      EXCLUDED_PREFIXES.some((p) => currentPath.startsWith(p))
    ) {
      return
    }

    const target = PHASE_ROUTES[phase]
    if (!target || currentPath === target) return

    navigate(target, { replace: true })
  }, [phase, session, game.id, navigate, location.pathname])
}

/** Auto-navigate projector — no session required, only needs game loaded. */
export function useProjectorPhaseSync() {
  const { game } = useGameStore()
  return game.phase
}

