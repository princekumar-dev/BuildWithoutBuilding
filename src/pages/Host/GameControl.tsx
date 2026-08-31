import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Play, SkipForward, Eye, Lock, Unlock, AlertTriangle, Users,
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
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { WhatsAppIcon, OFFICIAL_WHATSAPP_GROUP_URL } from '../../components/ui/WhatsAppGroupCard'
import { getPhaseDuration, setPhaseDuration, TIMER_CHANGE_EVENT } from '../../lib/phaseTimers'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { getProblemWinners } from '../../lib/tournament'

const stagesForRound = (round: number, buildMin: number, pitchSec: number, maxTeams: number = 16) => {
  const buildLabel = buildMin >= 60 ? `${buildMin / 60}h` : `${buildMin}m`
  const pitchLabel = pitchSec >= 60 ? `${pitchSec / 60}m` : `${pitchSec}s`
  const trackCount = maxTeams === 8 ? 4 : 8
  const squadCount = maxTeams === 8 ? 8 : 16

  if (round === 1) return [
    { phase: 'LOBBY' as GamePhase, title: 'Lobby', desc: 'Squad check-in & readiness', icon: '🚪' },
    { phase: 'PROBLEM_REVEAL' as GamePhase, title: 'Problem Reveal', desc: `Teams select 1 of ${trackCount} challenges`, icon: '💡' },
    { phase: 'CARD_REVEAL' as GamePhase, title: 'Card Reveal', desc: 'Teams draft 3 surprise tech cards', icon: '🎴' },
    { phase: 'BUILDING' as GamePhase, title: 'Build Phase', desc: `${buildLabel} Problem Understanding (Zero Elimination)`, icon: '⚡' },
    { phase: 'PITCHING' as GamePhase, title: 'Pitching', desc: `${pitchLabel} Problem Understanding Checkpoint`, icon: '🎤' },
    { phase: 'JUDGING' as GamePhase, title: 'Judging', desc: `Qualifying check · All ${squadCount} squads advance to R2`, icon: '⚖️' },
    { phase: 'LEADERBOARD' as GamePhase, title: 'Leaderboard', desc: 'Zero elimination · All advance to R2', icon: '🏆' },
  ]
  if (round === 2) return [
    { phase: 'LOBBY' as GamePhase, title: 'Round 2 Lobby', desc: 'Briefing for Solution Enhancement', icon: '🚪' },
    { phase: 'BUILDING' as GamePhase, title: 'Build Phase', desc: `${buildLabel} Solution Enhancement & 1v1 Showdown`, icon: '⚡' },
    { phase: 'PITCHING' as GamePhase, title: 'Pitching', desc: `${pitchLabel} Head-to-Head Architecture Pitch`, icon: '🎤' },
    { phase: 'JUDGING' as GamePhase, title: 'Judging', desc: '100-pt problem track evaluation', icon: '⚖️' },
    { phase: 'LEADERBOARD' as GamePhase, title: 'Leaderboard', desc: `${trackCount} Problem Champions advance to Finals`, icon: '🏆' },
  ]
  return [
    { phase: 'LOBBY' as GamePhase, title: 'Finals Lobby', desc: `Top ${trackCount} Finalists Stage Prep`, icon: '🚪' },
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

  // WhatsApp Group URL state
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false)
  const [whatsappInput, setWhatsappInput] = useState<string>(game.whatsappGroupUrl || OFFICIAL_WHATSAPP_GROUP_URL)

  // Phase Timer Duration editing
  const [isEditingTimer, setIsEditingTimer] = useState(false)
  const [buildMinutes, setBuildMinutes] = useState(15)
  const [pitchSeconds, setPitchSeconds] = useState(180)

  // Confirmation Modal states
  const [deleteTeamTarget, setDeleteTeamTarget] = useState<{ id: string; name: string } | null>(null)
  const [showAdvanceFinalsModal, setShowAdvanceFinalsModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

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
    if (game.whatsappGroupUrl !== undefined) {
      setWhatsappInput(game.whatsappGroupUrl || OFFICIAL_WHATSAPP_GROUP_URL)
    }
  }, [game.maxTeams, game.whatsappGroupUrl])

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

  const handleSaveWhatsappUrl = async (urlVal: string) => {
    if (!game.id) return
    try {
      const cleanUrl = urlVal.trim() || null
      const updated = await api.updateConfig(game.id, { whatsappGroupUrl: cleanUrl })
      setGame(updated)
      setIsEditingWhatsapp(false)
      toast.success('Room WhatsApp Group URL updated successfully!')
    } catch {
      toast.error('Unable to update WhatsApp Group URL.')
    }
  }

  const handleToggleRegistration = async () => {
    if (!game.id) return
    const nextState = game.isRegistrationOpen === false ? true : false
    try {
      const updated = await api.toggleRegistration(game.id, nextState)
      setGame(updated)
      toast.success(nextState ? 'Team registration is now OPEN for this room!' : 'Team registration has been PAUSED/CLOSED for this room.')
    } catch {
      toast.error('Unable to update registration status.')
    }
  }

  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)

  const handleSavePhaseTimers = async () => {
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
    try {
      if (game.phase === 'BUILDING') {
        const updated = await api.updatePhaseTimer(game.id, buildMinutes * 60, 'BUILDING')
        setGame(updated)
      } else if (game.phase === 'PITCHING') {
        const updated = await api.updatePhaseTimer(game.id, pitchSeconds, 'PITCHING')
        setGame(updated)
      }
    } catch {}
    setIsEditingTimer(false)
    toast.success(`Round ${currentRound} timers updated & synced: Build ${buildMinutes}m, Pitch ${pitchSeconds / 60}m.`)
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
      const durSec = phase === 'BUILDING'
        ? getPhaseDuration(game.id, currentRound, 'BUILDING', buildMinutes)
        : phase === 'PITCHING'
        ? getPhaseDuration(game.id, currentRound, 'PITCHING')
        : undefined
      const durMin = phase === 'BUILDING' ? Math.round(durSec! / 60) : undefined

      setGame(await api.setPhase(game.id, phase, problemId, durMin, durSec))
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

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    setDeleteTeamTarget({ id: teamId, name: teamName })
  }

  const confirmDeleteTeam = async () => {
    if (!game.id || !deleteTeamTarget) return
    setActionLoading(true)
    try {
      setGame(await api.deleteTeam(game.id, deleteTeamTarget.id))
      toast.success(`Squad "${deleteTeamTarget.name}" removed from the room.`)
      setDeleteTeamTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove team.')
    } finally {
      setActionLoading(false)
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

  const handleAdvanceTop8ToFinals = () => {
    if (!game.id) return
    const finalistIds = getProblemWinners(game.teams, problems)
    if (finalistIds.length === 0) {
      toast.error('No teams available to advance.')
      return
    }
    setShowAdvanceFinalsModal(true)
  }

  const confirmAdvanceTop8ToFinals = async () => {
    if (!game.id) return
    const finalistIds = getProblemWinners(game.teams, problems)
    setActionLoading(true)
    try {
      await api.setFinalists(game.id, finalistIds)
      const updated = await api.setRound(game.id, 3, 'LOBBY')
      setGame(updated)
      toast.success(`The ${finalistIds.length} Problem Champions advanced to the Grand Finals lobby! Defeated squads left behind.`)
      setShowAdvanceFinalsModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Unable to advance finalists.')
    } finally {
      setActionLoading(false)
    }
  }

  const stages = stagesForRound(currentRound, buildMinutes, pitchSeconds, game.maxTeams || 16)
  const currentStageIndex = stages.findIndex((s) => s.phase === game.phase)
  const nextStage = currentStageIndex >= 0 && currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null

  const activeGameProblems = game.activeProblems && game.activeProblems.length > 0
    ? game.activeProblems
    : (game.activeProblemIds && game.activeProblemIds.length > 0
      ? problems.filter((p) => game.activeProblemIds?.includes(p.id))
      : (game.maxTeams === 8 ? problems.slice(0, 4) : problems))
  const dynamicTrackCount = activeGameProblems.length || (game.maxTeams === 8 ? 4 : 8)

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
                      key={`host-timer-${game.phase}-${game.phaseExpiresAt || timerRevision}`}
                      targetTime={game.phaseExpiresAt}
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
                    {game.teams.length >= (game.maxTeams || 16) && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        ROOM FULL
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono font-bold text-bwb-text mt-0.5">
                    Registered:{' '}
                    <span className={game.teams.length >= (game.maxTeams || 16) ? 'text-rose-400' : 'text-bwb-accent'}>
                      {game.teams.length}
                    </span>{' '}
                    / <span className="text-bwb-text font-black">{game.maxTeams || 16} Squads ({game.maxTeams === 8 ? '4 Tracks' : '8 Tracks'})</span>
                    <span className="text-bwb-muted font-normal ml-2">
                      ({Math.max(0, (game.maxTeams || 16) - game.teams.length)} slots remaining)
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
                        <Users size={13} /> Tournament Format & Squad Quota
                      </label>
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                        {maxTeamsInput} Squads ({maxTeamsInput === 8 ? '4 Problem Tracks' : '8 Problem Tracks'})
                      </span>
                    </div>

                    {/* Strict 8 or 16 Format Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMaxTeamsInput(8)
                          handleSaveMaxTeams(8)
                        }}
                        className={`p-3 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                          maxTeamsInput === 8
                            ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                            : 'bg-bwb-surface border-white/10 text-bwb-muted hover:text-bwb-text hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-sm">8 Squads</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-bwb-text">4 Tracks</span>
                        </div>
                        <p className="text-[11px] text-bwb-muted mt-1 leading-tight">
                          Random 4 problem tracks (2 squads per track · 4 1v1 duels)
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMaxTeamsInput(16)
                          handleSaveMaxTeams(16)
                        }}
                        className={`p-3 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                          maxTeamsInput === 16
                            ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                            : 'bg-bwb-surface border-white/10 text-bwb-muted hover:text-bwb-text hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-sm">16 Squads</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-bwb-text">8 Tracks</span>
                        </div>
                        <p className="text-[11px] text-bwb-muted mt-1 leading-tight">
                          All 8 problem tracks (2 squads per track · 8 1v1 duels)
                        </p>
                      </button>
                    </div>

                    <p className="text-[11px] text-bwb-muted">
                      Teams attempting to register past this quota will see a respectful capacity apology card directing them to the Passcode tab.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Room WhatsApp Group URL Widget */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] shrink-0">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-wider">
                      Tournament WhatsApp Group Link
                    </p>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                      Live
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-white/90 truncate mt-0.5 max-w-md">
                    {game.whatsappGroupUrl || OFFICIAL_WHATSAPP_GROUP_URL}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={game.whatsappGroupUrl || OFFICIAL_WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
                  title="Open WhatsApp Group in New Tab"
                >
                  <ExternalLink size={14} />
                </a>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditingWhatsapp(!isEditingWhatsapp)}
                  className="text-xs border-white/10 justify-center"
                >
                  <Edit3 size={13} className="mr-1.5 text-[#25D366]" />
                  {isEditingWhatsapp ? 'Close Editor' : 'Edit WhatsApp Link'}
                </Button>
              </div>
            </div>

            {/* Inline WhatsApp URL Editor */}
            <AnimatePresence>
              {isEditingWhatsapp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 sm:p-5 rounded-2xl bg-bwb-bg border border-[#25D366]/40 overflow-hidden shadow-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase text-[#25D366] font-bold flex items-center gap-1.5">
                        <WhatsAppIcon className="w-4 h-4" /> Room WhatsApp Group Invite Link
                      </label>
                      <button
                        type="button"
                        onClick={() => setWhatsappInput(OFFICIAL_WHATSAPP_GROUP_URL)}
                        className="text-[10px] font-mono font-bold text-bwb-muted hover:text-white underline"
                      >
                        Reset to Default
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <input
                        type="url"
                        value={whatsappInput}
                        onChange={(e) => setWhatsappInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-mono focus:border-[#25D366] outline-none"
                        placeholder="https://chat.whatsapp.com/..."
                      />

                      <Button
                        size="md"
                        onClick={() => handleSaveWhatsappUrl(whatsappInput)}
                        className="text-xs font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-md shadow-[#25D366]/20 shrink-0 justify-center"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Save WhatsApp Link
                      </Button>
                    </div>

                    <p className="text-[11px] text-bwb-muted">
                      All registered participants in this room will automatically receive this WhatsApp link on registration confirmation and in the lobby.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Room Team Registration Active Control Widget */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  game.isRegistrationOpen !== false
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}>
                  {game.isRegistrationOpen !== false ? <Unlock size={18} /> : <Lock size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-wider">
                      Live Registration Gateway
                    </p>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      game.isRegistrationOpen !== false
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      {game.isRegistrationOpen !== false ? '🟢 REGISTRATIONS OPEN' : '🔒 REGISTRATIONS CLOSED'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-bwb-text mt-0.5">
                    {game.isRegistrationOpen !== false
                      ? 'Teams can freely register for this room.'
                      : 'New team registrations are paused by host. Existing teams can still enter via Passcode.'}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant={game.isRegistrationOpen !== false ? 'secondary' : 'primary'}
                onClick={handleToggleRegistration}
                className={`text-xs font-bold shrink-0 justify-center ${
                  game.isRegistrationOpen !== false
                    ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/15'
                    : 'bg-emerald-500 text-bwb-bg hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                }`}
              >
                {game.isRegistrationOpen !== false ? (
                  <>
                    <Lock size={13} className="mr-1.5" />
                    Pause Registrations
                  </>
                ) : (
                  <>
                    <Unlock size={13} className="mr-1.5" />
                    Re-Open Registrations
                  </>
                )}
              </Button>
            </div>
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
                      Teams select 1 of {dynamicTrackCount} problem statements and draft 3 surprise frontier tech cards. In the build and pitch stages, squads must present <strong>how clearly they understand the problem root causes, market pain points, and existing solution limitations</strong>. Judges evaluate this for <strong>100 pts</strong>. All squads advance directly into Round 2.
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
                          ⚡ Top {dynamicTrackCount} Advance to Finals
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted font-bold">
                        100 Pts Evaluation
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      Squads present <strong>how they are going to enhance their solution, integrate their 3 surprise frontier tech cards, and deliver novel system architecture and ideation</strong>. Judges evaluate the enhanced architecture for <strong>100 pts</strong>. The <strong>Top {dynamicTrackCount} Problem Champions (1 winner per 1v1 duel)</strong> qualify for the Grand Finals (Round 3)!
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
                        Top {dynamicTrackCount} Finalists
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      The Top {dynamicTrackCount} Finalist squads deliver their <strong>final refined master system pitch</strong> live on stage and defend their architecture against judge cross-examination. The <strong>Top 4 winning squads are crowned on the championship podium</strong>: 🥇 1st Place Champion, 🥈 2nd Place Runner-Up, and 🥉 Dual 3rd Place Bronze Winners (2 teams)!
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Problem Statements Distribution Matrix (Visible in Round 2) */}
            {currentRound === 2 && activeGameProblems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold mb-2">
                  {dynamicTrackCount} Challenge Statement Capacity Matrix (Max 2 Teams per Problem):
                </p>
                <div className={`grid ${dynamicTrackCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'} gap-2`}>
                  {activeGameProblems.map((prob) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
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
                      const selectedProblem =
                        (game.activeProblems || []).find((p) => p.id === team.selectedProblemId) ||
                        (problems || []).find((p) => p.id === team.selectedProblemId)
                      const revealedCardsCount = team.revealedCards?.length ?? (team.technologies?.length ? 3 : 0)
                      const isSubmitted = !!team.submission
                      const teamPasscode = team.passcode || team.id

                      return (
                        <div
                          key={team.id}
                          className="p-4 sm:p-4.5 rounded-2xl stereo-card border border-bwb-border/80 bg-bwb-surface/60 hover:border-bwb-accent/30 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-3"
                        >
                          {/* Top Header: Team Index, Name, Online Badge & Top Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-bwb-surface-2 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-bwb-accent shrink-0 shadow-inner">
                                #{idx + 1}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <h4 className="font-display font-black text-base text-bwb-text truncate max-w-[220px] sm:max-w-xs">
                                  {team.name}
                                </h4>
                                {team.isOnline ? (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>LIVE</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-white/5 text-bwb-muted border border-white/10 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                    <span>OFFLINE</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Passcode Copy & Delete Action */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyTeamPasscode(teamPasscode, team.name)}
                                title="Click to copy team entry passcode"
                                className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 hover:bg-amber-400/20 active:scale-95 transition-all shadow-sm"
                              >
                                <Key size={12} className="text-amber-400" />
                                <span>{teamPasscode}</span>
                                <Copy size={11} className="text-amber-400/70" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(team.id, team.name)}
                                title="Remove team from room"
                                className="p-1.5 rounded-xl text-bwb-muted hover:text-bwb-danger hover:bg-bwb-danger/10 border border-transparent hover:border-bwb-danger/20 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Middle Row: Strategy & Academic Info Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            {/* Left Group: Problem Track + Cards + Submission */}
                            <div className="flex flex-wrap items-center gap-2">
                              {team.selectedProblemId ? (
                                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30 flex items-center gap-1.5 shadow-sm">
                                  <CheckCircle2 size={13} className="text-bwb-accent" />
                                  <span>{selectedProblem?.category || selectedProblem?.title || `Track ${team.selectedProblemId}`}</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-bwb-surface-2 text-bwb-muted border border-white/5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse" />
                                  <span>Pending Track Selection</span>
                                </span>
                              )}

                              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-medium bg-bwb-surface-2 text-bwb-text border border-white/5 flex items-center gap-1">
                                <span>🎴</span> <span>{revealedCardsCount}/3 Cards</span>
                              </span>

                              <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 ${
                                isSubmitted
                                  ? 'bg-bwb-success/15 text-bwb-success border-bwb-success/30'
                                  : 'bg-bwb-surface-2 text-bwb-muted border-white/5'
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
                            </div>

                            {/* Right Group: Academic dept & contact */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              {(team.department || team.year || team.section) && (
                                <span className="px-2.5 py-0.5 rounded-lg font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  {[team.department, team.year, team.section].filter(Boolean).join(' · ')}
                                </span>
                              )}

                              {(team.email || team.phone) && (
                                <span className="text-bwb-muted font-mono text-[10px] px-2 py-0.5 bg-bwb-surface-2 rounded-lg border border-white/5">
                                  {[team.email, team.phone].filter(Boolean).join(' · ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: Member Roster */}
                          {team.members && team.members.length > 0 && (
                            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold mr-1 flex items-center gap-1">
                                <Users size={11} />
                                Roster ({team.members.length}):
                              </span>
                              {team.members.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                                    mIdx === 0
                                      ? 'bg-amber-400/10 text-amber-300 border-amber-400/30 font-semibold'
                                      : 'bg-bwb-surface-2 border-white/5 text-bwb-text'
                                  }`}
                                >
                                  {mIdx === 0 ? <Crown size={11} className="text-amber-400 shrink-0" /> : <UserCheck size={11} className="text-bwb-accent shrink-0" />}
                                  <span>{m}</span>
                                  {mIdx === 0 && <span className="text-[9px] text-amber-400 font-mono font-bold uppercase">(Lead)</span>}
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

          {/* Right Sidebar: Quick Actions & Operations (Sticky on Desktop) */}
          <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-20">
            {/* Quick Room Stats Card */}
            <Card padding="md" className="sm:p-5 stereo-card border border-bwb-border/80 bg-bwb-surface/60 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <h3 className="font-display font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-bwb-muted">
                    <Timer size={14} className="text-bwb-accent" /> Room Overview
                  </h3>
                  <span className="font-mono text-xs font-bold text-bwb-accent">
                    PIN: {game.code}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-bwb-surface-2 border border-white/5">
                    <p className="text-[10px] text-bwb-muted font-mono uppercase">Connected</p>
                    <p className="text-lg font-display font-black text-emerald-400 mt-0.5">
                      {game.teams.filter((t) => t.isOnline).length} <span className="text-xs text-bwb-muted font-normal">/ {game.teams.length}</span>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-bwb-surface-2 border border-white/5">
                    <p className="text-[10px] text-bwb-muted font-mono uppercase">Submitted</p>
                    <p className="text-lg font-display font-black text-bwb-accent mt-0.5">
                      {submittedCount} <span className="text-xs text-bwb-muted font-normal">/ {game.teams.length}</span>
                    </p>
                  </div>
                </div>
            </Card>

            <Card padding="md" className="sm:p-6 stereo-card border border-bwb-border/80 bg-bwb-surface/60 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/5">
                  <h2 className="font-display font-bold flex items-center gap-2 text-base text-bwb-text">
                    <Zap size={18} className="text-bwb-accent" /> Round Operations
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30">
                    HOST CONTROL
                  </span>
                </div>

                <div className="space-y-2.5">
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('BUILDING')} className="justify-center shadow-sm font-semibold">
                    <Play size={14} className="text-bwb-accent mr-1.5" /> Start Build Timer (15 min)
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('SUBMISSION_LOCKED')} className="justify-center shadow-sm font-semibold">
                    <Lock size={14} className="text-bwb-warn mr-1.5" /> Lock All Submissions
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('PITCHING')} className="justify-center shadow-sm font-semibold">
                    <SkipForward size={14} className="mr-1.5 text-purple-400" /> Start Pitch Phase
                  </Button>
                  <Link to="/host/leaderboard" className="block">
                    <Button variant="secondary" fullWidth size="sm" className="justify-center shadow-sm font-semibold">
                      <Trophy size={14} className="text-bwb-gold mr-1.5" /> Leaderboard & Results
                    </Button>
                  </Link>
                </div>
            </Card>

            <Card padding="md" className="sm:p-6 stereo-card border border-bwb-danger/30 bg-bwb-surface/60 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="font-display font-bold flex items-center gap-2 text-bwb-danger text-base">
                    <AlertTriangle size={16} /> Deck Management
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    RESET
                  </span>
                </div>
                <p className="text-xs text-bwb-muted mb-4 leading-relaxed">
                  Re-roll 3 random frontier tech cards for all connected squads if you wish to reset drafting.
                </p>
                <Button variant="danger" fullWidth size="sm" onClick={assignCards} className="justify-center font-semibold shadow-sm">
                  <Shield size={14} className="mr-1.5" /> Reassign Tech Cards to All
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

        {/* Remove Team Confirmation Modal */}
        <ConfirmModal
          open={!!deleteTeamTarget}
          onClose={() => setDeleteTeamTarget(null)}
          onConfirm={confirmDeleteTeam}
          title="Remove Squad from Tournament?"
          message={
            <span>
              Are you sure you want to remove squad <strong className="text-bwb-text font-bold">&ldquo;{deleteTeamTarget?.name}&rdquo;</strong> from this room? Their registration and current progress will be deleted.
            </span>
          }
          confirmText="Remove Squad"
          cancelText="Keep Squad"
          variant="danger"
          loading={actionLoading}
        />

        {/* Advance Finals Confirmation Modal */}
        <ConfirmModal
          open={showAdvanceFinalsModal}
          onClose={() => setShowAdvanceFinalsModal(false)}
          onConfirm={confirmAdvanceTop8ToFinals}
          title="Advance Champions to Grand Finals?"
          message="Advance the 1v1 duel Problem Champions (top squad per challenge track) to Round 3 Grand Finals? Other squads will remain spectator status."
          confirmText="Advance to Finals"
          cancelText="Cancel"
          variant="info"
          loading={actionLoading}
        />
      </PageTransition>
    </PageLayout>
  )
}
