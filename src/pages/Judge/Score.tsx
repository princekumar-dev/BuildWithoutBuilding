import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Layers, Award, FileText } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { ScoreForm } from '../../components/forms/ScoreForm'
import { useGameStore } from '../../store/gameStore'
import { toast } from '../../components/ui/Toast'
import { api } from '../../lib/api'
import type { Problem, ScoreBreakdown } from '../../types'
import { TECHNOLOGIES } from '../../data/mockData'

export default function JudgeScorePage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { game, setGame } = useGameStore()
  const [catalog, setCatalog] = useState<{ problems: Problem[] }>({ problems: [] })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getCatalog().then(setCatalog).catch(() => {})
    if (game.id) {
      api.getGame(game.id).then(setGame).catch(() => {})
    }
  }, [game.id, setGame])

  const team = game.teams.find((t) => t.id === teamId) ?? game.teams[0]

  if (!team) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-12 text-center">
          <p className="text-bwb-muted mb-4">Team not found in this game session.</p>
          <Link to="/judge/dashboard" className="text-bwb-accent">
            ← Back to Judge Dashboard
          </Link>
        </div>
      </PageLayout>
    )
  }

  const selectedProblem = catalog.problems.find((p) => p.id === team.selectedProblemId)
  const teamTechs = (team.technologies && team.technologies.length >= 3)
    ? team.technologies
    : [TECHNOLOGIES[0], TECHNOLOGIES[1], TECHNOLOGIES[2]]
  const submission = team.submission

  const handleScoreSubmit = async (scores: ScoreBreakdown) => {
    if (!game.id || !team.id || submitting) return
    setSubmitting(true)
    try {
      const updatedGame = await api.score(game.id, team.id, scores)
      setGame(updatedGame)
      const total = Object.values(scores).reduce((a, b) => a + b, 0)
      toast.success(`Score of ${total}/100 recorded for ${team.name}!`)
      navigate('/judge/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to submit score.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 pb-12">
        <Link
          to="/judge/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-bwb-muted hover:text-purple-400 transition-colors mb-4"
        >
          <ChevronLeft size={16} /> Back to Judge Dashboard
        </Link>

        {/* Header Banner */}
        <div className="stereo-card rounded-3xl p-6 sm:p-7 mb-6 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-bwb-surface to-bwb-surface">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  OFFICIAL EVALUATION
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30">
                  Round {game.currentRound || (game.isFinalRound ? 3 : 1)}
                </span>
                <span className="text-xs font-mono text-bwb-muted">{game.code}</span>
              </div>
              <h1 className="font-display text-3xl font-black text-bwb-text">{team.name}</h1>
              <p className="text-xs text-bwb-muted mt-0.5">
                Members: {team.members?.join(', ') || 'Anonymous Team'}
              </p>
            </div>

            {team.score ? (
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono text-bwb-muted font-bold">Current Grade</p>
                <span className="font-display text-3xl font-black text-bwb-success">
                  {team.score}<span className="text-sm text-bwb-muted font-normal">/100</span>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Challenge & Tech Constraints Portfolio */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl stereo-card border border-white/10 bg-bwb-surface-2/80">
            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1 flex items-center gap-1">
              <span>📌</span> Assigned Challenge:
            </p>
            <h4 className="font-display font-bold text-sm text-bwb-text mb-1">
              {selectedProblem?.title ?? 'Emergency Response Scenario'}
            </h4>
            <p className="text-xs text-bwb-muted line-clamp-3 leading-relaxed">
              {selectedProblem?.description ?? 'Architecture formulation for rapid emergency deployment.'}
            </p>
            {selectedProblem?.twist && (
              <p className="text-[11px] text-bwb-warn mt-2 font-medium">
                ⚡ Twist: {selectedProblem.twist}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl stereo-card border border-white/10 bg-bwb-surface-2/80">
            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-2 flex items-center gap-1">
              <Layers size={12} /> Assigned 3 Tech Cards:
            </p>
            <div className="space-y-1.5">
              {teamTechs.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-2 rounded-xl bg-bwb-bg border border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tech.icon}</span>
                    <span className="font-bold text-bwb-text">{tech.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {tech.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Team Solution Submission */}
        {submission && (
          <Card padding="lg" className="mb-8 border-purple-500/30">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FileText className="text-purple-400" size={18} />
              <h3 className="font-display font-bold text-lg text-bwb-text">
                Architecture Submission: {submission.solutionName || 'Untitled Solution'}
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-bwb-surface-2/90 border border-white/5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-bwb-accent mb-1">
                  1. What does your solution do? (Core Function)
                </p>
                <p className="text-bwb-text/90 leading-relaxed font-medium">
                  {submission.whatItDoes || 'No description provided.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-bwb-surface-2/90 border border-white/5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-bwb-accent mb-1">
                  2. How does it work? (Architecture & Flow)
                </p>
                <p className="text-bwb-text/90 leading-relaxed font-medium">
                  {submission.howItWorks || 'No architecture flow provided.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-bwb-surface-2 border border-white/5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-bwb-success mb-1">
                    Key Advantage
                  </p>
                  <p className="text-bwb-text/90 leading-relaxed">
                    {submission.mainAdvantage || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-bwb-surface-2 border border-white/5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-bwb-warn mb-1">
                    Main Limitation
                  </p>
                  <p className="text-bwb-text/90 leading-relaxed">
                    {submission.mainLimitation || '—'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 7-Criteria Official Rubric Score Form */}
        <Card glow padding="lg" className="border-purple-500/40">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
            <Award className="text-purple-400" size={20} />
            <div>
              <h2 className="font-display font-bold text-lg text-bwb-text">
                Evaluation Rubric (100 Points Total)
              </h2>
              <p className="text-xs text-bwb-muted">
                Adjust points per dimension based on feasibility, innovation, and defense.
              </p>
            </div>
          </div>

          <ScoreForm
            teamName={team.name}
            onSubmit={handleScoreSubmit}
            round={game.currentRound || 1}
          />
        </Card>
      </div>
    </PageLayout>
  )
}
