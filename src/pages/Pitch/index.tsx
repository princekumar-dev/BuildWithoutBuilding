import { useState, useEffect } from 'react'
import { Mic, Radio, Flame, Users, Sparkles, Trophy, Lightbulb, Target, Crown, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { CountdownTimer } from '../../components/timer/CountdownTimer'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { LivePitchDeck } from '../../components/pitch/LivePitchDeck'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { PHASE_LABELS } from '../../data/mockData'
import { api } from '../../lib/api'
import type { GamePhase, Problem } from '../../types'

const PHASE_CONFIG: Record<string, { icon: typeof Mic; color: string; bgColor: string; borderColor: string; label: string; description: string }> = {
  LOBBY: { icon: Users, color: 'text-bwb-muted', bgColor: 'bg-bwb-surface-2', borderColor: 'border-bwb-border', label: 'Waiting for Teams', description: 'Teams are joining the arena. The host will start the round shortly.' },
  PROBLEM_REVEAL: { icon: Lightbulb, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', label: 'Challenge Selection', description: 'Problem statements are being revealed. Teams will select their challenge track.' },
  CARD_REVEAL: { icon: Zap, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', label: 'Tech Card Draft', description: 'Surprise technology cards are being dealt. Review your assigned tech stack.' },
  BUILDING: { icon: Target, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', label: 'Build Sprint Active', description: 'Solution formulation phase is live. Draft your system architecture.' },
  PITCHING: { icon: Mic, color: 'text-bwb-accent', bgColor: 'bg-bwb-accent/10', borderColor: 'border-bwb-accent/30', label: 'Live Pitching', description: 'Teams present their solutions to the judges in real-time.' },
  JUDGE_ATTACK: { icon: Flame, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', label: 'Defense Challenge', description: 'Judges are challenging teams with tough technical questions.' },
  JUDGING: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', label: 'Evaluation in Progress', description: 'Judges are scoring all team submissions. Stand by for results.' },
  LEADERBOARD: { icon: Trophy, color: 'text-bwb-gold', bgColor: 'bg-amber-500/10', borderColor: 'border-bwb-gold/30', label: 'Rankings Published', description: 'Final standings are live. Check the tournament scoreboard.' },
  RESULTS: { icon: Crown, color: 'text-bwb-gold', bgColor: 'bg-amber-500/10', borderColor: 'border-bwb-gold/30', label: 'Championship Results', description: 'The tournament champion has been crowned.' },
}

export default function PitchPage() {
  useRealtimeGame()
  const { game, session } = useGameStore()
  const [problems, setProblems] = useState<Problem[]>([])

  useEffect(() => {
    api.getCatalog().then((c) => setProblems(c.problems)).catch(() => {})
  }, [])

  const currentRound = game.currentRound ?? 1
  const phase = game.phase as GamePhase
  const isAttack = phase === 'JUDGE_ATTACK'
  const isJudging = phase === 'JUDGING'
  const isPitching = phase === 'PITCHING'
  const isLeaderboard = phase === 'LEADERBOARD'
  const isResults = phase === 'RESULTS'
  const isProblemReveal = phase === 'PROBLEM_REVEAL'
  const isCardReveal = phase === 'CARD_REVEAL'
  const isBuilding = phase === 'BUILDING'

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const pitchTeam = game.teams.find((t) => t.id === game.currentPitchTeamId)
  const isMyTeamOnStage = !!pitchTeam && !!myTeam && myTeam.id === pitchTeam.id
  const submission = pitchTeam?.submission || myTeam?.submission
  const myScore = myTeam?.score ?? 0
  const myRank = myTeam?.rank

  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.LOBBY
  const PhaseIcon = config.icon

  const scoredCount = game.teams.filter((t) => (t.score ?? 0) > 0).length
  const totalTeams = game.teams.length

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto text-center px-2 sm:px-4 pb-12">
        {/* Header HUD */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${config.bgColor} ${config.color} border ${config.borderColor} flex items-center gap-1.5 shadow-sm`}>
            <Radio size={13} className="animate-pulse" />
            <span>Round {currentRound} &middot; {PHASE_LABELS[phase] || phase}</span>
          </span>
          <PhaseIndicator phase={phase} />
        </div>

        {/* Phase-Specific Alert Banner */}
        {isMyTeamOnStage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-bwb-accent/25 to-amber-500/25 border-2 border-bwb-gold/60 text-bwb-gold font-mono font-black text-xs sm:text-sm tracking-wider shadow-lg animate-pulse"
          >
            YOUR TEAM IS LIVE ON STAGE NOW! PRESENT TO THE JUDGES
          </motion.div>
        ) : isLeaderboard || isResults ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-bwb-gold/20 to-amber-500/20 border-2 border-bwb-gold/40 text-bwb-gold font-mono font-bold text-xs sm:text-sm tracking-wider shadow-lg"
          >
            {isResults ? 'FINAL CHAMPIONSHIP RESULTS' : 'TOURNAMENT STANDINGS LIVE'}
          </motion.div>
        ) : isJudging ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-2xl bg-purple-500/15 border-2 border-purple-500/40 text-purple-300 font-mono font-bold text-xs sm:text-sm tracking-wider shadow-lg"
          >
            JUDGES ARE EVALUATING ALL SUBMISSIONS
          </motion.div>
        ) : isProblemReveal ? (
          <div className="mb-6 text-xs text-amber-400 font-mono flex items-center justify-center gap-1.5">
            <Lightbulb size={14} />
            <span>8 problem statements revealed. Select your challenge track.</span>
          </div>
        ) : isCardReveal ? (
          <div className="mb-6 text-xs text-cyan-400 font-mono flex items-center justify-center gap-1.5">
            <Zap size={14} />
            <span>3 surprise tech cards assigned. Review your tech stack.</span>
          </div>
        ) : isBuilding ? (
          <div className="mb-6 text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5">
            <Target size={14} />
            <span>Build sprint active. Formulate and submit your solution.</span>
          </div>
        ) : (
          <div className="mb-6 text-xs text-bwb-muted font-mono flex items-center justify-center gap-1.5">
            <PhaseIcon size={14} className={config.color} />
            <span>{config.description}</span>
          </div>
        )}

        {/* Spotlight Presentation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stereo-card rounded-3xl p-6 sm:p-8 mb-8 border-2 border-bwb-accent/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-bwb-surface-2 via-bwb-surface to-bwb-surface"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant={isLeaderboard || isResults ? 'warn' : 'accent'} className="font-mono text-xs font-bold px-3 py-1">
              {pitchTeam ? `On Stage: ${pitchTeam.name}` : isLeaderboard || isResults ? 'Rankings Live' : config.label}
            </Badge>
          </div>

          {isLeaderboard || isResults ? (
            <>
              <h1 className="font-display text-2xl sm:text-4xl font-black text-bwb-gold mb-2">
                {isResults ? 'Championship Results' : 'Tournament Leaderboard'}
              </h1>
              <p className="text-bwb-muted text-xs sm:text-sm font-medium">
                {myTeam ? `Your team "${myTeam.name}" is ranked #${myRank ?? '—'} with ${myScore} points` : 'Final standings are being displayed.'}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl sm:text-4xl font-black text-bwb-text mb-2">
                {submission?.solutionName || (pitchTeam ? 'System Architecture Proposal' : config.label)}
              </h1>
              <p className="text-bwb-muted text-xs sm:text-sm font-medium">
                {isAttack ? 'Judge Attack & Technical Defense' : isJudging ? 'Judges are deliberating and scoring all submissions' : pitchTeam ? '60-Second Live Elevator Pitch' : config.description}
              </p>
            </>
          )}
        </motion.div>

        {/* Dynamic Content Based on Phase */}
        <div className="mb-8 p-6 rounded-3xl stereo-card border border-white/5 shadow-xl">
          {isAttack ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-3 shadow-lg">
                <Flame size={28} className="animate-bounce" />
              </div>
              <p className="text-xs sm:text-sm text-bwb-text font-semibold max-w-md mx-auto mb-4">
                Judges Challenge: &ldquo;How does your architecture handle edge failure, failover resilience, and real-time scaling?&rdquo;
              </p>
              <CountdownTimer
                key={`defense-${game.phaseExpiresAt}`}
                targetTime={game.phaseExpiresAt}
                initialSeconds={30}
                size="xl"
                label="DEFENSE TIME"
              />
            </div>
          ) : isJudging ? (
            <div className="flex flex-col items-center py-4">
              <Sparkles size={36} className="text-purple-400 animate-spin mb-3" />
              <p className="font-display font-bold text-lg text-bwb-text mb-1">
                Judges are Evaluating
              </p>
              <p className="text-xs text-bwb-muted mb-4">
                {scoredCount} of {totalTeams} teams scored so far. Stand by for real-time results.
              </p>
              <div className="w-full max-w-xs bg-bwb-bg rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalTeams > 0 ? (scoredCount / totalTeams) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-r from-purple-500 to-bwb-accent h-full rounded-full"
                />
              </div>
            </div>
          ) : isPitching ? (
            pitchTeam ? (
              <div className="flex flex-col items-center space-y-5">
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/40 flex items-center justify-center shadow-lg">
                    <Mic size={24} />
                  </div>
                  <CountdownTimer
                    key={`pitch-${pitchTeam.id}-${game.pitchExpiresAt || game.phaseExpiresAt}`}
                    targetTime={game.pitchExpiresAt || game.phaseExpiresAt}
                    initialSeconds={180}
                    size="lg"
                    label="PITCH TIME"
                  />
                </div>

                {/* Live Pitch Deck & Remote Controller */}
                <div className="w-full">
                  <LivePitchDeck
                    team={pitchTeam}
                    activeSlideIndex={game.currentSlideIndex ?? pitchTeam.currentSlideIndex ?? 0}
                    isController={isMyTeamOnStage}
                    onSlideChange={(slideIdx) => {
                      if (game?.id && pitchTeam?.id) {
                        api.updatePitchSlide(game.id, pitchTeam.id, slideIdx).catch(() => {})
                      }
                    }}
                    catalogProblems={problems}
                    round={game.currentRound || 1}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <Mic size={28} className="text-bwb-muted/40 mb-3" />
                <p className="text-sm text-bwb-muted font-mono">Waiting for judge to call a team...</p>
              </div>
            )
          ) : isProblemReveal ? (
            <div className="py-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Lightbulb size={20} className="text-amber-400" />
                <p className="font-display font-bold text-base text-bwb-text">Select Your Challenge</p>
              </div>
              {myTeam?.selectedProblemId ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <p className="text-[10px] font-mono uppercase text-amber-400 mb-1">Your Selected Challenge</p>
                  <p className="font-display font-bold text-lg text-bwb-text">{game.currentProblem?.title || 'Challenge Locked'}</p>
                  <p className="text-xs text-bwb-muted mt-1">{game.currentProblem?.category}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {problems.map((p) => {
                    const isSelected = game.currentProblem?.id === p.id
                    return (
                      <div key={p.id} className={`p-3 rounded-xl border text-left flex items-center gap-3 ${isSelected ? 'bg-amber-500/15 border-amber-500/40' : 'bg-bwb-surface-2/50 border-white/5'}`}>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">{p.id.replace('p', '')}</div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-bwb-text truncate">{p.title}</p>
                          <p className="text-[10px] text-bwb-muted">{p.category}</p>
                        </div>
                        {isSelected && <span className="ml-auto text-[10px] font-mono font-bold text-amber-400 shrink-0">ACTIVE</span>}
                      </div>
                    )
                  })}
                </div>
              )}
              <p className="text-[10px] text-bwb-muted mt-3 text-center font-mono">Problem statements revealed. Go to the Problem Select page to choose your track.</p>
            </div>
          ) : isCardReveal ? (
            <div className="py-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap size={20} className="text-cyan-400" />
                <p className="font-display font-bold text-base text-bwb-text">Your Tech Card Stack</p>
              </div>
              {myTeam && myTeam.technologies && myTeam.technologies.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {myTeam.technologies.map((tech, i) => (
                    <div key={tech.id || i} className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                      <span className="text-2xl block mb-1">{tech.icon}</span>
                      <p className="font-display font-bold text-xs text-bwb-text">{tech.name}</p>
                      <p className="text-[9px] text-bwb-muted mt-0.5">{tech.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-bwb-muted font-mono">Cards are being dealt. Go to Card Reveal to flip your cards.</p>
              )}
            </div>
          ) : isBuilding ? (
            <div className="py-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target size={20} className="text-emerald-400" />
                <p className="font-display font-bold text-base text-bwb-text">Build Sprint</p>
              </div>
              {myTeam?.submission ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                  <p className="text-[10px] font-mono uppercase text-emerald-400 mb-1">Your Submission</p>
                  <p className="font-display font-bold text-sm text-bwb-text">{myTeam.submission.solutionName || 'Untitled Solution'}</p>
                  <p className="text-xs text-bwb-muted mt-1 line-clamp-2">{myTeam.submission.whatItDoes || myTeam.submission.howItWorks}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CountdownTimer
                    key={`pitch-build-${game.phaseExpiresAt}`}
                    targetTime={game.phaseExpiresAt}
                    initialSeconds={900}
                    size="xl"
                    label="BUILD TIME"
                  />
                  <p className="text-xs text-bwb-muted mt-3 font-mono">Formulate your architecture and submit before time runs out.</p>
                </div>
              )}
            </div>
          ) : isLeaderboard || isResults ? (
            <div className="flex flex-col items-center py-4">
              <Trophy size={36} className="text-bwb-gold mb-3" />
              <p className="font-display font-bold text-lg text-bwb-gold mb-1">
                {isResults ? 'Champion Crowned' : 'Live Standings'}
              </p>
              <p className="text-xs text-bwb-muted mb-4">
                {myTeam ? `Your team "${myTeam.name}" is ranked #${myRank ?? '—'}` : 'Check the leaderboard for final rankings.'}
              </p>
              {myTeam && (
                <div className="flex items-center gap-4 text-center">
                  <div className="px-4 py-2 rounded-xl bg-bwb-surface-2 border border-white/10">
                    <p className="text-[10px] font-mono uppercase text-bwb-muted">Rank</p>
                    <p className="font-display font-black text-xl text-bwb-gold">#{myRank ?? '—'}</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-bwb-surface-2 border border-white/10">
                    <p className="text-[10px] font-mono uppercase text-bwb-muted">Score</p>
                    <p className="font-display font-black text-xl text-bwb-accent">{myScore}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className={`w-14 h-14 rounded-2xl ${config.bgColor} ${config.color} border ${config.borderColor} flex items-center justify-center mb-3 shadow-lg`}>
                <PhaseIcon size={28} />
              </div>
              <p className="font-display font-bold text-lg text-bwb-text mb-1">{config.label}</p>
              <p className="text-xs text-bwb-muted">{config.description}</p>
            </div>
          )}
        </div>

        {/* Submission Details View */}
        {submission && (isPitching || isAttack || isJudging) && (
          <Card padding="lg" className="text-left mb-6 border-white/5 bg-bwb-surface-2/60">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-bwb-accent mb-2">
              Architecture Summary
            </h3>
            <p className="text-xs sm:text-sm text-bwb-text/90 leading-relaxed">
              {submission.whatItDoes || submission.howItWorks || 'System formulation submitted.'}
            </p>
          </Card>
        )}

        {/* Live Leaderboard Table */}
        {(isLeaderboard || isResults) && game.teams.length > 0 && (
          <div className="mt-4">
            <h3 className="font-display font-bold text-base text-bwb-text mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-bwb-gold" />
              {isResults ? 'Final Tournament Standings' : 'Current Live Standings'}
            </h3>
            <LeaderboardTable
              teams={game.teams}
              highlightTeamId={session?.teamId}
              showMovement
              round={currentRound}
              isFinalResults={isResults}
            />
          </div>
        )}
      </div>
    </PageLayout>
  )
}
