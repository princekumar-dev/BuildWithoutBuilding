import { PHASE_LABELS } from '../../data/mockData'
import type { GamePhase } from '../../types'
import { Badge } from './Badge'

interface PhaseIndicatorProps {
  phase: GamePhase
  className?: string
}

const phaseVariants: Partial<Record<GamePhase, 'default' | 'accent' | 'warn' | 'purple' | 'success' | 'danger'>> = {
  BUILDING: 'warn',
  PITCHING: 'accent',
  JUDGE_ATTACK: 'danger',
  JUDGING: 'purple',
  LEADERBOARD: 'success',
  RESULTS: 'success',
}

export function PhaseIndicator({ phase, className = '' }: PhaseIndicatorProps) {
  return (
    <Badge variant={phaseVariants[phase] ?? 'default'} className={className}>
      {PHASE_LABELS[phase] ?? phase}
    </Badge>
  )
}
