export type GamePhase =
  | 'LOBBY'
  | 'CARD_REVEAL'
  | 'PROBLEM_REVEAL'
  | 'BUILDING'
  | 'SUBMISSION_LOCKED'
  | 'PITCHING'
  | 'JUDGE_ATTACK'
  | 'JUDGING'
  | 'LEADERBOARD'
  | 'FINAL_ROUND'
  | 'RESULTS'

export interface Technology {
  id: string
  name: string
  icon: string
  description: string
  category: string
}

export interface Problem {
  id: string
  title: string
  category: string
  description: string
  challenge?: string
  twist?: string
}

export type TournamentRound = 1 | 2 | 3

export interface Team {
  id: string
  name: string
  passcode?: string
  gameCode?: string
  gameId?: string
  leaderName?: string
  email?: string
  phone?: string
  department?: string
  year?: string
  section?: string
  members: string[]
  memberCount?: number
  registeredAt?: string
  technologies?: Technology[]
  selectedProblemId?: string
  revealedCards?: number[]
  score?: number
  round1Score?: number
  round2Score?: number
  round3Score?: number
  rank?: number
  rankChange?: number
  isFinalist?: boolean
  isProblemTrackLeader?: boolean
  problemTrackOpponentId?: string
  problemTrackOpponentName?: string
  submission?: Submission
  scoreBreakdown?: ScoreBreakdown
  isOnline?: boolean
  lastSeenAt?: string
}

export interface Submission {
  solutionName: string
  whatItDoes: string
  howItWorks: string
  techUsage: Record<string, string>
  mainAdvantage: string
  mainLimitation: string
  submittedAt?: string
}

export interface ScoreBreakdown {
  problemUnderstanding: number
  creativity: number
  technologyUsage: number
  technicalFeasibility: number
  realWorldImpact: number
  pitch: number
  defense: number
}

export interface Game {
  id: string
  code: string
  name: string
  phase: GamePhase
  currentRound: TournamentRound
  teams: Team[]
  currentProblem?: Problem
  buildDurationMinutes: number
  currentPitchTeamId?: string
  pitchedTeamIds?: string[]
  isFinalRound: boolean
  finalistTeamIds?: string[]
  problemTeamCounts?: Record<string, number>
  scheduledStartTime?: string
  maxTeams?: number
  whatsappGroupUrl?: string
  isRegistrationOpen?: boolean
  phaseStartedAt?: string | null
  phaseExpiresAt?: string | null
  phaseDurationSeconds?: number | null
  pitchStartedAt?: string | null
  pitchExpiresAt?: string | null
  pitchDurationSeconds?: number | null
  createdAt?: string
}


export interface ParticipantSession {
  name: string
  teamId: string
  teamName: string
  gameCode: string
  passcode?: string
}

