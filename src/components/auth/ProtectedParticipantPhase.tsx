import { Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import type { GamePhase } from '../../types'

const PHASE_TO_ROUTE: Record<GamePhase, string> = {
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

interface Props {
  allowedPhases: GamePhase[]
  children: React.ReactNode
}

/**
 * Route protection guard for participants:
 * 1. Ensures the user has a valid team session (otherwise redirects to /join).
 * 2. Ensures the user cannot manually navigate to a phase URL that is not currently active in the game.
 */
export function ProtectedParticipantPhase({ allowedPhases, children }: Props) {
  const { session, game } = useGameStore()
  const location = useLocation()

  // 1. If not registered / no active session, send to join page
  if (!session?.teamId) {
    return <Navigate to="/join" state={{ from: location.pathname }} replace />
  }

  // 2. If game is loaded, verify that current phase matches one of the allowed phases
  if (game?.id && game?.phase) {
    const isEliminatedFinalist =
      game.currentRound === 3 &&
      (game.finalistTeamIds?.length ?? 0) > 0 &&
      !game.finalistTeamIds?.includes(session.teamId)

    if (isEliminatedFinalist && location.pathname !== '/leaderboard') {
      return <Navigate to="/leaderboard" replace />
    }

    if (!allowedPhases.includes(game.phase)) {
      const targetRoute = PHASE_TO_ROUTE[game.phase] || '/lobby'
      return <Navigate to={targetRoute} replace />
    }
  }

  return <>{children}</>
}
