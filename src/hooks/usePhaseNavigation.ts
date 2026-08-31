import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import type { GamePhase } from '../types'

const PHASE_ROUTES: Record<GamePhase, string> = {
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

const IN_GAME_ROUTES = [
  '/lobby',
  '/problem-select',
  '/card-reveal',
  '/game',
  '/pitch',
  '/judging',
  '/leaderboard',
]

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
    // Only navigate if game is loaded
    if (!game?.id || !phase) return

    const currentPath = location.pathname
    // Do not redirect hosts, judges, projector, landing, or how-to-play
    if (
      currentPath === '/' ||
      currentPath === '/join' ||
      EXCLUDED_PREFIXES.some((p) => currentPath.startsWith(p))
    ) {
      return
    }

    // Only apply in-game auto navigation when user is on an in-game participant route
    const isInGamePath = IN_GAME_ROUTES.some((p) => currentPath.startsWith(p))
    if (!isInGamePath && !effectiveSession?.teamId) return

    const isEliminatedFinalist =
      currentRound === 3 &&
      (game.finalistTeamIds?.length ?? 0) > 0 &&
      effectiveSession?.teamId &&
      !game.finalistTeamIds?.includes(effectiveSession.teamId)

    const target = isEliminatedFinalist ? '/leaderboard' : PHASE_ROUTES[phase] || '/lobby'
    if (!target || currentPath === target) return

    navigate(target, { replace: true })
  }, [phase, currentRound, effectiveSession?.teamId, game?.id, game?.finalistTeamIds, navigate, location.pathname])
}

/** Auto-navigate projector — no session required, only needs game loaded. */
export function useProjectorPhaseSync() {
  const { game } = useGameStore()
  return game.phase
}
