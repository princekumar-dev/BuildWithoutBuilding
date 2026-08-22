import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Play, SkipForward, Eye, Lock, AlertTriangle, Users,
  ChevronLeft, Timer, Zap, Shield, Trophy, CheckCircle2,
  ExternalLink, Copy, Trash2, Key, UserCheck, Crown,
  Calendar, Edit3, Clock, Sparkles, ArrowRight,
  Award, Rocket
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

import { useRealtimeGame } from '../../hooks/useRealtimeGame'

const STAGES: { phase: GamePhase; step: number; title: string; desc: string; icon: string }[] = [
  { phase: 'LOBBY', step: 1, title: 'Lobby', desc: 'Waiting for teams to join', icon: '🚪' },
  { phase: 'PROBLEM_REVEAL', step: 2, title: 'Problem Reveal', desc: 'Teams select 1 of 8 challenges', icon: '💡' },
  { phase: 'CARD_REVEAL', step: 3, title: 'Card Reveal', desc: 'Teams draft 3 random tech cards', icon: '🎴' },
  { phase: 'BUILDING', step: 4, title: 'Build Phase', desc: '15m Solution Formulation', icon: '⚡' },
  { phase: 'PITCHING', step: 5, title: 'Pitching', desc: '60s live pitches & defense', icon: '🎤' },
  { phase: 'JUDGING', step: 6, title: 'Judging', desc: 'Deliberation & rubric scoring', icon: '⚖️' },
  { phase: 'LEADERBOARD', step: 7, title: 'Leaderboard', desc: 'Rank reveal & podium honors', icon: '🏆' },
]


export default function HostGameControlPage() {
  const { gameId } = useParams()
  const { game, setGame } = useGameStore()
  const [problems, setProblems] = useState<Problem[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Schedule state & input ref
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  // Max Teams Capacity state
  const [isEditingMaxTeams, setIsEditingMaxTeams] = useState(false)
  const [maxTeamsInput, setMaxTeamsInput] = useState<number>(game.maxTeams || 32)

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


  const timerActive = game.phase !== 'LOBBY'

  const changePhase = async (phase: GamePhase, problemId?: string) => {
    if (!game.id) return
    try {
      setGame(await api.setPhase(game.id, phase, problemId))
      toast.success(`Phase advanced to ${PHASE_LABELS[phase]}`)
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to update phase.')
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
      const updated = await api.setRound(game.id, 3, 'PROBLEM_REVEAL')
      setGame(updated)
      toast.success(`Top ${top8Ids.length} squads advanced to Grand Finals (Round 3)!`)
    } catch (err: any) {
      toast.error(err.message || 'Unable to advance finalists.')
    }
  }

  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const currentStageIndex = STAGES.findIndex((s) => s.phase === game.phase)
  const nextStage = currentStageIndex >= 0 && currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null

  const totalParticipants = game.teams.reduce((acc, t) => acc + (t.members?.length ?? 0), 0)
  const submittedCount = game.teams.filter((t) => !!t.submission).length


  return (
    <PageLayout fullWidth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Top Breadcrumb & Quick Action Buttons */}
        <PageTransition>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/host/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-bwb-muted hover:text-bwb-accent transition-colors font-medium"
            >
              <ChevronLeft size={16} /> Back to Host Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/projector" target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm" className="glass border border-bwb-accent/30">
                  <ExternalLink size={14} className="mr-1 text-bwb-accent" /> Open Projector Screen
                </Button>
              </Link>
              <Link to="/host/round">
                <Button variant="ghost" size="sm">
                  <Eye size={14} className="mr-1" /> Round View
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Header HUD */}
          <div className="stereo-card rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden border border-bwb-border">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-bwb-text">
                    {game.name}
                  </h1>
                  <PhaseIndicator phase={game.phase} />
                </div>

                <div className="flex items-center gap-3 text-sm text-bwb-muted">
                  <span>Room PIN:</span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-bwb-surface-2 border border-bwb-accent/40 font-mono text-bwb-accent font-bold hover:bg-bwb-accent/10 transition-all"
                  >
                    <span>{game.code}</span>
                    <Copy size={13} className={copied ? 'text-bwb-success' : 'text-bwb-muted'} />
                  </button>
                  <span>·</span>
                  <span><strong>{game.teams.length}</strong> Teams ({totalParticipants} Players)</span>
                </div>
              </div>

              {/* Countdown / Build Phase Timer */}
              <div className="flex items-center gap-4 bg-bwb-surface-2/80 p-3.5 rounded-2xl border border-white/5 shadow-inner">
                <div className={`p-2.5 rounded-xl border ${timerActive ? 'bg-bwb-accent/10 border-bwb-accent/30 text-bwb-accent' : 'bg-bwb-surface border-bwb-border text-bwb-muted'}`}>
                  <Timer size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-bwb-muted">Build Phase Timer</p>
                  <CountdownTimer
                    initialSeconds={game.buildDurationMinutes * 60}
                    running={timerActive}
                    size="sm"
                    showExpired={false}
                  />
                </div>
              </div>
            </div>

            {/* Scheduled Event Date & Time Widget */}
            <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
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

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                  className="text-xs border-white/10"
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
                  className="mt-4 p-5 rounded-2xl bg-bwb-bg border border-amber-400/40 overflow-hidden shadow-2xl"
                >
                  <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div className="flex-1 min-w-[280px]">
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
                          className="w-full px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-sm font-mono focus:border-amber-400 outline-none cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => dateInputRef.current?.showPicker?.()}
                          className="absolute right-2 px-3 py-1 rounded-lg bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 text-xs font-mono font-bold flex items-center gap-1 transition-colors border border-amber-400/30"
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
                        className="text-xs font-bold bg-amber-400 text-bwb-bg hover:bg-amber-300 shadow-md"
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(Date.now() + 15 * 60 * 1000)
                          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          setScheduledDateTime(local)
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center gap-1"
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
                        className="px-3 py-1.5 rounded-xl text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center gap-1"
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
                        className="px-3 py-1.5 rounded-xl text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center gap-1"
                      >
                        <Calendar size={11} className="text-amber-400" /> Today Evening (6 PM)
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
                        className="px-3 py-1.5 rounded-xl text-xs font-mono bg-bwb-surface border border-white/10 text-bwb-text hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center gap-1"
                      >
                        <Calendar size={11} className="text-amber-400" /> Tomorrow 10:00 AM
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Max Team Registration Capacity Limit Widget */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
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

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditingMaxTeams(!isEditingMaxTeams)}
                  className="text-xs border-white/10"
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
                  className="mt-4 p-5 rounded-2xl bg-bwb-bg border border-cyan-400/40 overflow-hidden shadow-2xl"
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
                    <div className="grid grid-cols-6 gap-2">
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

                    <div className="flex items-center gap-3 pt-1">
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
                        className="text-xs font-bold bg-cyan-400 text-bwb-bg hover:bg-cyan-300 shadow-md shrink-0"
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
        </PageTransition>





        <PageTransition delay={0.1}>
          {/* 3-ROUND TOURNAMENT CONTROLLER BAR */}
          <div className="stereo-card rounded-3xl p-5 sm:p-6 mb-8 border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-bwb-surface to-bwb-surface">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 font-bold">
                  TOURNAMENT ROUND CONTROLLER
                </span>
                <h2 className="font-display font-black text-xl text-bwb-text flex items-center gap-2">
                  <span>Current: Round {currentRound}</span>
                  <Badge variant="accent">
                    {currentRound === 1 ? 'Open Qualifier' : currentRound === 2 ? 'Problem Showdown (8x2)' : 'Grand Finals (Top 8)'}
                  </Badge>
                </h2>
              </div>

              {/* Round Navigation Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSetRound(1)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    currentRound === 2
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                      : 'bg-bwb-surface-2 text-bwb-muted hover:text-bwb-text border-white/5'
                  }`}
                >
                  Round 2 (8×2 Showdown)
                </button>

                <button
                  type="button"
                  onClick={() => handleSetRound(3)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    currentRound === 3
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                      : 'bg-bwb-surface-2 text-bwb-muted hover:text-bwb-text border-white/5'
                  }`}
                >
                  Round 3 (Grand Finals)
                </button>

                {currentRound === 2 && (
                  <Button
                    size="sm"
                    onClick={handleAdvanceTop8ToFinals}
                    className="bg-amber-400 hover:bg-amber-300 text-bwb-bg font-black text-xs shadow-md ml-2"
                  >
                    <Trophy size={13} className="mr-1" />
                    Lock Top 8 & Start Finals
                  </Button>
                )}
              </div>
            </div>

            {/* RICH ANIMATED ROUND TRANSITION & MISSION ANNOUNCEMENT CARD */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`round-guide-${currentRound}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-4 p-4 sm:p-5 rounded-2xl bg-bwb-bg/90 border border-purple-500/40 shadow-xl space-y-3"
              >
                {/* Round 1 Mission Briefing */}
                {currentRound === 1 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                          <Rocket size={13} className="text-purple-400" />
                          <span>ROUND 1: OPEN QUALIFIER ACTIVATED</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          🛡️ Zero Elimination
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted">
                        All {game.teams.length} Squads Active
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      All squads participate in Round 1 with zero elimination. Use this round to calibrate team pitching dynamics, draft surprise tech cards, and formulate a 15-minute system architecture pitch. All teams advance into Round 2.
                    </p>

                    <div className="pt-2.5 mt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-400" /> Recommended Host Next Steps:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => changePhase('PROBLEM_REVEAL')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 hover:bg-bwb-accent/20 hover:text-bwb-accent text-bwb-muted transition-all border border-white/5"
                        >
                          1. Problem Reveal
                        </button>
                        <button
                          type="button"
                          onClick={() => changePhase('CARD_REVEAL')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 hover:bg-bwb-accent/20 hover:text-bwb-accent text-bwb-muted transition-all border border-white/5"
                        >
                          2. Tech Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => changePhase('BUILDING')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-accent/20 text-bwb-accent font-bold hover:bg-bwb-accent/30 transition-all border border-bwb-accent/30"
                        >
                          3. Start Build Phase
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Round 2 Mission Briefing */}
                {currentRound === 2 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5">
                          <Zap size={13} className="text-cyan-400" />
                          <span>ROUND 2: 8×2 PROBLEM SHOWDOWN ACTIVATED</span>
                        </span>
                        <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          ⚡ Top 8 Advance to Finals
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted">
                        Max 16 Teams (2 per Challenge)
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      8 real-world challenge domains with strict maximum 2 teams per statement. Teams draft surprise tech cards and pitch live architecture defense. After judging, the <strong>Top 8 highest-scoring squads</strong> qualify for the Grand Finals!
                    </p>

                    <div className="pt-2.5 mt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold flex items-center gap-1">
                        <Trophy size={12} className="text-amber-400" /> Recommended Host Next Steps:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => changePhase('BUILDING')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 hover:bg-bwb-accent/20 hover:text-bwb-accent text-bwb-muted transition-all border border-white/5"
                        >
                          1. Build Sprint
                        </button>
                        <button
                          type="button"
                          onClick={() => changePhase('PITCHING')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 hover:bg-bwb-accent/20 hover:text-bwb-accent text-bwb-muted transition-all border border-white/5"
                        >
                          2. Pitch Defense
                        </button>
                        <button
                          type="button"
                          onClick={() => changePhase('JUDGING')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 hover:bg-bwb-accent/20 hover:text-bwb-accent text-bwb-muted transition-all border border-white/5"
                        >
                          3. Judge Scoring
                        </button>
                        <Button
                          size="sm"
                          onClick={handleAdvanceTop8ToFinals}
                          className="bg-amber-400 hover:bg-amber-300 text-bwb-bg font-black text-xs shadow-md"
                        >
                          4. Lock Top 8 & Start Finals
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Round 3 Mission Briefing */}
                {currentRound === 3 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                          <Crown size={13} className="text-amber-400" />
                          <span>ROUND 3: GRAND FINALS & PRIZE PODIUM ACTIVATED</span>
                        </span>
                        <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          🏆 Top 4 Prized on Podium
                        </span>
                      </div>
                      <span className="text-xs font-mono text-bwb-muted">
                        Top 8 Finalist Squads
                      </span>
                    </div>

                    <p className="text-xs text-bwb-text/90 leading-relaxed">
                      The Top 8 Finalist squads pitch their master systems live on stage in front of the judges! The Top 4 squads are awarded championship honors: <strong>1st Place Champion, 2nd Place Runner-Up, and Dual 3rd Place Bronze Winners</strong>!
                    </p>

                    <div className="pt-2.5 mt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold flex items-center gap-1">
                        <Award size={12} className="text-amber-400" /> Recommended Host Next Steps:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => changePhase('PITCHING')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-accent/20 text-bwb-accent font-bold hover:bg-bwb-accent/30 transition-all border border-bwb-accent/30"
                        >
                          1. Finalist Stage Pitching
                        </button>
                        <button
                          type="button"
                          onClick={() => changePhase('JUDGING')}
                          className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 hover:bg-bwb-accent/20 hover:text-bwb-accent text-bwb-muted transition-all border border-white/5"
                        >
                          2. Deliberate & Score
                        </button>
                        <button
                          type="button"
                          onClick={() => changePhase('RESULTS')}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-bwb-bg font-black hover:opacity-90 transition-all shadow-md"
                        >
                          3. Reveal Championship Prize Podium!
                        </button>
                      </div>
                    </div>
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
          </div>

          {/* Stage Progression Pipeline / Interactive Stepper */}
          <div className="stereo-card rounded-3xl p-6 sm:p-7 mb-8 border border-bwb-border">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-white/5">
              <div>
                <h2 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
                  <Zap size={18} className="text-bwb-accent" /> Event Stage Flow
                </h2>
                <p className="text-xs text-bwb-muted mt-0.5">
                  Click any stage to transition the entire room (player screens & projector auto-update)
                </p>
              </div>

              {/* Advance CTA */}
              {nextStage && (
                <Button
                  size="md"
                  onClick={() => changePhase(nextStage.phase)}
                  className="glow-accent shadow-lg shadow-bwb-accent/20"
                >
                  <Play size={15} className="mr-1.5" />
                  Advance to: {nextStage.title}
                </Button>
              )}
            </div>

            {/* Stepper Pipeline Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {STAGES.map((stg) => {
                const isActive = game.phase === stg.phase
                return (
                  <motion.button
                    key={stg.phase}
                    type="button"
                    onClick={() => changePhase(stg.phase)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[105px] ${
                      isActive
                        ? 'bg-bwb-accent text-bwb-bg font-bold shadow-xl shadow-bwb-accent/25 border-bwb-accent ring-2 ring-bwb-accent/40'
                        : 'bg-bwb-surface-2/80 text-bwb-muted hover:text-bwb-text border-bwb-border hover:border-bwb-accent/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-base">{stg.icon}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                          isActive ? 'bg-bwb-bg text-bwb-accent' : 'bg-bwb-surface text-bwb-muted'
                        }`}>
                          Step {stg.step}
                        </span>
                      </div>
                      <p className={`font-display font-bold text-sm leading-snug ${isActive ? 'text-bwb-bg' : 'text-bwb-text'}`}>
                        {stg.title}
                      </p>
                    </div>

                    <p className={`text-[11px] leading-tight line-clamp-2 mt-1 ${isActive ? 'text-bwb-bg/80 font-medium' : 'text-bwb-muted'}`}>
                      {stg.desc}
                    </p>
                  </motion.button>
                )
              })}
            </div>

            {/* CONTEXTUAL STAGE INTELLIGENCE & GUIDANCE CARD */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stage-info-${game.phase}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-2xl bg-bwb-bg/70 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-black text-bwb-accent flex items-center gap-1.5">
                        <Zap size={14} /> Stage Status: {PHASE_LABELS[game.phase]} (Round {currentRound})
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded-md text-bwb-muted">
                        Live on Stage & Screens
                      </span>
                    </div>

                    {game.phase === 'LOBBY' && (
                      <p className="text-xs text-bwb-muted">
                        🚪 <strong>Round {currentRound} Standby & Setup</strong>: Previous round leaderboard is cleared and Round {currentRound} is ready! Click <strong>Problem Reveal</strong>, <strong>Card Reveal</strong>, or <strong>Build Phase</strong> when you want to begin Round {currentRound}.
                      </p>
                    )}
                    {game.phase === 'PROBLEM_REVEAL' && (
                      <p className="text-xs text-bwb-muted">
                        💡 <strong>Problem Selection (Round {currentRound})</strong>: 8 Problem statements are active on projector and player devices. Teams are choosing their challenge track.
                      </p>
                    )}
                    {game.phase === 'CARD_REVEAL' && (
                      <p className="text-xs text-bwb-muted">
                        🎴 <strong>Surprise Tech Card Draft (Round {currentRound})</strong>: Squads have received 3 surprise frontier tech cards. Teams are reviewing their cards before the build sprint.
                      </p>
                    )}
                    {game.phase === 'BUILDING' && (
                      <p className="text-xs text-bwb-muted">
                        ⚡ <strong>15-Minute Rapid Architecture Sprint Active (Round {currentRound})</strong>: Squads are building system architectures. Submissions received: <strong className="text-bwb-accent">{submittedCount}</strong> / {game.teams.length}.
                      </p>
                    )}
                    {game.phase === 'PITCHING' && (
                      <p className="text-xs text-bwb-muted">
                        🎤 <strong>Live Stage Pitching Active (Round {currentRound})</strong>: Teams have 3 minutes to present their system flow, tech card integration, and answer judge defenses.
                      </p>
                    )}
                    {game.phase === 'JUDGING' && (
                      <p className="text-xs text-bwb-muted">
                        ⚖ <strong>Judge Scoring Active (Round {currentRound})</strong>: Judges enter ratings across 4 Rubric dimensions: Tech Integration (20), Feasibility (20), Problem Relevance (20), and Presentation (20).
                      </p>
                    )}
                    {game.phase === 'LEADERBOARD' && (
                      <p className="text-xs text-bwb-muted">
                        🏆 <strong>Live Leaderboard & Standings (Round {currentRound})</strong>: {currentRound === 2 ? 'Review Top 8 squads. Click "Lock Top 8 & Start Finals" when ready.' : 'Review final scores before podium reveal.'}
                      </p>
                    )}
                    {game.phase === 'RESULTS' && (
                      <p className="text-xs text-bwb-muted">
                        🎉 <strong>Championship Prize Podium (Round {currentRound})</strong>: 1st Champion, 2nd Runner-Up, and Dual 3rd Bronze Winners are presented with celebration confetti!
                      </p>
                    )}
                  </div>

                  {nextStage && (
                    <Button
                      size="sm"
                      onClick={() => changePhase(nextStage.phase)}
                      className="shrink-0 bg-bwb-accent text-bwb-bg font-bold text-xs shadow-md hover:bg-bwb-accent/90"
                    >
                      <span>Advance to {nextStage.title}</span>
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </PageTransition>



        {/* Live Teams, Selection & Submission Status Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PageTransition delay={0.2}>
              <Card padding="lg">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
                      <Users size={18} className="text-bwb-accent" />
                      Live Teams & Strategy Status
                      <Badge variant="default" className="ml-1 text-xs">{game.teams.length}</Badge>
                    </h2>
                    <p className="text-xs text-bwb-muted mt-0.5">
                      Real-time problem selections, tech cards drafted, and solution submissions
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-mono text-bwb-muted bg-bwb-surface-2 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live:</span> <strong className="text-emerald-400">{game.teams.filter((t) => t.isOnline).length}</strong> / {game.teams.length}
                    </div>
                    <div className="text-xs font-mono text-bwb-muted bg-bwb-surface-2 px-3 py-1.5 rounded-xl border border-white/5">
                      Submissions: <strong className="text-bwb-accent">{submittedCount}</strong> / {game.teams.length}
                    </div>
                  </div>
                </div>

                {game.teams.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-bwb-border rounded-2xl">
                    <Users size={40} className="mx-auto text-bwb-muted/50 mb-3" />
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
                        <motion.div
                          key={team.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="p-4 rounded-2xl stereo-card border border-bwb-border/80 flex flex-col gap-3.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-bwb-surface-2 border border-white/5 flex items-center justify-center font-mono font-bold text-xs text-bwb-accent shrink-0">
                                #{idx + 1}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-display font-black text-base text-bwb-text">
                                    {team.name}
                                  </h4>

                                  {/* Live vs Offline Status Badge */}
                                  {team.isOnline ? (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span>LIVE IN ROOM</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-white/5 text-bwb-muted border border-white/10 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                      <span>PRE-REGISTERED (OFFLINE)</span>
                                    </span>
                                  )}

                                  {/* Entry Passcode Badge with Copy */}
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
                                </div>

                                {/* Selected Problem Pill & Academic Info */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] text-bwb-muted font-mono">Challenge:</span>
                                  {selectedProblem && team.selectedProblemId ? (
                                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30 flex items-center gap-1">
                                      <CheckCircle2 size={11} />
                                      <span>{selectedProblem.category}</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-bwb-surface-2 text-bwb-muted border border-white/5 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse" />
                                      <span>Pending Problem Selection...</span>
                                    </span>
                                  )}

                                  {(team.department || team.year || team.section) && (
                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                      {[team.department, team.year, team.section].filter(Boolean).join(' · ')}
                                    </span>
                                  )}

                                  {(team.email || team.phone) && (
                                    <span className="text-[10px] text-bwb-muted font-mono">
                                      {[team.email, team.phone].filter(Boolean).join(' | ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status Badges & Delete Button */}
                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                              {/* Cards status */}
                              <span className="px-2.5 py-1 rounded-xl text-xs font-mono bg-bwb-surface-2 text-bwb-text border border-white/5">
                                🎴 {revealedCardsCount}/3 Cards
                              </span>

                              {/* Submission status */}
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
                          </div>

                          {/* Member Roster List */}
                          {team.members && team.members.length > 0 && (
                            <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-1.5">
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
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </PageTransition>
          </div>

          {/* Right Sidebar: Quick Actions & Operations */}
          <div className="space-y-6">
            <PageTransition delay={0.3}>
              <Card padding="lg">
                <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-bwb-accent" /> Round Operations
                </h2>
                <div className="space-y-2.5">
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('BUILDING')}>
                    <Play size={14} className="text-bwb-accent" /> Start Build Timer (15 min)
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('SUBMISSION_LOCKED')}>
                    <Lock size={14} className="text-bwb-warn" /> Lock All Submissions
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => changePhase('PITCHING')}>
                    <SkipForward size={14} /> Start Pitch Phase
                  </Button>
                  <Link to="/host/leaderboard" className="block">
                    <Button variant="secondary" fullWidth size="sm">
                      <Trophy size={14} className="text-bwb-gold" /> Leaderboard & Results
                    </Button>
                  </Link>
                </div>
              </Card>
            </PageTransition>

            <PageTransition delay={0.4}>
              <Card padding="lg" className="border-bwb-danger/20">
                <h2 className="font-display font-semibold mb-3 flex items-center gap-2 text-bwb-danger">
                  <AlertTriangle size={16} /> Deck Management
                </h2>
                <p className="text-xs text-bwb-muted mb-4">
                  Re-roll 3 random tech cards for all connected teams if you want to reset drafting.
                </p>
                <Button variant="danger" fullWidth size="sm" onClick={assignCards}>
                  <Shield size={14} /> Reassign Tech Cards to All
                </Button>
              </Card>
            </PageTransition>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 rounded-xl bg-bwb-danger/10 border border-bwb-danger/30 text-sm text-bwb-danger"
          >
            {error}
          </motion.div>
        )}
      </div>
    </PageLayout>
  )
}
