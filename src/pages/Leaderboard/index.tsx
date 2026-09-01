import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Trophy, Award, Swords, Layers } from 'lucide-react'
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
  const [searchParams] = useSearchParams()
  const { game, session, demoPhase } = useGameStore()
  const isResults = demoPhase === 'RESULTS' || game.phase === 'RESULTS'
  const currentRound = game.currentRound ?? 1
  const is8TeamRoom = Number(game.maxTeams) === 8 || (game.teams.length <= 8 && (game.activeProblemIds?.length === 4 || game.activeProblems?.length === 4))
  const targetFinalists = is8TeamRoom ? 4 : 8

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const isEliminatedInR2 = myTeam && !myTeam.isFinalist && currentRound >= 2
  const roundParam = searchParams.get('round') ? Number(searchParams.get('round')) : null

  const initialRound = roundParam || (isEliminatedInR2 && !isResults ? 2 : currentRound)
  const [selectedRound, setSelectedRound] = useState<number>(initialRound)

  useEffect(() => {
    if (roundParam) {
      setSelectedRound(roundParam)
    } else if (isResults) {
      setSelectedRound(3)
    }
  }, [roundParam, isResults])

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-12">
        <div className="text-center mb-6 sm:mb-8">
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
            {isResults && selectedRound === 3
              ? 'Grand Finals Championship Results'
              : selectedRound === 2
              ? 'Round 2 · Problem Showdown Duels'
              : selectedRound === 1
              ? 'Round 1 · Open Qualifier Leaderboard'
              : 'Round 3 · Grand Finals Standings'}
          </h1>
          <p className="text-bwb-muted mt-2">{game.name || 'Build Without Building Tournament'}</p>
        </div>

        {/* 3D Animated Podium for Finals / Results: ONLY during official RESULTS ceremony */}
        {isResults && selectedRound === 3 && game.teams.length > 0 && (
          <TournamentPodium teams={game.teams} />
        )}

        {/* Round Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-bwb-surface-2/80 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedRound(1)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedRound === 1
                  ? 'bg-bwb-accent text-bwb-bg shadow-sm'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-white/5'
              }`}
            >
              <Layers size={13} />
              <span>Round 1 (Open)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRound(2)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedRound === 2
                  ? 'bg-bwb-accent text-bwb-bg shadow-sm'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-white/5'
              }`}
            >
              <Swords size={13} />
              <span>Round 2 (1v1 Duels)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRound(3)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedRound === 3
                  ? 'bg-bwb-accent text-bwb-bg shadow-sm'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-white/5'
              }`}
            >
              <Trophy size={13} />
              <span>Round 3 (Finals)</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-purple-300 font-bold px-2 hidden sm:inline">
            Viewing: Round 0{selectedRound} Standings
          </span>
        </div>

        <LeaderboardTable
          teams={game.teams}
          highlightTeamId={session?.teamId}
          showMovement={!isResults && selectedRound === currentRound}
          round={selectedRound}
          isFinalResults={(isResults || currentRound === 3) && selectedRound === 3}
        />

        {/* Round Explanatory Card */}
        <Card padding="md" className="mt-6 text-center border-purple-500/20 bg-gradient-to-r from-bwb-surface via-bwb-surface-2 to-bwb-surface">
          {selectedRound === 1 ? (
            <p className="text-xs sm:text-sm text-bwb-text">
              ✨ <strong className="text-bwb-accent">Round 1 (No Elimination)</strong>: All registered teams advance to Round 2 to compete across the {targetFinalists} Problem Statements (max 2 teams per problem).
            </p>
          ) : selectedRound === 2 ? (
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

