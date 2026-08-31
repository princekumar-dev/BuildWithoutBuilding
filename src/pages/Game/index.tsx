import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Layers, Edit3, ArrowRight, Undo2
} from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { CountdownTimer } from '../../components/timer/CountdownTimer'
import { TechnologyCard } from '../../components/cards/TechnologyCard'
import { SolutionForm } from '../../components/forms/SolutionForm'
import { toast } from '../../components/ui/Toast'
import { useGameStore } from '../../store/gameStore'
import { usePhaseNavigation } from '../../hooks/usePhaseNavigation'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { drawProblemCards } from '../../data/mockData'
import type { Submission } from '../../types'
import { api } from '../../lib/api'
import { getPhaseDuration } from '../../lib/phaseTimers'

export default function GamePage() {
  const navigate = useNavigate()
  const { game, session, submission, setSubmission, setGame, selectedProblem } = useGameStore()

  // Real-time synchronization & phase auto-navigation
  useRealtimeGame()
  usePhaseNavigation()

  const myTeam = game.teams.find((team) => team.id === session?.teamId)
  const currentSubmission = myTeam?.submission ?? submission
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (game.id) {
      api.getGame(game.id).then(setGame).catch(() => {})
    }
  }, [game.id, setGame])

  // Sync state if team already has submission
  useEffect(() => {
    if (myTeam?.submission && !submission) {
      setSubmission(myTeam.submission)
    }
  }, [myTeam?.submission, submission, setSubmission])
  
  // Guarantee 3 real technologies drawn from this problem's specific card stacks are always available
  const myTechs = (myTeam?.technologies && myTeam.technologies.length >= 3)
    ? myTeam.technologies
    : drawProblemCards(myTeam?.selectedProblemId || selectedProblem?.id || 'p1')

  const problem = selectedProblem ?? game.currentProblem
  const opponentTeam = myTeam?.selectedProblemId
    ? game.teams.find((t) => t.id !== myTeam.id && t.selectedProblemId === myTeam.selectedProblemId)
    : null

  const handleSubmit = async (data: Submission) => {
    if (!myTeam) return
    setSaving(true)
    try {
      const submitted = { ...data, submittedAt: new Date().toISOString() }
      const updatedGame = await api.submit(game.id, myTeam.id, submitted)
      setGame(updatedGame)
      setSubmission(submitted)
      setIsEditing(false)
      toast.success(isEditing ? 'Solution updated successfully!' : 'Solution submitted successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save submission.')
    } finally {
      setSaving(false)
    }
  }

  const isPitchingPhase = game.phase === 'PITCHING' || game.phase === 'JUDGE_ATTACK'
  const hasSubmitted = !!currentSubmission && !isEditing
  const isFormLocked = hasSubmitted && !isEditing

  return (
    <PageLayout fullWidth className="pb-8">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-16 z-40 bg-bwb-bg/90 backdrop-blur-xl border-b border-bwb-border px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhaseIndicator phase={isPitchingPhase ? 'PITCHING' : hasSubmitted ? 'SUBMISSION_LOCKED' : 'BUILDING'} />
            <Badge>{myTeam?.name ?? 'Loading squad…'}</Badge>
            {game.currentRound === 2 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Round 2 · 1v1 Problem Duel
              </span>
            )}
          </div>

          <CountdownTimer
            key={`build-timer-${game.phase}-${game.phaseExpiresAt || game.currentRound || 1}`}
            targetTime={game.phaseExpiresAt}
            initialSeconds={getPhaseDuration(game.id, game.currentRound || 1, 'BUILDING', game.buildDurationMinutes)}
            running={!hasSubmitted}
            size="md"
            label="Build Time Remaining"
          />

          {hasSubmitted && (
            <div className="flex items-center gap-2 text-bwb-success text-sm font-semibold">
              <CheckCircle2 size={16} /> Solution Submitted
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ROUND 2 1V1 HEAD-TO-HEAD DUEL OPPONENT CARD */}
        {game.currentRound === 2 && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl stereo-card border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-bwb-surface-2 to-bwb-surface shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                  ⚔️
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider block">
                    Head-to-Head Problem Statement Duel
                  </span>
                  <p className="font-display font-bold text-base text-bwb-text mt-0.5">
                    Your Direct Opponent:{' '}
                    <span className="text-amber-400 font-extrabold">{opponentTeam?.name || 'Competing Squad'}</span>
                  </p>
                  <p className="text-xs text-bwb-muted mt-0.5">
                    Both squads are tackling &ldquo;{problem?.title || 'this challenge'}&rdquo;. The winner of this head-to-head match qualifies for Round 3 (Grand Finals)!
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 shrink-0">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30">
                  1 Winner Advances to Finals
                </span>
                <span className="text-[10px] text-bwb-muted font-mono mt-1">
                  8 Unique Problem Champions
                </span>
              </div>
            </div>
          </div>
        )}
        {/* SUBMITTED STATUS & ACTION BANNER */}
        {hasSubmitted && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-bwb-surface via-bwb-surface-2 to-bwb-surface border border-bwb-success/40 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-bwb-success/20 text-bwb-success shrink-0 mt-0.5">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
                    <span>Solution Successfully Submitted!</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-bwb-success/15 text-bwb-success font-mono font-bold">
                      Saved
                    </span>
                  </h3>
                  <p className="text-xs text-bwb-muted mt-0.5">
                    {currentSubmission?.submittedAt ? (
                      <>Submitted at {new Date(currentSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · </>
                    ) : null}
                    {isPitchingPhase
                      ? 'The Live Pitching round is currently active!'
                      : 'You can still edit and refine your answers until the Host begins Live Pitching.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                {isPitchingPhase ? (
                  <Button
                    onClick={() => navigate('/pitch')}
                    className="bg-bwb-accent text-bwb-bg font-bold shadow-lg shadow-bwb-accent/20"
                  >
                    <span>Enter Live Pitch Room</span>
                    <ArrowRight size={15} className="ml-1" />
                  </Button>
                ) : isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-bwb-muted hover:text-bwb-text"
                  >
                    <Undo2 size={13} className="mr-1" /> Cancel Editing
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold border-amber-400/40 text-amber-300 hover:bg-amber-400/10 shadow-sm"
                  >
                    <Edit3 size={13} className="mr-1.5 text-amber-400" />
                    <span>Edit Solution</span>
                  </Button>
                )}

                {!isPitchingPhase && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/pitch')}
                    className="text-xs text-bwb-muted hover:text-bwb-text hidden sm:inline-flex"
                  >
                    <span>Preview Pitching Stage</span>
                    <ArrowRight size={13} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Problem & Assigned Tech Stack */}
          <div className="lg:col-span-4 space-y-5">
            {problem && (
              <Card glow padding="md">
                <Badge variant="warn" className="mb-3">{problem.category}</Badge>
                <h2 className="font-display text-xl font-bold mb-2">{problem.title}</h2>
                <div className="space-y-3 text-sm text-bwb-muted leading-relaxed">
                  <p>{problem.description}</p>
                  {problem.challenge && (
                    <div className="p-3 rounded-xl bg-bwb-surface-2 border border-bwb-accent/30 text-bwb-text">
                      <p className="text-xs uppercase tracking-wider text-bwb-accent font-bold mb-1">Challenge</p>
                      <p className="text-xs sm:text-sm font-medium">{problem.challenge}</p>
                    </div>
                  )}
                </div>
                {problem.twist && (
                  <div className="mt-4 p-3 rounded-xl bg-bwb-warn/10 border border-bwb-warn/30">
                    <p className="text-xs uppercase tracking-wider text-bwb-warn font-display mb-1">Twist</p>
                    <p className="text-sm">{problem.twist}</p>
                  </div>
                )}
              </Card>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xs uppercase tracking-wider text-bwb-muted font-bold flex items-center gap-1.5">
                  <Layers size={13} className="text-bwb-accent" />
                  {game.currentRound === 1 ? 'Drawn Tech Stack (Preview)' : 'Your Assigned Tech Stack (3)'}
                </h3>
                <span className={`text-[11px] font-mono font-bold ${game.currentRound === 1 ? 'text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-md' : 'text-bwb-accent'}`}>
                  {game.currentRound === 1 ? 'Active in Round 2' : 'Must Incorporate'}
                </span>
              </div>
              <div className="space-y-2.5">
                {myTechs.map((tech, i) => (
                  <TechnologyCard key={tech.id} technology={tech} index={i} size="sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Solution Form */}
          <div className="lg:col-span-8">
            <Card padding="lg" className={isEditing ? 'border-amber-400/50 shadow-2xl' : ''}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-bwb-text flex items-center gap-2">
                    <span>
                      {game.currentRound === 1
                        ? 'Round 1: Problem Understanding & Analysis Form'
                        : game.currentRound === 2
                        ? 'Round 2: Solution Architecture & 1v1 Showdown Form'
                        : 'Round 3: Grand Finals Master Architecture Form'}
                    </span>
                    {isEditing && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-mono font-bold">
                        Editing Mode
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-bwb-muted mt-0.5">
                    {isFormLocked
                      ? `Form is currently locked in view mode. Click "${game.currentRound === 1 ? 'Edit Analysis' : 'Edit Solution'}" above to modify.`
                      : game.currentRound === 1
                      ? 'Document your problem root causes, critique of existing solutions, and initial 3-card tech stack below.'
                      : 'Fill in your architecture flow and technical formulation below.'}
                  </p>
                </div>

                {isFormLocked && !isPitchingPhase && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-amber-300 border-amber-400/40 hover:bg-amber-400/10"
                  >
                    <Edit3 size={13} className="mr-1" />
                    <span>{game.currentRound === 1 ? 'Edit Analysis' : 'Edit Answers'}</span>
                  </Button>
                )}
              </div>

              <SolutionForm
                technologies={myTechs}
                onSubmit={handleSubmit}
                disabled={isFormLocked || saving}
                initial={currentSubmission}
                submitLabel={
                  isEditing
                    ? (saving ? 'Saving Changes…' : game.currentRound === 1 ? 'Update & Save Analysis' : 'Update & Save Solution')
                    : (saving ? 'Submitting…' : undefined)
                }
                currentRound={game.currentRound || 1}
              />
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
