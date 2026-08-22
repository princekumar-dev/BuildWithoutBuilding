import { Link, useNavigate } from 'react-router-dom'
import { Trophy, ArrowRight, Sparkles } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import { toast } from '../../components/ui/Toast'

export default function HostLeaderboardPage() {
  const navigate = useNavigate()
  const { game, setGame } = useGameStore()
  useRealtimeGame()

  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const sorted = [...game.teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const top8 = sorted.slice(0, 8)

  const handleAdvanceToRound = async (roundNum: number) => {
    if (!game.id) return
    try {
      if (roundNum === 3) {
        const top8Ids = top8.map((t) => t.id)
        await api.setFinalists(game.id, top8Ids)
      }
      const updated = await api.setRound(game.id, roundNum, 'PROBLEM_REVEAL')
      setGame(updated)
      toast.success(`Advanced to Round ${roundNum}!`)
      navigate(`/host/game/${game.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Unable to advance round.')
    }
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <Link to={`/host/game/${game.id}`} className="text-xs text-bwb-muted hover:text-bwb-accent">
          ← Back to Game Control
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent">Host Panel</Badge>
              <span className="text-xs font-mono font-bold text-purple-300">
                Round {currentRound} Leaderboard
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold">Leaderboard & Tournament Operations</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/projector" target="_blank">
              <Button variant="secondary" size="sm">Projector Screen</Button>
            </Link>
            <Link to="/leaderboard" target="_blank">
              <Button size="sm">Public View</Button>
            </Link>
          </div>
        </div>

        <LeaderboardTable
          teams={game.teams}
          showMovement
          round={currentRound}
          isFinalResults={currentRound === 3}
        />

        {/* Round Progression Actions */}
        {currentRound === 1 && (
          <Card padding="lg" className="mt-6 border-bwb-accent/30 bg-gradient-to-br from-bwb-surface-2 to-bwb-surface">
            <h3 className="font-display font-bold text-base text-bwb-text mb-2 flex items-center gap-2">
              <Sparkles className="text-bwb-accent" size={18} />
              <span>Round 1 Complete (No Elimination)</span>
            </h3>
            <p className="text-xs sm:text-sm text-bwb-muted mb-4">
              All {game.teams.length} registered squads advance to Round 2 to select from the 8 Problem Statements (max 2 squads per problem).
            </p>
            <Button onClick={() => handleAdvanceToRound(2)} className="bg-bwb-accent text-bwb-bg font-bold">
              <span>Advance All Teams to Round 2</span>
              <ArrowRight size={15} className="ml-1.5" />
            </Button>
          </Card>
        )}

        {currentRound === 2 && (
          <Card padding="lg" className="mt-6 border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-bwb-surface-2 to-bwb-surface">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-bwb-text flex items-center gap-2">
                <Trophy className="text-amber-400" size={18} />
                <span>Round 2 Complete · Advance Top 8 Finalists</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {top8.length} Finalists Qualified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-bwb-muted mb-4">
              The Top 8 teams below qualify for the Grand Finals (Round 3). In Round 3, the top 4 are awarded: 1st Place (1), 2nd Place (1), 3rd Place (2).
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {top8.map((t, idx) => (
                <Badge key={t.id} variant={idx < 4 ? 'accent' : 'default'} className="text-xs font-mono">
                  #{idx + 1} {t.name} ({t.score ?? 0} pts)
                </Badge>
              ))}
            </div>
            <Button onClick={() => handleAdvanceToRound(3)} className="bg-amber-400 text-bwb-bg font-black hover:bg-amber-300">
              <Trophy size={14} className="mr-1.5" />
              <span>Launch Grand Finals (Round 3) with Top 8</span>
            </Button>
          </Card>
        )}

        {currentRound === 3 && (
          <Card padding="lg" className="mt-6 border-bwb-gold/40 bg-gradient-to-br from-amber-950/20 via-bwb-surface-2 to-bwb-surface">
            <h3 className="font-display font-bold text-lg text-bwb-text mb-2 flex items-center gap-2">
              <Trophy className="text-bwb-gold" size={20} />
              <span>Grand Finals Prize Distribution (Top 4 Awarded)</span>
            </h3>
            <p className="text-xs text-bwb-muted mb-4">
              Tournament concluded! Top 4 positions received official honors.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-amber-500/15 border border-bwb-gold text-bwb-gold font-bold">
                🥇 1st Place (1 Team)
                <p className="text-bwb-text font-sans font-bold text-sm mt-1">{top8[0]?.name || 'Pending'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-500/15 border border-slate-400 text-slate-200 font-bold">
                🥈 2nd Place (1 Team)
                <p className="text-bwb-text font-sans font-bold text-sm mt-1">{top8[1]?.name || 'Pending'}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-800/20 border border-amber-600 text-amber-400 font-bold">
                🥉 3rd Place (2 Teams)
                <p className="text-bwb-text font-sans font-bold text-xs mt-1">
                  {[top8[2]?.name, top8[3]?.name].filter(Boolean).join(' & ') || 'Pending'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}

