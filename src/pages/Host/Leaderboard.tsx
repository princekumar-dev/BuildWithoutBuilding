import { Link, useNavigate } from 'react-router-dom'
import { Trophy, ArrowRight, Sparkles, ChevronLeft, ExternalLink, Globe } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { PageTransition } from '../../components/ui/PageTransition'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import { toast } from '../../components/ui/Toast'

export default function HostLeaderboardPage() {
  const navigate = useNavigate()
  const { game, setGame } = useGameStore()
  useRealtimeGame()

  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const is8TeamRoom = Number(game.maxTeams) === 8 || (game.teams.length <= 8 && (game.activeProblemIds?.length === 4 || game.activeProblems?.length === 4))
  const targetFinalists = is8TeamRoom ? 4 : 8

  const sorted = [...game.teams].sort((a, b) => (b.round3Score ?? b.score ?? 0) - (a.round3Score ?? a.score ?? 0))
  const finalistIds = game.finalistTeamIds && game.finalistTeamIds.length > 0
    ? game.finalistTeamIds
    : [...game.teams].sort((a, b) => (b.round2Score ?? b.score ?? 0) - (a.round2Score ?? a.score ?? 0)).slice(0, targetFinalists).map((t) => t.id)
  const qualifyingFinalists = game.teams.filter((t) => finalistIds.includes(t.id))

  const handleAdvanceToRound = async (roundNum: number) => {
    if (!game.id) return
    try {
      if (roundNum === 3) {
        await api.setFinalists(game.id, finalistIds)
      }
      const updated = await api.setRound(game.id, roundNum, 'LOBBY')
      setGame(updated)
      toast.success(`Advanced to Round ${roundNum} Lobby!`)
      navigate(`/host/game/${game.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Unable to advance round.')
    }
  }

  return (
    <PageLayout fullWidth className="host-mobile-view">
      <PageTransition className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-12">
        {/* Top Breadcrumb & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <Link
            to={`/host/game/${game.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-bwb-muted hover:text-bwb-accent transition-colors font-medium py-1"
          >
            <ChevronLeft size={16} /> Back to Game Control
          </Link>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <Link to="/projector" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs justify-center border border-white/10">
                <ExternalLink size={14} className="mr-1 text-bwb-accent" /> Projector Screen
              </Button>
            </Link>
            <Link to="/leaderboard" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto text-xs justify-center bg-bwb-accent text-bwb-bg font-bold">
                <Globe size={14} className="mr-1" /> Public View
              </Button>
            </Link>
          </div>
        </div>

        {/* Header HUD */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="accent">Host Panel</Badge>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              Round {currentRound} Leaderboard
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-bwb-text tracking-tight">
            Leaderboard & Tournament Operations
          </h1>
        </div>

        <LeaderboardTable
          teams={game.teams}
          showMovement
          round={currentRound}
          isFinalResults={currentRound === 3}
        />

        {/* Round Progression Actions */}
        {currentRound === 1 && (
          <Card padding="md" className="mt-5 sm:mt-6 sm:p-6 border-bwb-accent/30 bg-gradient-to-br from-bwb-surface-2 to-bwb-surface shadow-xl">
            <h3 className="font-display font-bold text-base sm:text-lg text-bwb-text mb-2 flex items-center gap-2">
              <Sparkles className="text-bwb-accent" size={18} />
              <span>Round 1 Complete (No Elimination)</span>
            </h3>
            <p className="text-xs sm:text-sm text-bwb-muted mb-4 leading-relaxed">
              All {game.teams.length} registered squads advance to Round 2 to select from the 8 Problem Statements (max 2 squads per problem). The room will transition directly to the Round 2 Lobby.
            </p>
            <Button
              onClick={() => handleAdvanceToRound(2)}
              className="w-full sm:w-auto bg-bwb-accent text-bwb-bg font-bold shadow-lg shadow-bwb-accent/20 justify-center"
            >
              <span>Advance All Teams to Round 2 (Lobby)</span>
              <ArrowRight size={15} className="ml-1.5" />
            </Button>
          </Card>
        )}

        {currentRound === 2 && (
          <Card padding="md" className="mt-5 sm:mt-6 sm:p-6 border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-bwb-surface-2 to-bwb-surface shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-bwb-text flex items-center gap-2">
                <Trophy className="text-amber-400" size={18} />
                <span>Round 2 Complete · Advance Top {targetFinalists} Problem Champions</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                {qualifyingFinalists.length} Champions Qualified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-bwb-muted mb-4 leading-relaxed">
              The Top {targetFinalists} Problem Champions below qualify for the Grand Finals (Round 3). In Round 3, the top 4 are awarded podium trophies: 1st Place (1), 2nd Place (1), and Dual 3rd Place (2).
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
              {qualifyingFinalists.map((t, idx) => (
                <Badge key={t.id} variant={idx < 4 ? 'accent' : 'default'} className="text-[11px] font-mono py-1 px-2.5">
                  #{idx + 1} {t.name} ({t.round2Score ?? t.score ?? 0} pts)
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => handleAdvanceToRound(3)}
              className="w-full sm:w-auto bg-amber-400 text-bwb-bg font-black hover:bg-amber-300 shadow-lg shadow-amber-400/20 justify-center"
            >
              <Trophy size={14} className="mr-1.5" />
              <span>Launch Grand Finals (Round 3 Lobby) with Top {targetFinalists}</span>
            </Button>
          </Card>
        )}

        {currentRound === 3 && (
          <Card padding="md" className="mt-5 sm:mt-6 sm:p-6 border-bwb-gold/40 bg-gradient-to-br from-amber-950/20 via-bwb-surface-2 to-bwb-surface shadow-xl">
            <h3 className="font-display font-bold text-base sm:text-lg text-bwb-text mb-2 flex items-center gap-2">
              <Trophy className="text-bwb-gold" size={20} />
              <span>Grand Finals Prize Distribution (Top 4 Awarded)</span>
            </h3>
            <p className="text-xs text-bwb-muted mb-4">
              Tournament concluded! Top 4 positions received official honors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-bwb-gold text-bwb-gold font-bold">
                🥇 1st Place (1 Team)
                <p className="text-bwb-text font-sans font-bold text-sm mt-1">{sorted[0]?.name || 'Pending'}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-500/15 border border-slate-400 text-slate-200 font-bold">
                🥈 2nd Place (1 Team)
                <p className="text-bwb-text font-sans font-bold text-sm mt-1">{sorted[1]?.name || 'Pending'}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-800/20 border border-amber-600 text-amber-400 font-bold">
                🥉 3rd Place (2 Teams)
                <p className="text-bwb-text font-sans font-bold text-xs mt-1">
                  {[sorted[2]?.name, sorted[3]?.name].filter(Boolean).join(' & ') || 'Pending'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </PageTransition>
    </PageLayout>
  )
}

