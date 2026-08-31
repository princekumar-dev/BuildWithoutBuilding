import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, ArrowRight, CheckCircle2, Sparkles, Trophy, Mic, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { useGameStore } from '../../store/gameStore'
import { toast } from '../../components/ui/Toast'
import { TECHNOLOGIES, drawProblemCards } from '../../data/mockData'
import { api } from '../../lib/api'
import type { Problem } from '../../types'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'

export default function JudgeDashboardPage() {
  useRealtimeGame()
  const { game, setGame } = useGameStore()
  const [catalog, setCatalog] = useState<{ problems: Problem[] }>({ problems: [] })

  useEffect(() => {
    api.getCatalog().then(setCatalog).catch(() => {})
    if (game.id) {
      api.getGame(game.id).then(setGame).catch(() => {})
    }
  }, [game.id, setGame])

  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const scoredTeamsCount = game.teams.filter((t) => (t.score ?? 0) > 0).length
  const allScored = game.teams.length > 0 && scoredTeamsCount === game.teams.length
  const pitchedTeamIds = game.pitchedTeamIds || []

  const handleCallToPitch = async (teamId: string, teamName: string) => {
    if (!game.id) return
    try {
      const updated = await api.setCurrentPitchTeam(game.id, teamId)
      setGame(updated)
      toast.success(`${teamName} has been called to pitch!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to call team to pitch.')
    }
  }

  const handleMarkPitched = async (teamId: string, teamName: string) => {
    if (!game.id) return
    try {
      const updated = await api.markTeamPitched(game.id, teamId)
      setGame(updated)
      toast.success(`${teamName} marked as pitched.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to mark team as pitched.')
    }
  }

  const handleDismissPitch = async () => {
    if (!game.id) return
    try {
      const updated = await api.setCurrentPitchTeam(game.id, null)
      setGame(updated)
    } catch {}
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 pb-12">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={13} /> OFFICIAL JUDGING PANEL
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30">
                Round {currentRound} of 3
              </span>
              <Badge variant="accent">{game.code || 'BWB-LIVE'}</Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-bwb-text">{game.name || 'Live Competition'}</h1>
            <p className="text-bwb-muted text-sm mt-0.5">
              {currentRound === 1
                ? 'Round 1 (Open Qualifier · Zero Elimination) · Evaluate problem root cause understanding & landscape critique. All squads advance.'
                : currentRound === 2
                ? 'Round 2 (1v1 Problem Duel Showdown) · Head-to-head match per problem statement. The winner of each problem track advances as the Problem Champion (8 Finalists total).'
                : 'Round 3 (Grand Finals) · 8 Problem Champions defend live on stage. Top 4 receive Championship Honors (🥇 1st, 🥈 2nd, 🥉 Dual 3rd).'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PhaseIndicator phase={game.phase} />
            <Link to="/leaderboard">
              <Button variant="secondary" size="sm">
                <Trophy size={14} className="mr-1 text-bwb-gold" /> Standings
              </Button>
            </Link>
          </div>
        </div>

        {/* Scoring Status Hero */}
        <div className="stereo-card rounded-3xl p-6 sm:p-7 mb-8 border border-purple-500/30 relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-bwb-surface to-bwb-surface">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-purple-300 font-bold mb-1">
                ROUND {currentRound} EVALUATION PROGRESS
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-bwb-text">
                {scoredTeamsCount} of {game.teams.length} Teams Scored
              </h2>
              <p className="text-xs sm:text-sm text-bwb-muted mt-1">
                {allScored
                  ? '✓ All team scores submitted! Check the tournament leaderboard.'
                  : 'Click "Score Team" below to review each architecture submission and submit grades.'}
              </p>
            </div>

            <div className="w-full sm:w-64 bg-bwb-surface-2 p-3 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-bwb-muted">Progress</span>
                <span className="text-purple-300 font-bold">
                  {game.teams.length > 0 ? Math.round((scoredTeamsCount / game.teams.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-bwb-bg rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-bwb-accent h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${game.teams.length > 0 ? (scoredTeamsCount / game.teams.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Competing Teams Evaluation Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
              <ClipboardList size={18} className="text-purple-400" />
              Team Solution Portfolios
            </h3>
            <span className="text-xs font-mono text-bwb-muted">{game.teams.length} Teams</span>
          </div>

          {game.teams.length === 0 ? (
            <Card padding="lg" className="text-center py-12">
              <p className="text-bwb-muted">No teams in this game yet.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {game.teams.map((team, idx) => {
                const isScored = (team.score ?? 0) > 0
                const selectedProblem =
                  (game.activeProblems || []).find((p) => p.id === team.selectedProblemId) ||
                  (catalog.problems || []).find((p) => p.id === team.selectedProblemId)
                const teamTechs = (team.technologies && team.technologies.length >= 3)
                  ? team.technologies
                  : (team.selectedProblemId ? drawProblemCards(team.selectedProblemId) : [TECHNOLOGIES[0], TECHNOLOGIES[1], TECHNOLOGIES[2]])
                const submission = team.submission

                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="stereo-card rounded-3xl p-6 border border-bwb-border hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden"
                  >
                    <div>
                      {/* Team Card Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-base text-bwb-text">
                              {team.name}
                            </h4>
                            <p className="text-[11px] text-bwb-muted">
                              {team.members?.join(', ') || 'Team Members'}
                            </p>
                          </div>
                        </div>

                        {isScored ? (
                          <div className="text-right">
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-bwb-success/20 text-bwb-success border border-bwb-success/30 inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> {team.score}/100
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Pending Score
                          </span>
                        )}
                      </div>

                      {/* Selected Problem */}
                      <div className="mb-3.5 p-3 rounded-2xl bg-bwb-surface-2/80 border border-white/5">
                        <p className="text-[10px] uppercase tracking-wider text-bwb-muted font-bold mb-1">
                          Challenge Solved:
                        </p>
                        <p className="text-xs font-bold text-bwb-text leading-snug">
                          {selectedProblem ? `${selectedProblem.title} (${selectedProblem.category})` : team.selectedProblemId ? `Track ${team.selectedProblemId}` : 'Assigned Challenge'}
                        </p>
                      </div>

                      {/* 3 Assigned Technologies */}
                      <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-wider text-bwb-muted font-bold mb-1.5">
                          Assigned Tech Stack:
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {teamTechs.map((tech) => (
                            <div
                              key={tech.id}
                              className="p-2 rounded-xl bg-bwb-bg border border-white/5 flex items-center gap-1.5 text-xs text-bwb-text"
                            >
                              <span className="text-sm shrink-0">{tech.icon}</span>
                              <span className="truncate font-semibold text-[11px]">{tech.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Submission Summary Preview */}
                      {submission ? (
                        <div className="mb-5 p-3.5 rounded-2xl bg-bwb-bg/60 border border-white/5 text-xs text-bwb-muted space-y-1.5">
                          <p className="font-bold text-bwb-text text-sm mb-1">
                            💡 {submission.solutionName || 'Untitled Solution'}
                          </p>
                          <p className="line-clamp-2 leading-relaxed">
                            <span className="font-semibold text-bwb-text/80">Function: </span>
                            {submission.whatItDoes || submission.howItWorks}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-5 p-3 rounded-2xl bg-bwb-surface-2/50 text-xs text-bwb-muted italic text-center">
                          Team is actively formulating their solution...
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="space-y-2">
                      {game.currentPitchTeamId === team.id ? (
                        <div className="p-3 rounded-2xl bg-bwb-accent/15 border border-bwb-accent/40 text-center space-y-2">
                          <p className="text-xs font-mono font-bold text-bwb-accent flex items-center justify-center gap-1.5">
                            <Mic size={14} className="animate-pulse" /> NOW PITCHING ON STAGE
                          </p>
                          <div className="flex items-center gap-2">
                            <Link to={`/judge/score/${team.id}`} className="flex-1 block">
                              <Button
                                fullWidth
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                              >
                                <ClipboardList size={14} className="mr-1.5" /> Evaluate & Score
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleMarkPitched(team.id, team.name)}
                              className="bg-bwb-success hover:bg-bwb-success/80 text-bwb-bg font-bold shrink-0"
                            >
                              <Check size={14} className="mr-1" /> Done
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDismissPitch}
                              className="text-bwb-muted shrink-0 text-xs px-2"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ) : pitchedTeamIds.includes(team.id) ? (
                        <div className="flex items-center gap-2">
                          <Link to={`/judge/score/${team.id}`} className="flex-1 block">
                            <Button
                              fullWidth
                              size="sm"
                              variant={isScored ? 'secondary' : 'primary'}
                              className={!isScored ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20' : ''}
                            >
                              <ClipboardList size={15} className="mr-1.5" />
                              {isScored ? 'Edit Score' : 'Score Team'}
                              <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                          </Link>
                          <span className="px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-bwb-success/15 text-bwb-success border border-bwb-success/30 flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 size={11} /> Pitched
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {game.phase === 'PITCHING' && (
                            <Button
                              fullWidth
                              size="sm"
                              onClick={() => handleCallToPitch(team.id, team.name)}
                              className="bg-amber-500 hover:bg-amber-400 text-bwb-bg font-bold shadow-lg shadow-amber-500/20"
                            >
                              <Mic size={14} className="mr-1.5" /> Call to Pitch
                            </Button>
                          )}
                          {game.phase !== 'PITCHING' && (
                            <span className="text-xs text-bwb-muted font-mono">Waiting for Pitching Phase</span>
                          )}
                          <Link to={`/judge/score/${team.id}`} className="block">
                            <Button
                              size="sm"
                              variant="secondary"
                              className={!isScored ? 'border-purple-500/40 text-purple-300' : ''}
                            >
                              <ClipboardList size={14} />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live Leaderboard Standings */}
        <div className="mb-12">
          <h3 className="font-display font-bold text-lg text-bwb-text mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-bwb-gold" />
            Current Live Standings
          </h3>
          <Card padding="md">
            <LeaderboardTable
              teams={game.teams}
              showMovement
              round={currentRound}
              isFinalResults={currentRound === 3}
            />
          </Card>

        </div>
      </div>
    </PageLayout>
  )
}
