import { Trophy, Award } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { TournamentPodium } from '../../components/leaderboard/TournamentPodium'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { usePhaseNavigation } from '../../hooks/usePhaseNavigation'

export default function LeaderboardPage() {
  usePhaseNavigation()
  useRealtimeGame()
  const { game, session, demoPhase } = useGameStore()
  const isResults = demoPhase === 'RESULTS' || game.phase === 'RESULTS'
  const currentRound = game.currentRound ?? 1
  const is8TeamRoom = Number(game.maxTeams) === 8 || (game.teams.length <= 8 && (game.activeProblemIds?.length === 4 || game.activeProblems?.length === 4))
  const targetFinalists = is8TeamRoom ? 4 : 8

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {currentRound === 1
                ? 'Round 1 · Open Qualifier (No Elimination)'
                : currentRound === 2
                ? `Round 2 · Problem Showdown (Top ${targetFinalists} Qualify)`
                : 'Round 3 · Grand Finals (Top 4 Prized)'}
            </span>
            <PhaseIndicator phase={isResults ? 'RESULTS' : game.phase} />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-black flex items-center justify-center gap-3 text-gradient">
            <Trophy className="text-bwb-gold" size={42} />
            {isResults || currentRound === 3 ? 'Grand Finals Championship Results' : `Round ${currentRound} Leaderboard`}
          </h1>
          <p className="text-bwb-muted mt-2">{game.name || 'Build Without Building Tournament'}</p>
        </div>

        {/* 3D Animated Podium for Finals / Results */}
        {(isResults || currentRound === 3) && game.teams.length > 0 && (
          <TournamentPodium teams={game.teams} />
        )}

        <LeaderboardTable
          teams={game.teams}
          highlightTeamId={session?.teamId}
          showMovement={!isResults}
          round={currentRound}
          isFinalResults={isResults || currentRound === 3}
        />

        {/* Round Explanatory Card */}
        <Card padding="md" className="mt-6 text-center border-purple-500/20 bg-gradient-to-r from-bwb-surface via-bwb-surface-2 to-bwb-surface">
          {currentRound === 1 ? (
            <p className="text-xs sm:text-sm text-bwb-text">
              ✨ <strong className="text-bwb-accent">Round 1 (No Elimination)</strong>: All registered teams advance to Round 2 to compete across the {targetFinalists} Problem Statements (max 2 teams per problem).
            </p>
          ) : currentRound === 2 ? (
            <p className="text-xs sm:text-sm text-bwb-text">
              ⚡ <strong className="text-emerald-400">Round 2 Showdown</strong>: The <strong className="text-bwb-accent">Top {targetFinalists} Problem Champions</strong> on this leaderboard advance to the Grand Finals (Round 3).
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono font-bold text-bwb-text">
              <span className="flex items-center gap-1 text-bwb-gold"><Trophy size={14} /> 1st: Champion (1)</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300"><Award size={14} /> 2nd: Runner-Up (1)</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-400"><Award size={14} /> 3rd: Dual Bronze (2)</span>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}

