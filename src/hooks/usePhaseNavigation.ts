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

/** Auto-navigate player screens when the host changes game phase or round via SSE. */
export function usePhaseNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { game, session } = useGameStore()
  const phase = game.phase
  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)

  const effectiveSession = (() => {
    if (session?.teamId) return session
    try {
      const raw = localStorage.getItem('bwb_game_storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        return parsed.state?.session || null
      }
    } catch {}
    return null
  })()

  useEffect(() => {
    // Only auto-navigate active team players
    if (!effectiveSession?.teamId || !game?.id) return

    const currentPath = location.pathname
    // Do not redirect hosts, judges, projector, landing, or how-to-play
    if (
      currentPath === '/' ||
      currentPath === '/join' ||
      EXCLUDED_PREFIXES.some((p) => currentPath.startsWith(p))
    ) {
      return
    }

    const isEliminatedFinalist =
      currentRound === 3 &&
      (game.finalistTeamIds?.length ?? 0) > 0 &&
      !game.finalistTeamIds?.includes(effectiveSession.teamId)
    const target = isEliminatedFinalist ? '/leaderboard' : PHASE_ROUTES[phase]
    if (!target || currentPath === target) return

    navigate(target, { replace: true })
  }, [phase, currentRound, effectiveSession?.teamId, game?.id, game?.finalistTeamIds, navigate, location.pathname])
}

/** Auto-navigate projector — no session required, only needs game loaded. */
export function useProjectorPhaseSync() {
  const { game } = useGameStore()
  return game.phase
}
