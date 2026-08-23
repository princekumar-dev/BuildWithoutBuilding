import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Play, SkipForward, Eye, Lock, AlertTriangle, Users,
  ChevronLeft, Timer, Zap, Shield, Trophy, CheckCircle2,
  ExternalLink, Copy, Trash2, Key, UserCheck, Crown,
  Calendar, Edit3, Clock, Rocket
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { CountdownTimer } from '../../components/timer/CountdownTimer'
import { PageTransition } from '../../components/ui/PageTransition'
import { toast } from '../../components/ui/Toast'
import { useGameStore } from '../../store/gameStore'
import { PHASE_LABELS } from '../../data/mockData'
import type { GamePhase, Problem } from '../../types'
import { api } from '../../lib/api'
import { getPhaseDuration, setPhaseDuration, TIMER_CHANGE_EVENT } from '../../lib/phaseTimers'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'

const stagesForRound = (round: number, buildMin: number, pitchSec: number) => {
  const buildLabel = buildMin >= 60 ? `${buildMin / 60}h` : `${buildMin}m`
  const pitchLabel = pitchSec >= 60 ? `${pitchSec / 60}m` : `${pitchSec}s`
  if (round === 1) return [
    { phase: 'LOBBY' as GamePhase, title: 'Lobby', desc: 'Squad check-in & readiness', icon: '🚪' },
    { phase: 'PROBLEM_REVEAL' as GamePhase, title: 'Problem Reveal', desc: 'Teams select 1 of 8 challenges', icon: '💡' },
    { phase: 'CARD_REVEAL' as GamePhase, title: 'Card Reveal', desc: 'Teams draft 3 surprise tech cards', icon: '🎴' },
    { phase: 'BUILDING' as GamePhase, title: 'Build Phase', desc: `${buildLabel} Problem & Existing Landscape (100 Pts)`, icon: '⚡' },
    { phase: 'PITCHING' as GamePhase, title: 'Pitching', desc: `${pitchLabel} Problem Understanding & Landscape`, icon: '🎤' },
    { phase: 'JUDGING' as GamePhase, title: 'Judging', desc: '100-pt problem evaluation', icon: '⚖️' },
    { phase: 'LEADERBOARD' as GamePhase, title: 'Leaderboard', desc: 'Zero elimination · All advance to R2', icon: '🏆' },
  ]
  if (round === 2) return [
    { phase: 'LOBBY' as GamePhase, title: 'Round 2 Lobby', desc: 'Briefing for Solution Enhancement', icon: '🚪' },
    { phase: 'BUILDING' as GamePhase, title: 'Build Phase', desc: `${buildLabel} Solution Enhancement & Tech (100 Pts)`, icon: '⚡' },
    { phase: 'PITCHING' as GamePhase, title: 'Pitching', desc: `${pitchLabel} Enhanced Architecture & Ideation`, icon: '🎤' },
    { phase: 'JUDGING' as GamePhase, title: 'Judging', desc: '100-pt solution evaluation', icon: '⚖️' },
    { phase: 'LEADERBOARD' as GamePhase, title: 'Leaderboard', desc: 'Top 8 squads qualify for Finals', icon: '🏆' },
  ]
  return [
    { phase: 'LOBBY' as GamePhase, title: 'Finals Lobby', desc: 'Top 8 Finalists Stage Prep', icon: '🚪' },
    { phase: 'BUILDING' as GamePhase, title: 'Master Polish', desc: `${buildLabel} Master Architecture Refinement`, icon: '⚡' },
    { phase: 'PITCHING' as GamePhase, title: 'Grand Pitch', desc: `${pitchLabel} Master Pitch & Live Q&A Defense`, icon: '🎤' },
    { phase: 'JUDGING' as GamePhase, title: 'Final Judging', desc: 'Podium rank evaluation', icon: '⚖️' },
    { phase: 'LEADERBOARD' as GamePhase, title: 'Prize Podium', desc: 'Top 4 winners crowned on podium', icon: '🏆' },
  ]
}

export default function HostGameControlPage() {
  const { gameId } = useParams()
  const { game, setGame } = useGameStore()
  const [problems, setProblems] = useState<Problem[]>([])
  const [error, setError] = useState('')
  const [timerRevision, setTimerRevision] = useState(0)
  const [copied, setCopied] = useState(false)

  // Schedule state & input ref
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  // Max Teams Capacity state
  const [isEditingMaxTeams, setIsEditingMaxTeams] = useState(false)
  const [maxTeamsInput, setMaxTeamsInput] = useState<number>(game.maxTeams || 32)

  // Phase Timer Duration editing
  const [isEditingTimer, setIsEditingTimer] = useState(false)
  const [buildMinutes, setBuildMinutes] = useState(15)
  const [pitchSeconds, setPitchSeconds] = useState(180)

  useRealtimeGame()

  useEffect(() => {
    if (!gameId) return
    api.getGame(gameId).then(setGame).catch((reason) => setError(reason.message))
    api.getCatalog().then((c) => setProblems(c.problems)).catch(() => {})

    const interval = setInterval(() => {
      api.getGame(gameId).then(setGame).catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [gameId, setGame])

  useEffect(() => {
    if (game.maxTeams) {
      setMaxTeamsInput(game.maxTeams)
    }
  }, [game.maxTeams])

  useEffect(() => {
    if (game.scheduledStartTime) {
      try {
        const d = new Date(game.scheduledStartTime)
        const tzOffset = d.getTimezoneOffset() * 60000
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
        setScheduledDateTime(localISOTime)
      } catch {}
    } else {
      setScheduledDateTime('')
    }
  }, [game.scheduledStartTime])

  const handleSaveSchedule = async (timeVal: string | null) => {
    if (!game.id) return
    try {
      const isoVal = timeVal ? new Date(timeVal).toISOString() : null
      const updated = await api.updateSchedule(game.id, isoVal)
      setGame(updated)
      setIsEditingSchedule(false)
      toast.success(isoVal ? 'Event schedule saved & countdown updated!' : 'Scheduled countdown cleared.')
    } catch {
      toast.error('Unable to update schedule.')
    }
  }

  const handleSaveMaxTeams = async (limitVal: number) => {
    if (!game.id) return
    try {
      const cleanLimit = Math.max(2, Math.min(128, limitVal || 32))
      const updated = await api.updateConfig(game.id, { maxTeams: cleanLimit })
      setGame(updated)
      setIsEditingMaxTeams(false)
      toast.success(`Max team capacity updated to ${cleanLimit} teams!`)
    } catch {
      toast.error('Unable to update max team capacity.')
    }
  }

  const handleSavePhaseTimers = () => {
    if (!game.id) return
    if (buildMinutes < 1 || buildMinutes > 120) {
      toast.error('Build duration must be between 1 and 120 minutes.')
      return
    }
    if (pitchSeconds < 30 || pitchSeconds > 900) {
      toast.error('Pitch duration must be between 0.5 and 15 minutes.')
      return
    }
    setPhaseDuration(game.id, currentRound, 'BUILDING', buildMinutes * 60)
    setPhaseDuration(game.id, currentRound, 'PITCHING', pitchSeconds)
    setIsEditingTimer(false)
    toast.success(`Round ${currentRound} timers updated: Build ${buildMinutes}m, Pitch ${pitchSeconds / 60}m.`)
  }


  useEffect(() => {
    const refreshTimer = () => setTimerRevision((revision) => revision + 1)
    window.addEventListener(TIMER_CHANGE_EVENT, refreshTimer)
    return () => window.removeEventListener(TIMER_CHANGE_EVENT, refreshTimer)
  }, [])

  const phaseChangeInFlight = useRef(false)
  const phaseTimer = game.phase === 'BUILDING'
    ? { label: 'Build Phase Timer', seconds: getPhaseDuration(game.id, game.currentRound, 'BUILDING', game.buildDurationMinutes) }
    : game.phase === 'PITCHING'
    ? { label: 'Pitch Phase Timer', seconds: getPhaseDuration(game.id, game.currentRound, 'PITCHING', game.buildDurationMinutes) }
    : null

  const changePhase = async (phase: GamePhase, problemId?: string) => {
    if (!game.id || phase === game.phase || phaseChangeInFlight.current) return
    phaseChangeInFlight.current = true
    try {
      setGame(await api.setPhase(game.id, phase, problemId))
      toast.success(`Phase advanced to ${PHASE_LABELS[phase]}`)
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to update phase.')
    } finally {
      phaseChangeInFlight.current = false
    }
  }


  const assignCards = async () => {
    if (!game.id) return
    try {
      setGame(await api.assignCards(game.id))
      toast.success('All team cards reassigned!')
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to assign cards.')
    }
  }

  const copyCode = () => {
    if (!game.code) return
    navigator.clipboard.writeText(game.code)
    setCopied(true)
    toast.success(`PIN ${game.code} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!game.id) return
    const confirmed = window.confirm(`Are you sure you want to remove team "${teamName}" from the room?`)
    if (!confirmed) return
    try {
      setGame(await api.deleteTeam(game.id, teamId))
      toast.success(`Team "${teamName}" removed from room.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove team.')
    }
  }

  const handleCopyTeamPasscode = (passcode: string | undefined, teamName: string) => {
    if (!passcode) return
    navigator.clipboard.writeText(passcode)
    toast.success(`Passcode "${passcode}" for Team "${teamName}" copied!`)
  }

  const handleSetRound = async (roundNum: number, targetPhase: GamePhase = 'LOBBY') => {
    if (!game.id) return
    try {
      const updated = await api.setRound(game.id, roundNum, targetPhase)
      setGame(updated)
      toast.success(`Active tournament stage switched to Round ${roundNum}! Room set to ${PHASE_LABELS[targetPhase]}.`)
    } catch (err: any) {
      toast.error(err.message || 'Unable to update round.')
    }
  }

  const handleAdvanceTop8ToFinals = async () => {
    if (!game.id) return
    const sorted = [...game.teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    const top8Ids = sorted.slice(0, 8).map((t) => t.id)
    if (top8Ids.length === 0) {
      toast.error('No teams available to advance.')
      return
    }
    const confirmed = window.confirm(`Advance the Top ${top8Ids.length} teams to Round 3 (Grand Finals)?`)
    if (!confirmed) return
    try {
      await api.setFinalists(game.id, top8Ids)
      const updated = await api.setRound(game.id, 3, 'LOBBY')
      setGame(updated)
      toast.success(`Top ${top8Ids.length} squads advanced to the Round 3 lobby!`)
    } catch (err: any) {
      toast.error(err.message || 'Unable to advance finalists.')
    }
  }

  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const stages = stagesForRound(currentRound, buildMinutes, pitchSeconds)
  const currentStageIndex = stages.findIndex((s) => s.phase === game.phase)
  const nextStage = currentStageIndex >= 0 && currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null

  useEffect(() => {
    if (game.id) {
      const buildDur = getPhaseDuration(game.id, currentRound, 'BUILDING', game.buildDurationMinutes)
      const pitchDur = getPhaseDuration(game.id, currentRound, 'PITCHING', game.buildDurationMinutes)
      setBuildMinutes(Math.round(buildDur / 60))
      setPitchSeconds(pitchDur)
    }
  }, [game.id, currentRound, game.buildDurationMinutes, game.phase])

  const totalParticipants = game.teams.reduce((acc, t) => acc + (t.members?.length ?? 0), 0)
  const submittedCount = game.teams.filter((t) => !!t.submission).length
  const scoredCount = game.teams.filter((t) => (t.score ?? 0) > 0).length
  const allTeamsScored = game.teams.length > 0 && scoredCount === game.teams.length
  const pitchedCount = (game.pitchedTeamIds || []).length
  const allTeamsPitched = game.teams.length > 0 && pitchedCount >= game.teams.length

  const advanceStage = async () => {
    if (nextStage) return changePhase(nextStage.phase)
    if (currentRound === 1) return handleSetRound(2, 'LOBBY')
    if (currentRound === 2) return handleAdvanceTop8ToFinals()
    return changePhase('RESULTS')
  }

  return (
    <PageLayout fullWidth className="host-mobile-view">
      <PageTransition className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-12">
        {/* Top Breadcrumb & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <Link
              to="/host/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-bwb-muted hover:text-bwb-accent transition-colors font-medium py-1"
            >
              <ChevronLeft size={16} /> Back to Host Dashboard
            </Link>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Link to="/projector" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="w-full sm:w-auto glass border border-bwb-accent/30 text-xs justify-center">
                  <ExternalLink size={14} className="mr-1 text-bwb-accent" /> Open Projector Screen
                </Button>
              </Link>
              <Link to="/host/round" className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs justify-center border border-white/5">
                  <Eye size={14} className="mr-1" /> Participants
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Header HUD */}
          <div className="stereo-card rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden border border-bwb-border">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-bwb-text break-words">
                    {game.name}
                  </h1>
                  <PhaseIndicator phase={game.phase} />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-bwb-muted">
                  <span className="font-medium">Room PIN:</span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-bwb-surface-2 border border-bwb-accent/40 font-mono text-bwb-accent font-bold hover:bg-bwb-accent/10 transition-all text-xs"
                  >
                    <span>{game.code}</span>
                    <Copy size={13} className={copied ? 'text-bwb-success' : 'text-bwb-muted'} />
                  </button>
                  <span className="text-white/20">·</span>
                  <span><strong className="text-bwb-text">{game.teams.length}</strong> Teams ({totalParticipants} Players)</span>
                </div>
              </div>

              {/* Countdown timer HUD */}
              <div className="flex items-center justify-between sm:justify-start gap-4 bg-bwb-surface-2/90 p-3 sm:p-3.5 rounded-2xl border border-white/5 shadow-inner">
                <div className={`p-2.5 rounded-xl border ${phaseTimer ? 'bg-bwb-accent/10 border-bwb-accent/30 text-bwb-accent' : 'bg-bwb-surface border-bwb-border text-bwb-muted'}`}>
                  <Timer size={20} />
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-bwb-muted">{phaseTimer?.label ?? 'Stage Timer'}</p>
                  {phaseTimer ? (
                    <CountdownTimer
                      key={`${game.currentRound}-${game.phase}-${timerRevision}`}
                      initialSeconds={phaseTimer.seconds}
                      running
                      size="sm"
                      showExpired={false}
                      onComplete={() => {
                        toast.success(`${phaseTimer.label} finished. Moving to the next stage.`)
                        void advanceStage()
                      }}
                    />
                  ) : (
                    <p className="font-display font-bold text-xl sm:text-2xl text-bwb-muted">STANDBY</p>
                  )}
                </div>
              </div>
            </div>

            {/* Scheduled Event Date & Time Widget */}
            <div className="mt-5 pt-4 sm:mt-6 sm:pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-wider">
                    Tournament Schedule & Lobby Countdown
                  </p>
                  {game.scheduledStartTime ? (
                    <p className="text-xs font-mono font-bold text-bwb-text mt-0.5">
                      Scheduled for:{' '}
                      <span className="text-amber-400">
                        {new Date(game.scheduledStartTime).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs font-mono text-bwb-muted mt-0.5">
                      No schedule set (Live standby mode — teams wait for manual launch)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                  className="w-full sm:w-auto text-xs border-white/10 justify-center"
                >
                  <Edit3 size={13} className="mr-1.5 text-amber-400" />
                  {isEditingSchedule ? 'Close Editor' : game.scheduledStartTime ? 'Edit Schedule' : 'Schedule Event Date & Time'}
                </Button>
              </div>
            </div>

            {/* Inline Schedule Editor Box */}
            <AnimatePresence>
              {isEditingSchedule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 sm:p-5 rounded-2xl bg-bwb-bg border border-amber-400/40 overflow-hidden shadow-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-mono uppercase text-amber-400 font-bold block mb-1.5 flex items-center gap-1.5">
                        <Calendar size={13} /> Select Tournament Date & Time
                      </label>
                      <div className="relative flex items-center">
                        <input
                          ref={dateInputRef}
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs sm:text-sm font-mono focus:border-amber-400 outline-none cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => dateInputRef.current?.showPicker?.()}
                          className="hidden sm:flex absolute right-2 px-3 py-1 rounded-lg bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 text-xs font-mono font-bold items-center gap-1 transition-colors border border-amber-400/30"
                        >
                          <Calendar size={13} />
                          <span>Open Calendar</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="md"
                        disabled={!scheduledDateTime}
                        onClick={() => handleSaveSchedule(scheduledDateTime)}
                        className="flex-1 sm:flex-initial text-xs font-bold bg-amber-400 text-bwb-bg hover:bg-amber-300 shadow-md justify-center"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Save Schedule
                      </Button>
                      {game.scheduledStartTime && (
                        <Button
                          size="md"
                          variant="ghost"
                          onClick={() => handleSaveSchedule(null)}
                          className="text-xs text-bwb-danger hover:bg-bwb-danger/10"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick 1-Click Presets */}
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold mb-2">
                      1-Click Quick Presets:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 15 * 60 * 1000)
                          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          setScheduledDateTime(local)
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-1"
                      >
                        <Clock size={11} className="text-amber-400" /> +15 Mins
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 60 * 60 * 1000)
                          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          setScheduledDateTime(local)
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-1"
                      >
                        <Clock size={11} className="text-amber-400" /> +1 Hour
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date()
                          d.setHours(18, 0, 0, 0)
                          if (d.getTime() <= Date.now()) d.setHours(20, 0, 0, 0)
                          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          setScheduledDateTime(local)
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-1 truncate"
                      >
                        <Calendar size={11} className="text-amber-400 shrink-0" /> <span className="truncate">Today 6 PM</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date()
                          d.setDate(d.getDate() + 1)
                          d.setHours(10, 0, 0, 0)
                          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          setScheduledDateTime(local)
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-1 truncate"
                      >
                        <Calendar size={11} className="text-amber-400 shrink-0" /> <span className="truncate">Tomorrow 10 AM</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Max Team Registration Capacity Limit Widget */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-wider">
                      Team Registration Capacity Quota
                    </p>
                    {game.teams.length >= (game.maxTeams || 32) && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        ROOM FULL
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono font-bold text-bwb-text mt-0.5">
                    Registered:{' '}
                    <span className={game.teams.length >= (game.maxTeams || 32) ? 'text-rose-400' : 'text-bwb-accent'}>
                      {game.teams.length}
                    </span>{' '}
                    / <span className="text-bwb-text font-black">{game.maxTeams || 32} Teams Max</span>
                    <span className="text-bwb-muted font-normal ml-2">
                      ({Math.max(0, (game.maxTeams || 32) - game.teams.length)} slots remaining)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditingMaxTeams(!isEditingMaxTeams)}
                  className="w-full sm:w-auto text-xs border-white/10 justify-center"
                >
                  <Edit3 size={13} className="mr-1.5 text-cyan-400" />
                  {isEditingMaxTeams ? 'Close Quota Editor' : 'Adjust Max Team Limit'}
                </Button>
              </div>
            </div>

            {/* Inline Max Teams Quota Editor Box */}
            <AnimatePresence>
              {isEditingMaxTeams && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 sm:p-5 rounded-2xl bg-bwb-bg border border-cyan-400/40 overflow-hidden shadow-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5">
                        <Users size={13} /> Select Maximum Allowed Teams
                      </label>
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                        {maxTeamsInput} Teams Max
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[8, 16, 24, 32, 48, 64].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setMaxTeamsInput(count)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                            maxTeamsInput === count
                              ? 'bg-cyan-400 text-bwb-bg border-cyan-400 shadow-md scale-[1.02]'
                              : 'bg-bwb-surface border-white/10 text-bwb-muted hover:text-bwb-text hover:border-white/20'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                      <input
                        type="number"
                        min={2}
                        max={128}
                        value={maxTeamsInput}
                        onChange={(e) => setMaxTeamsInput(Math.max(2, Math.min(128, Number(e.target.value) || 32)))}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-sm font-mono focus:border-cyan-400 outline-none"
                        placeholder="Custom max teams (e.g. 20)"
                      />

                      <Button
                        size="md"
                        onClick={() => handleSaveMaxTeams(maxTeamsInput)}
                        className="text-xs font-bold bg-cyan-400 text-bwb-bg hover:bg-cyan-300 shadow-md shrink-0 justify-center"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Save Team Limit
                      </Button>
                    </div>

                    <p className="text-[11px] text-bwb-muted">
                      Teams attempting to register past this quota will see a respectful capacity apology card directing them to the Passcode tab.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3-ROUND TOURNAMENT CONTROLLER BAR */}
          <div className="stereo-card rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-bwb-surface to-bwb-surface">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 font-bold">
                  TOURNAMENT FLOW CONTROLLER
                </span>
                <h2 className="font-display font-black text-lg sm:text-xl text-bwb-text flex items-center gap-2 flex-wrap mt-0.5">
                  <span>Current: Round {currentRound}</span>
                  <Badge variant="accent">
                    {currentRound === 1 ? 'Open Qualifier' : currentRound === 2 ? 'Problem Showdown (8x2)' : 'Grand Finals (Top 8)'}
                  </Badge>
                </h2>
              </div>

              {/* Round Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSetRound(1)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center ${
                      currentRound === 1
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                        : 'bg-bwb-surface-2 text-bwb-muted hover:text-bwb-text border-white/5'
                    }`}
                  >
                    Round 1 (Open)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetRound(2)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center ${
                      currentRound === 2
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                        : 'bg-bwb-surface-2 text-bwb-muted hover:text-bwb-text border-white/5'
                    }`}
                  >
                    Round 2 (8×2)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetRound(3)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center ${
                      currentRound === 3
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                        : 'bg-bwb-surface-2 text-bwb-muted hover:text-bwb-text border-white/5'
                    }`}
                  >
                    Round 3 (Finals)
                  </button>
                </div>

                {currentRound === 2 && (
                  <Button
                    size="sm"
                    onClick={handleAdvanceTop8ToFinals}
                    className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-bwb-bg font-black text-xs shadow-md justify-center"
                  >
                    <Trophy size={13} className="mr-1" />
                    Lock Top 8 & Start Finals
                  </Button>
                )}
              </div>
            </div>

            {/* Phase Timer Duration Controls */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-bwb-accent/10 border border-bwb-accent/20 text-bwb-accent shrink-0">
                  <Timer size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-wider">
                    Phase Timer Settings · Round {currentRound}
                  </p>
                  <p className="text-xs font-mono font-bold text-bwb-text mt-0.5">
                    Build: <span className="text-bwb-accent">{buildMinutes}m</span>
                    <span className="text-bwb-muted mx-2">·</span>
                    Pitch: <span className="text-bwb-accent">{pitchSeconds / 60}m</span>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditingTimer(!isEditingTimer)}
                className="w-full sm:w-auto text-xs border-white/10 justify-center"
              >
                <Edit3 size={13} className="mr-1.5 text-bwb-accent" />
                {isEditingTimer ? 'Close Timer Editor' : 'Edit Phase Timers'}
              </Button>
            </div>

            {/* Inline Phase Timer Editor */}
            <AnimatePresence>
              {isEditingTimer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 sm:p-5 rounded-2xl bg-bwb-bg border border-bwb-accent/40 overflow-hidden shadow-2xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-mono uppercase text-bwb-accent font-bold block mb-1.5 flex items-center gap-1.5">
                        <Zap size={13} /> Build Phase Duration (minutes)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={buildMinutes}
                          onChange={(e) => setBuildMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 15)))}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-sm font-mono focus:border-bwb-accent outline-none"
                        />
                        <span className="text-xs text-bwb-muted font-mono">min</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[10, 15, 20, 30, 45, 60].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setBuildMinutes(m)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                              buildMinutes === m
                                ? 'bg-bwb-accent text-bwb-bg border-bwb-accent'
                                : 'bg-bwb-surface border-white/10 text-bwb-muted hover:text-bwb-text hover:border-white/20'
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-bwb-accent font-bold block mb-1.5 flex items-center gap-1.5">
                        <Timer size={13} /> Pitch Phase Duration (minutes)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0.5}
                          max={15}
                          step={0.5}
                          value={pitchSeconds / 60}
                          onChange={(e) => setPitchSeconds(Math.max(30, Math.min(900, Math.round(Number(e.target.value) * 60) || 180)))}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-sm font-mono focus:border-bwb-accent outline-none"
                        />
                        <span className="text-xs text-bwb-muted font-mono">min</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[0.5, 1, 1.5, 2, 3, 5].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPitchSeconds(m * 60)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                              pitchSeconds === m * 60
                                ? 'bg-bwb-accent text-bwb-bg border-bwb-accent'
                                : 'bg-bwb-surface border-white/10 text-bwb-muted hover:text-bwb-text hover:border-white/20'
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-white/5">
                    <Button
                      size="md"
                      onClick={handleSavePhaseTimers}
                      className="w-full sm:w-auto text-xs font-bold bg-bwb-accent text-bwb-bg hover:bg-bwb-accent/90 shadow-md justify-center"
                    >
                      <CheckCircle2 size={14} className="mr-1" />
                      Save Timer Settings for Round {currentRound}
                    </Button>
                    <p className="text-[11px] text-bwb-muted sm:ml-2">
                      Settings apply per-round and take effect on next phase start.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RICH ANIMATED ROUND TRANSITION & MISSION ANNOUNCEMENT CARD */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`round-guide-${currentRound}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-4 p-3.5 sm:p-5 rounded-2xl bg-bwb-bg/90 border border-purple-500/40 shadow-xl space-y-2.5"
              >
                {/* Round 1 Mission Briefing */}
                {currentRound === 1 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                          <Rocket size={13} className="text-purple-400" />
                          <span>ROUND 1: PROBLEM UNDERSTANDING & LANDSCAPE (100 PTS)</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          🛡️ Zero Elimination · All Advance
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted font-bold">
                        100 Pts Evaluation
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      Teams select 1 of 8 problem statements and draft 3 surprise frontier tech cards. In the build and pitch stages, squads must present <strong>how clearly they understand the problem root causes, market pain points, and existing solution limitations</strong>. Judges evaluate this for <strong>100 pts</strong>. All squads advance directly into Round 2.
                    </p>
                  </div>
                )}

                {/* Round 2 Mission Briefing */}
                {currentRound === 2 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5">
                          <Zap size={13} className="text-cyan-400" />
                          <span>ROUND 2: SOLUTION ENHANCEMENT & ARCHITECTURE (100 PTS)</span>
                        </span>
                        <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          ⚡ Top 8 Advance to Finals
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted font-bold">
                        100 Pts Evaluation
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      Squads present <strong>how they are going to enhance their solution, integrate their 3 surprise frontier tech cards, and deliver novel system architecture and ideation</strong>. Judges evaluate the enhanced architecture for <strong>100 pts</strong>. The <strong>Top 8 highest-scoring squads</strong> qualify for the Grand Finals (Round 3)!
                    </p>
                  </div>
                )}

                {/* Round 3 Mission Briefing */}
                {currentRound === 3 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                          <Crown size={13} className="text-amber-400" />
                          <span>ROUND 3: GRAND FINALS & MASTER PITCH DEFENSE</span>
                        </span>
                        <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          🏆 Top 4 Crowned on Podium
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted font-bold">
                        Top 8 Finalists
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      The Top 8 Finalist squads deliver their <strong>final refined master system pitch</strong> live on stage and defend their architecture against judge cross-examination. The <strong>Top 4 winning squads are crowned on the championship podium</strong>: 🥇 1st Place Champion, 🥈 2nd Place Runner-Up, and 🥉 Dual 3rd Place Bronze Winners (2 teams)!
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* 8 Problem Statements Distribution Matrix (Visible in Round 2) */}
            {currentRound === 2 && problems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold mb-2">
                  8 Challenge Statement Capacity Matrix (Max 2 Teams per Problem):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {problems.map((prob) => {
                    const count = game.problemTeamCounts?.[prob.id] ?? game.teams.filter((t) => t.selectedProblemId === prob.id).length
                    const isFull = count >= 2
                    return (
                      <div
                        key={prob.id}
                        className={`p-2 rounded-xl border text-center text-xs ${
                          isFull
                            ? 'bg-red-500/10 border-red-500/40 text-red-300'
                            : count === 1
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-bwb-surface border-white/5 text-bwb-muted'
                        }`}
                      >
                        <p className="font-bold truncate text-[11px]">{prob.category}</p>
                        <p className="font-mono text-[10px] font-black mt-0.5">
                          {count}/2 {isFull ? 'FULL' : 'Filled'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stage Progression Pipeline / Interactive Stepper */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-bwb-text flex items-center gap-2">
                    <Zap size={18} className="text-bwb-accent" /> Round {currentRound} Stage Flow
                  </h2>
                  <p className="text-xs text-bwb-muted mt-0.5">
                    Click any stage to transition the room (player screens & projector auto-update)
                  </p>
                </div>

                {/* Advance CTA */}
                {(nextStage || game.phase === 'LEADERBOARD') && (
                  <Button
                    size="md"
                    onClick={advanceStage}
                    disabled={game.phase === 'JUDGING' && !allTeamsScored && scoredCount === 0}
                    className="w-full sm:w-auto glow-accent shadow-lg shadow-bwb-accent/20 justify-center font-bold"
                  >
                    <Play size={15} className="mr-1.5" />
                    {game.phase === 'BUILDING'
                      ? 'Advance to: Pitching Phase'
                      : game.phase === 'PITCHING'
                      ? (allTeamsPitched ? 'Advance to: Judging Phase' : `Advance to: Judging (${pitchedCount}/${game.teams.length} Pitched)`)
                      : game.phase === 'JUDGING'
                      ? (allTeamsScored ? '🎉 Reveal Official Leaderboard' : `Reveal Leaderboard (${scoredCount}/${game.teams.length} Graded)`)
                      : nextStage
                      ? `Advance to: ${nextStage.title}`
                      : currentRound === 1
                      ? 'Start Round 2 Lobby'
                      : currentRound === 2
                      ? 'Lock Top 8 & Start Round 3 Lobby'
                      : 'Reveal Final Championship Results'
                    }
                  </Button>
                )}
              </div>

              {/* Stepper Pipeline Grid */}
              {(() => {
                const visibleStages = stages
                const totalCount = visibleStages.length
                const gridClass =
                  totalCount === 5
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5'
                    : totalCount === 7
                    ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'

                return (
                  <div className={`grid ${gridClass} gap-2 sm:gap-2.5`}>
                    {visibleStages.map((stg, idx) => {
                      const isActive = game.phase === stg.phase
                      const isLastOdd = totalCount % 2 !== 0 && idx === totalCount - 1
                      return (
                        <button
                          key={stg.phase}
                          type="button"
                          onClick={() => changePhase(stg.phase)}
                          className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] hover:scale-[1.01] relative flex flex-col justify-between min-h-[86px] sm:min-h-[105px] ${
                            isLastOdd ? 'col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1' : ''
                          } ${
                            isActive
                              ? 'bg-bwb-accent text-bwb-bg font-bold shadow-xl shadow-bwb-accent/25 border-bwb-accent ring-2 ring-bwb-accent/40'
                              : 'bg-bwb-surface-2/80 text-bwb-muted hover:text-bwb-text border-bwb-border hover:border-bwb-accent/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-base sm:text-lg">{stg.icon}</span>
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                isActive ? 'bg-bwb-bg text-bwb-accent' : 'bg-bwb-surface text-bwb-muted'
                              }`}>
                                Step {idx + 1}
                              </span>
                            </div>
                            <p className={`font-display font-bold text-xs sm:text-sm leading-snug ${isActive ? 'text-bwb-bg' : 'text-bwb-text'}`}>
                              {stg.title}
                            </p>
                          </div>

                          <p className={`text-[10px] sm:text-[11px] leading-tight line-clamp-2 mt-1 ${isActive ? 'text-bwb-bg/85 font-medium' : 'text-bwb-muted'}`}>
                            {stg.desc}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

        {/* Live Teams, Selection & Submission Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <Card padding="md" className="sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-bwb-text flex items-center gap-2">
                      <Users size={18} className="text-bwb-accent" />
                      Live Teams & Strategy Status
                      <Badge variant="default" className="ml-1 text-xs">{game.teams.length}</Badge>
                    </h2>
                    <p className="text-xs text-bwb-muted mt-0.5">
                      Real-time problem selections, tech cards drafted, and solution submissions
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <div className="text-xs font-mono text-bwb-muted bg-bwb-surface-2 px-3 py-1.5 rounded-xl border border-white/5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live:</span> <strong className="text-emerald-400">{game.teams.filter((t) => t.isOnline).length}</strong> / {game.teams.length}
                    </div>
                    <div className="text-xs font-mono text-bwb-muted bg-bwb-surface-2 px-3 py-1.5 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 text-center">
                      <span>Submissions:</span> <strong className="text-bwb-accent">{submittedCount}</strong> / {game.teams.length}
                    </div>
                  </div>
                </div>

                {game.teams.length === 0 ? (
                  <div className="py-12 sm:py-14 text-center border border-dashed border-bwb-border rounded-2xl">
                    <Users size={36} className="mx-auto text-bwb-muted/50 mb-3" />
                    <p className="text-bwb-text font-semibold text-sm">No teams joined yet</p>
                    <p className="text-bwb-muted text-xs mt-1">
                      Participants can join at <span className="text-bwb-accent font-mono">/join</span> with PIN <span className="text-bwb-accent font-mono font-bold">{game.code}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {game.teams.map((team, idx) => {
                      const selectedProblem = problems.find((p) => p.id === team.selectedProblemId)
                      const revealedCardsCount = team.revealedCards?.length ?? 0
                      const isSubmitted = !!team.submission
                      const teamPasscode = team.passcode || (team.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEAM') + '-' + Math.floor(100 + Math.random() * 900)

                      return (
                        <div
                          key={team.id}
                          className="p-3.5 sm:p-4 rounded-2xl stereo-card border border-bwb-border/80 flex flex-col gap-3 transition-colors"
                        >
                          {/* Row 1: Team Index, Name, Online Status & Delete Action */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-bwb-surface-2 border border-white/5 flex items-center justify-center font-mono font-bold text-xs text-bwb-accent shrink-0">
                                #{idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-display font-black text-base text-bwb-text break-words">
                                    {team.name}
                                  </h4>
                                  {team.isOnline ? (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span>LIVE IN ROOM</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-white/5 text-bwb-muted border border-white/10 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                      <span>OFFLINE</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete Team Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              title="Remove team from room"
                              className="p-2 rounded-xl text-bwb-muted hover:text-bwb-danger hover:bg-bwb-danger/10 border border-transparent hover:border-bwb-danger/20 transition-colors shrink-0"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Row 2: Passcode & Challenge Track */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyTeamPasscode(teamPasscode, team.name)}
                              title="Click to copy team entry passcode"
                              className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 hover:bg-amber-400/20 transition-colors shadow-sm"
                            >
                              <Key size={12} className="text-amber-400" />
                              <span>{teamPasscode}</span>
                              <Copy size={11} className="text-amber-400/70" />
                            </button>

                            {selectedProblem && team.selectedProblemId ? (
                              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30 flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>{selectedProblem.category}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-bwb-surface-2 text-bwb-muted border border-white/5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse" />
                                <span>Pending Problem Selection...</span>
                              </span>
                            )}
                          </div>

                          {/* Row 3: Cards Drafted & Submission Status & Academic info */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl text-xs font-mono bg-bwb-surface-2 text-bwb-text border border-white/5">
                              🎴 {revealedCardsCount}/3 Cards
                            </span>

                            <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 ${
                              isSubmitted
                                ? 'bg-bwb-success/15 text-bwb-success border-bwb-success/30'
                                : 'bg-bwb-surface-2 text-bwb-muted border-bwb-border'
                            }`}>
                              {isSubmitted ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  <span>Submitted</span>
                                </>
                              ) : (
                                <span>Building...</span>
                              )}
                            </span>

                            {(team.department || team.year || team.section) && (
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                {[team.department, team.year, team.section].filter(Boolean).join(' · ')}
                              </span>
                            )}

                            {(team.email || team.phone) && (
                              <span className="text-[10px] text-bwb-muted font-mono">
                                {[team.email, team.phone].filter(Boolean).join(' | ')}
                              </span>
                            )}
                          </div>

                          {/* Row 4: Member Roster List */}
                          {team.members && team.members.length > 0 && (
                            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold mr-1">
                                Roster ({team.members.length}):
                              </span>
                              {team.members.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-bwb-surface-2 border border-white/10 text-bwb-text flex items-center gap-1"
                                >
                                  {mIdx === 0 ? <Crown size={11} className="text-amber-400" /> : <UserCheck size={11} className="text-bwb-accent" />}
                                  {m} {mIdx === 0 && <span className="text-[9px] text-amber-400 font-mono font-bold">(Lead)</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
            </Card>
          </div>

          {/* Right Sidebar: Quick Actions & Operations */}
          <div className="space-y-5 sm:space-y-6">
            <Card padding="md" className="sm:p-6">
                <h2 className="font-display font-semibold mb-3.5 flex items-center gap-2 text-base">
                  <Zap size={18} className="text-bwb-accent" /> Round Operations
                </h2>
                <div className="space-y-2.5">
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('BUILDING')} className="justify-center">
                    <Play size={14} className="text-bwb-accent mr-1" /> Start Build Timer (15 min)
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('SUBMISSION_LOCKED')} className="justify-center">
                    <Lock size={14} className="text-bwb-warn mr-1" /> Lock All Submissions
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('PITCHING')} className="justify-center">
                    <SkipForward size={14} className="mr-1" /> Start Pitch Phase
                  </Button>
                  <Link to="/host/leaderboard" className="block">
                    <Button variant="secondary" fullWidth size="sm" className="justify-center">
                      <Trophy size={14} className="text-bwb-gold mr-1" /> Leaderboard & Results
                    </Button>
                  </Link>
                </div>
            </Card>

            <Card padding="md" className="sm:p-6 border-bwb-danger/20">
                <h2 className="font-display font-semibold mb-2.5 flex items-center gap-2 text-bwb-danger text-base">
                  <AlertTriangle size={16} /> Deck Management
                </h2>
                <p className="text-xs text-bwb-muted mb-3.5">
                  Re-roll 3 random tech cards for all connected teams if you want to reset drafting.
                </p>
                <Button variant="danger" fullWidth size="sm" onClick={assignCards} className="justify-center">
                  <Shield size={14} className="mr-1" /> Reassign Tech Cards to All
                </Button>
            </Card>
          </div>
        </div>

        {error && (
          <div
            className="mt-4 px-4 py-3 rounded-xl bg-bwb-danger/10 border border-bwb-danger/30 text-sm text-bwb-danger"
          >
            {error}
          </div>
        )}
      </PageTransition>
    </PageLayout>
  )
}
