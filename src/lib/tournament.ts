import type { Team, Problem } from '../types'

export interface ProblemDuel {
  problemId: string
  problemTitle: string
  problemCategory: string
  problemIcon: string
  teams: Team[]
  leader: Team | null
  challenger: Team | null
  isTied: boolean
  isResolved: boolean
}

const PROBLEM_ICONS: Record<string, string> = {
  p1: '🚨', // Disaster Response
  p2: '🚦', // Urban Mobility
  p3: '💧', // Water Management
  p4: '🏥', // Healthcare
  p5: '♻️', // Waste Management
  p6: '🌾', // Agriculture
  p7: '🚌', // Public Transport
  p8: '🏙️', // Civic Infrastructure
}

export function getProblemDuels(teams: Team[], problems: Problem[]): ProblemDuel[] {
  const duels: ProblemDuel[] = []

  problems.forEach((problem) => {
    const teamsInProblem = teams.filter((t) => t.selectedProblemId === problem.id)
    
    // Sort by Round 2 score, or overall score
    const sorted = [...teamsInProblem].sort((a, b) => {
      const scoreA = a.round2Score ?? a.score ?? 0
      const scoreB = b.round2Score ?? b.score ?? 0
      return scoreB - scoreA
    })

    const leader = sorted[0] || null
    const challenger = sorted[1] || null
    const leaderScore = leader?.round2Score ?? leader?.score ?? 0
    const challengerScore = challenger?.round2Score ?? challenger?.score ?? 0
    const isTied = !!(leader && challenger && leaderScore === challengerScore && leaderScore > 0)
    const isResolved = !!(leader && challenger && leaderScore !== challengerScore && (leaderScore > 0 || challengerScore > 0))

    duels.push({
      problemId: problem.id,
      problemTitle: problem.title,
      problemCategory: problem.category,
      problemIcon: PROBLEM_ICONS[problem.id] || '⚡',
      teams: sorted,
      leader,
      challenger,
      isTied,
      isResolved,
    })
  })

  return duels
}

export function getProblemWinners(teams: Team[], problems: Problem[]): string[] {
  const is8Team = teams.length <= 8 || problems.length <= 4
  const targetFinalists = is8Team ? 4 : 8
  const duels = getProblemDuels(teams, problems)
  const winnerIds: string[] = []

  duels.forEach((duel) => {
    if (duel.leader) {
      winnerIds.push(duel.leader.id)
    }
  })

  return winnerIds.slice(0, targetFinalists)
}

export function getRound3Finalists(teams: Team[], problems: Problem[], finalistTeamIds?: string[]): Team[] {
  const is8Team = teams.length <= 8 || problems.length <= 4
  const targetFinalists = is8Team ? 4 : 8

  const duels = getProblemDuels(teams, problems)
  const winners: Team[] = []
  const eliminatedTeamIds = new Set<string>()

  // 1. In every duel with 2 competing teams, the loser is strictly eliminated!
  duels.forEach((duel) => {
    if (duel.teams.length >= 2) {
      if (duel.leader) {
        winners.push(duel.leader)
      }
      duel.teams.slice(1).forEach((t) => eliminatedTeamIds.add(t.id))
    } else if (duel.teams.length === 1 && duel.leader) {
      winners.push(duel.leader)
    }
  })

  // Deduplicate winners
  const uniqueWinners = Array.from(new Set(winners.map((w) => w.id)))
    .map((id) => teams.find((t) => t.id === id)!)
    .filter(Boolean)

  if (finalistTeamIds && finalistTeamIds.length >= targetFinalists) {
    const list = teams.filter((t) => finalistTeamIds.includes(t.id) && !eliminatedTeamIds.has(t.id))
    if (list.length >= targetFinalists) {
      return list.slice(0, targetFinalists)
    }
  }

  // 2. If fewer winners than target finalists, fill from remaining squads that were NOT eliminated in a 1v1 duel
  if (uniqueWinners.length < targetFinalists) {
    const remaining = teams
      .filter((t) => !uniqueWinners.some((w) => w.id === t.id) && !eliminatedTeamIds.has(t.id))
      .sort((a, b) => {
        const scoreA = a.round2Score ?? a.score ?? 0
        const scoreB = b.round2Score ?? b.score ?? 0
        return scoreB - scoreA
      })

    while (uniqueWinners.length < targetFinalists && remaining.length > 0) {
      const nextTeam = remaining.shift()
      if (nextTeam) uniqueWinners.push(nextTeam)
    }
  }

  return uniqueWinners.slice(0, targetFinalists)
}

export function getOpponentTeam(myTeam: Team | undefined, allTeams: Team[]): Team | null {
  if (!myTeam || !myTeam.selectedProblemId) return null
  return allTeams.find((t) => t.id !== myTeam.id && t.selectedProblemId === myTeam.selectedProblemId) || null
}
