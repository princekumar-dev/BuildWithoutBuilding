import { motion } from 'framer-motion'
import { Sparkles, Award, CheckCircle2, Shield, Brain, Cpu, Lightbulb, Compass, Zap, Target } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { useGameStore } from '../../store/gameStore'
import { usePhaseNavigation } from '../../hooks/usePhaseNavigation'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { getScoringCriteriaForRound } from '../../data/mockData'

const ICON_MAP: Record<string, typeof Brain> = {
  problemUnderstanding: Brain,
  technicalFeasibility: Cpu,
  creativity: Lightbulb,
  technologyUsage: Zap,
  pitch: Compass,
  defense: Shield,
  realWorldImpact: Target,
}

export default function JudgingPage() {
  usePhaseNavigation()
  useRealtimeGame()
  const { game, session } = useGameStore()

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const currentRound = game.currentRound ?? 1
  const scoredCount = game.teams.filter((t) => (t.score ?? 0) > 0).length
  const totalTeams = game.teams.length || 1
  const progressPercent = Math.round((scoredCount / totalTeams) * 100)
  const currentCriteria = getScoringCriteriaForRound(currentRound)

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-12">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={13} className="animate-spin text-purple-400" />
                <span>Round {currentRound} · Judging Deliberation Phase</span>
              </span>
              <Badge variant="accent">{game.code || 'BWB-LIVE'}</Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-bwb-text">{game.name || 'Tournament Arena'}</h1>
            <p className="text-bwb-muted text-xs sm:text-sm mt-0.5">
              Judges are evaluating solution proposals, grading technical rubrics, and computing final standings.
            </p>
          </div>
          <PhaseIndicator phase={game.phase} />
        </div>

        {/* Stadium Deliberation Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="stereo-card rounded-3xl p-6 sm:p-8 mb-8 border-2 border-purple-500/40 relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-bwb-surface-2 to-bwb-surface shadow-2xl text-center"
        >
          {/* Pulsing Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center mb-4 shadow-xl">
              <Award size={42} className="text-purple-300 animate-bounce" />
            </div>

            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase tracking-widest mb-2">
              ⚖️ Official Judging Deliberation
            </span>

            <h2 className="font-display font-black text-2xl sm:text-4xl text-bwb-text mb-3">
              Scores Being Finalized
            </h2>

            <p className="text-xs sm:text-sm text-bwb-muted max-w-md mx-auto mb-6">
              The jury panel is reviewing your architecture diagrams, feasibility constraints, and oral defense. Stand by for the live leaderboard reveal!
            </p>

            {/* Deliberation Progress Bar */}
            <div className="w-full max-w-md bg-bwb-surface p-4 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-bwb-muted font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  Evaluation Status
                </span>
                <span className="text-purple-300 font-bold">
                  {scoredCount} / {totalTeams} Squads Evaluated ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-bwb-bg rounded-full h-3.5 overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-r from-purple-500 via-bwb-accent to-pink-500 h-full rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5 Scoring Rubric Dimensions Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-bwb-text flex items-center gap-2">
              <CheckCircle2 size={18} className="text-bwb-accent" />
              Jury Evaluation Rubric Dimensions (100 Points Total)
            </h3>
            <span className="text-xs font-mono text-bwb-muted">7 Evaluation Criteria</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentCriteria.map((criterion, idx) => {
              const IconComp = ICON_MAP[criterion.key] || Award
              return (
                <motion.div
                  key={criterion.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex items-start gap-3 backdrop-blur-md"
                >
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                    <IconComp size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-bwb-text leading-snug">
                      {criterion.label}
                    </h4>
                    {criterion.desc && (
                      <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                        {criterion.desc}
                      </p>
                    )}
                    <span className="text-xs font-mono font-bold text-purple-300 mt-1 block">
                      Up to {criterion.max} Pts
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* My Team's Proposal Confirmation */}
        {myTeam && (
          <Card padding="lg" className="border-white/10 bg-bwb-surface-2/70">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-bwb-accent uppercase tracking-wider">
                Submitted Strategy: {myTeam.name}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Under Review
              </span>
            </div>
            <p className="font-display font-bold text-lg text-bwb-text mb-1">
              {myTeam.submission?.solutionName || 'Architecture Formulation'}
            </p>
            <p className="text-xs text-bwb-muted leading-relaxed">
              {myTeam.submission?.whatItDoes || myTeam.submission?.howItWorks || 'Solution architecture sealed for jury evaluation.'}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
