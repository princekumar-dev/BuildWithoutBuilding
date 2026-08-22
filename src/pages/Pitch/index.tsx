import { Mic, Radio, Flame, Users, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { CountdownTimer } from '../../components/timer/CountdownTimer'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'

export default function PitchPage() {
  useRealtimeGame()
  const { game, session, demoPhase } = useGameStore()

  const currentRound = game.currentRound ?? 1
  const isAttack = demoPhase === 'JUDGE_ATTACK' || game.phase === 'JUDGE_ATTACK'
  const isJudging = demoPhase === 'JUDGING' || game.phase === 'JUDGING'

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const pitchTeam = game.teams.find((t) => t.id === game.currentPitchTeamId)
  const isMyTeamOnStage = !!pitchTeam && !!myTeam && myTeam.id === pitchTeam.id
  const submission = pitchTeam?.submission || myTeam?.submission

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto text-center px-2 sm:px-4 pb-12">
        {/* Header HUD */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
            <Radio size={13} className="text-bwb-accent animate-pulse" />
            <span>Round {currentRound} Pitch Arena</span>
          </span>
          <PhaseIndicator phase={isAttack ? 'JUDGE_ATTACK' : isJudging ? 'JUDGING' : 'PITCHING'} />
        </div>

        {/* Stage Alert Banner */}
        {isMyTeamOnStage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-bwb-accent/25 to-amber-500/25 border-2 border-bwb-gold/60 text-bwb-gold font-mono font-black text-xs sm:text-sm tracking-wider shadow-lg animate-pulse"
          >
            🔥 YOUR TEAM IS LIVE ON STAGE NOW! PRESENT TO THE JUDGES
          </motion.div>
        ) : (
          <div className="mb-6 text-xs text-bwb-muted font-mono flex items-center justify-center gap-1.5">
            <Users size={14} className="text-bwb-muted" />
            <span>Audience / Queue Mode · Next squad will be called shortly</span>
          </div>
        )}

        {/* Spotlight Presentation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stereo-card rounded-3xl p-6 sm:p-8 mb-8 border-2 border-bwb-accent/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-bwb-surface-2 via-bwb-surface to-bwb-surface"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="accent" className="font-mono text-xs font-bold px-3 py-1">
              {pitchTeam ? `On Stage: ${pitchTeam.name}` : 'Waiting for Next Team'}
            </Badge>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-black text-bwb-text mb-2">
            {submission?.solutionName || (pitchTeam ? 'System Architecture Proposal' : 'No Active Pitch')}
          </h1>
          <p className="text-bwb-muted text-xs sm:text-sm font-medium">
            {isAttack ? 'Judge Attack & Technical Defense' : isJudging ? 'Judges Submitting Rubric Scores' : pitchTeam ? '60-Second Live Elevator Pitch' : 'Next team will be called by the judge'}
          </p>
        </motion.div>

        {/* Dynamic Clocks */}
        <div className="mb-8 p-6 rounded-3xl stereo-card border border-white/5 shadow-xl">
          {isAttack ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-3 shadow-lg">
                <Flame size={28} className="animate-bounce" />
              </div>
              <p className="text-xs sm:text-sm text-bwb-text font-semibold max-w-md mx-auto mb-4">
                Judges Challenge: &ldquo;How does your architecture handle edge failure, failover resilience, and real-time scaling?&rdquo;
              </p>
              <CountdownTimer initialSeconds={20} size="xl" label="DEFENSE TIME" />
            </div>
          ) : isJudging ? (
            <div className="flex flex-col items-center py-4">
              <Sparkles size={36} className="text-purple-400 animate-spin mb-3" />
              <p className="font-display font-bold text-lg text-bwb-text mb-1">
                Judges are Evaluating
              </p>
              <p className="text-xs text-bwb-muted">
                Stand by for real-time scores and leaderboard updates.
              </p>
            </div>
          ) : (
            pitchTeam ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/40 flex items-center justify-center mb-3 shadow-lg">
                  <Mic size={28} />
                </div>
                <CountdownTimer initialSeconds={60} size="xl" label="PITCH TIME" />
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <Mic size={28} className="text-bwb-muted/40 mb-3" />
                <p className="text-sm text-bwb-muted font-mono">Waiting for judge to call a team...</p>
              </div>
            )
          )}
        </div>

        {/* Submission Details View */}
        {submission && (
          <Card padding="lg" className="text-left mb-6 border-white/5 bg-bwb-surface-2/60">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-bwb-accent mb-2">
              Architecture Summary
            </h3>
            <p className="text-xs sm:text-sm text-bwb-text/90 leading-relaxed">
              {submission.whatItDoes || submission.howItWorks || 'System formulation submitted.'}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}

