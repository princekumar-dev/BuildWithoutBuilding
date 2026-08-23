import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Sparkles, Trophy, Play, Pause,
  ChevronLeft, ChevronRight, CheckCircle2, Radio, Activity,
  Crown, Clock, Layers, Zap, Mic, Award,
  Flame
} from 'lucide-react'
import { CountdownTimer } from '../../components/timer/CountdownTimer'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { TournamentPodium } from '../../components/leaderboard/TournamentPodium'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { SoundFX } from '../../lib/soundEffects'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import { getPhaseDuration } from '../../lib/phaseTimers'
import type { Game, GamePhase, Problem, Technology } from '../../types'

const STADIUM_ANNOUNCEMENTS = [
  { icon: '🚀', tag: 'ARENA STAGE BROADCAST', text: 'Welcome squads! Connect your devices at /join and prepare your architecture strategy!' },
  { icon: '⚡', tag: 'ROUND 1 · 100 PTS', text: 'Round 1: Pitch deep problem understanding, root causes & landscape (Zero elimination, all scores carry forward)!' },
  { icon: '🎯', tag: 'ROUND 2 · 100 PTS', text: 'Round 2: Pitch enhanced solution architecture & 3 frontier tech integrations (Top 8 squads advance to Grand Finals)!' },
  { icon: '🏆', tag: 'ROUND 3 · GRAND FINALS', text: 'Round 3: Top 8 Finalists pitch master solutions and defend live on stage against judge Q&A!' },
  { icon: '🥇', tag: 'CHAMPIONSHIP PODIUM', text: 'Top 4 winners crowned on podium: 1st Champion, 2nd Runner-Up, and Dual 3rd Place Bronze winners!' },
  { icon: '⏱️', tag: 'RAPID ARCHITECTURE', text: 'Formulate system flows, edge-to-cloud handshakes, and realistic BOM feasibility!' },
]

const PITCH_ROUND_CONFIG: Record<number, {
  roundLabel: string
  badge: string
  badgeClass: string
  title: string
  subtitle: string
  focusHighlights: { label: string; pts: string; icon: string }[]
  waitingHeadline: string
  waitingSubtext: string
  accentColor: string
  borderColor: string
  glowGradient: string
}> = {
  1: {
    roundLabel: 'Round 1 · Open Qualifier',
    badge: '100 Pts · Zero Elimination',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: 'Problem Understanding & Existing Solutions Pitch',
    subtitle: 'Squads pitch root causes, user pain points, and shortcomings of existing market solutions.',
    focusHighlights: [
      { label: 'Problem Understanding', pts: '35 Pts', icon: '🎯' },
      { label: 'Existing Solutions Critique', pts: '25 Pts', icon: '🔍' },
      { label: '3-Tech Formulation', pts: '20 Pts', icon: '⚡' },
      { label: 'Pitch & Defense', pts: '20 Pts', icon: '🎙️' },
    ],
    waitingHeadline: 'Waiting For Next Squad',
    waitingSubtext: 'Judges are evaluating problem root causes, market alternatives, and tech formulation.',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    glowGradient: 'from-purple-950/30 via-bwb-surface-2 to-bwb-surface',
  },
  2: {
    roundLabel: 'Round 2 · Problem Showdown',
    badge: '100 Pts · Top 8 Advance',
    badgeClass: 'bg-bwb-accent/20 text-bwb-accent border-bwb-accent/30',
    title: 'Enhanced Solution & 3-Card Tech Integration',
    subtitle: 'Squads pitch novel architecture enhancement, 3 frontier tech cards & data telemetry.',
    focusHighlights: [
      { label: '3-Card Tech Integration', pts: '30 Pts', icon: '⚡' },
      { label: 'Novelty & Architecture', pts: '25 Pts', icon: '💡' },
      { label: 'System Flow Feasibility', pts: '20 Pts', icon: '🔄' },
      { label: 'Pitch & Defense', pts: '25 Pts', icon: '🛡️' },
    ],
    waitingHeadline: 'Waiting For Next Squad',
    waitingSubtext: 'Top 8 squads with highest cumulative scores advance to the Grand Finals.',
    accentColor: 'text-bwb-accent',
    borderColor: 'border-bwb-accent/30',
    glowGradient: 'from-cyan-950/30 via-bwb-surface-2 to-bwb-surface',
  },
  3: {
    roundLabel: 'Round 3 · Grand Finals',
    badge: 'Championship Live Defense · Top 4 Prized',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: 'Grand Finals Master Pitch & Live Defense',
    subtitle: 'Top 8 Finalists defend master architecture blueprints live on stage against judge attacks.',
    focusHighlights: [
      { label: 'Master Blueprint', pts: '30 Pts', icon: '👑' },
      { label: 'Production Viability', pts: '25 Pts', icon: '🏗️' },
      { label: 'Tech Synthesis', pts: '20 Pts', icon: '⚡' },
      { label: 'Stage Defense & Q&A', pts: '25 Pts', icon: '🔥' },
    ],
    waitingHeadline: 'Waiting For Next Finalist',
    waitingSubtext: 'Top 4 Championship positions awarded at the conclusion of this round.',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-400/40',
    glowGradient: 'from-amber-950/30 via-bwb-surface-2 to-bwb-surface',
  },
}

const categoryThemes: Record<string, { gradient: string; border: string; badge: string; accent: string; icon: string }> = {
  'Disaster Response': { gradient: 'from-red-950/60 via-red-900/30 to-bwb-surface/90', border: 'border-red-500/50', badge: 'bg-red-500/20 text-red-300 border-red-500/40', accent: '#ef4444', icon: '🚨' },
  'Urban Mobility': { gradient: 'from-blue-950/60 via-blue-900/30 to-bwb-surface/90', border: 'border-blue-500/50', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', accent: '#3b82f6', icon: '🚦' },
  'Water Management': { gradient: 'from-cyan-950/60 via-cyan-900/30 to-bwb-surface/90', border: 'border-cyan-500/50', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', accent: '#00e5c7', icon: '💧' },
  'Healthcare': { gradient: 'from-pink-950/60 via-pink-900/30 to-bwb-surface/90', border: 'border-pink-500/50', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40', accent: '#ec4899', icon: '🏥' },
  'Waste Management': { gradient: 'from-amber-950/60 via-amber-900/30 to-bwb-surface/90', border: 'border-amber-500/50', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', accent: '#f59e0b', icon: '♻️' },
  'Agriculture': { gradient: 'from-emerald-950/60 via-emerald-900/30 to-bwb-surface/90', border: 'border-emerald-500/50', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', accent: '#10b981', icon: '🌾' },
  'Public Transport': { gradient: 'from-purple-950/60 via-purple-900/30 to-bwb-surface/90', border: 'border-purple-500/50', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', accent: '#8b5cf6', icon: '🚌' },
  'Civic Infrastructure': { gradient: 'from-orange-950/60 via-orange-900/30 to-bwb-surface/90', border: 'border-orange-500/50', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', accent: '#f97316', icon: '🏙️' },
}

const techCategoryBadges: Record<string, string> = {
  Intelligence: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Connectivity: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Mobility: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Security: 'bg-red-500/20 text-red-300 border-red-500/30',
  Interface: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

export default function ProjectorPage() {
  const { game, setGame } = useGameStore()
  const [allGames, setAllGames] = useState<Game[]>([])
  const [catalog, setCatalog] = useState<{ problems: Problem[]; technologies: Technology[] }>({ problems: [], technologies: [] })
  const [activeProblemIndex, setActiveProblemIndex] = useState(0)
  const [autoCycle, setAutoCycle] = useState(true)
  const [manualOverridePhase, setManualOverridePhase] = useState<GamePhase | null>(null)

  // Stage Mascot & Announcer States
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [mascotWiggle, setMascotWiggle] = useState(false)
  const [flowerSpin, setFlowerSpin] = useState(false)
  const [isBlushing, setIsBlushing] = useState(false)
  const [stageParticles, setStageParticles] = useState<{ id: number; emoji: string; x: number; y: number }[]>([])


  // Live Stage Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isPast: boolean
    hasSchedule: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    hasSchedule: false,
  })

  // Real-time synchronization
  useRealtimeGame()

  useEffect(() => {
    if (!game.id) return
    const interval = setInterval(() => {
      api.getGame(game.id).then(setGame).catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [game.id, setGame])

  // Fetch catalog & active games
  useEffect(() => {
    api.getCatalog().then(setCatalog).catch(() => {})
    const loadGames = async () => {
      try {
        const games = await api.listGames()
        setAllGames(games)
        if (games.length > 0 && !game.id) {
          const active = games.find((g) => g.phase !== 'RESULTS') ?? games[0]
          setGame(active)
        }
      } catch { /* ignore fallback */ }
    }
    loadGames()
  }, [game.id, setGame])

  // Live auto-cycle for Problem Reveal showcase on projector
  useEffect(() => {
    if (!autoCycle || catalog.problems.length === 0) return
    const timer = setInterval(() => {
      setActiveProblemIndex((prev) => (prev + 1) % catalog.problems.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [autoCycle, catalog.problems.length])

  // Auto-cycle stage announcements
  useEffect(() => {
    const announcer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % STADIUM_ANNOUNCEMENTS.length)
    }, 4500)
    return () => clearInterval(announcer)
  }, [])

  // Calculate live stadium countdown
  useEffect(() => {
    if (!game.scheduledStartTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, hasSchedule: false })
      return
    }

    const calculateTime = () => {
      const target = new Date(game.scheduledStartTime!).getTime()
      const now = Date.now()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, hasSchedule: true })
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / 1000 / 60) % 60)
        const seconds = Math.floor((diff / 1000) % 60)
        setTimeLeft({ days, hours, minutes, seconds, isPast: false, hasSchedule: true })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [game.scheduledStartTime])

  const handleMascotClick = (e: React.MouseEvent) => {
    setMascotWiggle(true)
    setFlowerSpin(true)
    setIsBlushing(true)
    SoundFX.playCutePop()
    setTimeout(() => setMascotWiggle(false), 800)
    setTimeout(() => setFlowerSpin(false), 850)
    setTimeout(() => setIsBlushing(false), 1100)

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const burst = ['✨', '⚡', '🏆', '🔥', '💖', '🎉', '🌸', '🌵', '💫'].map((emoji, i) => ({
      id: Date.now() + i + Math.random(),
      emoji,
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 20 - 10),
    }))
    setStageParticles((prev) => [...prev, ...burst])
    setTimeout(() => setStageParticles((prev) => prev.filter((p) => !burst.some((b) => b.id === p.id))), 1200)
  }

  // Active display phase (auto follows game phase unless manually overridden)
  const currentPhase: GamePhase = manualOverridePhase ?? game.phase ?? 'LOBBY'
  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const isResults = currentPhase === 'RESULTS' || game.currentRound === 3
  const activeProblem = catalog.problems[activeProblemIndex] ?? game.currentProblem ?? catalog.problems[0]
  const activeProblemTheme = activeProblem ? categoryThemes[activeProblem.category] : null
  const pitchTeam = game.teams.find((t) => t.id === game.currentPitchTeamId) ?? null
  const pitchedTeamIds = game.pitchedTeamIds || []

  const totalParticipants = game.teams.reduce((acc, t) => acc + (t.members?.length ?? 0), 0)
  const totalCardsRevealed = game.teams.reduce((acc, t) => acc + (t.revealedCards?.length ?? 0), 0)
  const totalSubmissions = game.teams.filter((t) => !!t.submission).length
  const isRoomFull = game.teams.length >= (game.maxTeams || 32)
  const lobbyTeams = game.currentRound === 3 && (game.finalistTeamIds?.length ?? 0) > 0
    ? game.teams.filter((team) => game.finalistTeamIds?.includes(team.id))
    : game.teams
  const currentAnnouncement = STADIUM_ANNOUNCEMENTS[announcementIndex]

  return (
    <div className="projector-mobile-view min-h-screen bg-bwb-bg grid-bg text-bwb-text flex flex-col select-none overflow-x-hidden font-sans">
      {/* Top HUD & Projectionist Bar */}
      <header className="px-4 sm:px-6 py-3 bg-bwb-surface/80 backdrop-blur-xl border-b border-bwb-border flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-4 z-50">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Radio className="text-bwb-accent animate-pulse" size={18} />
            <span className="font-display font-bold text-sm sm:text-base tracking-wider uppercase text-gradient whitespace-nowrap">
              Build Without Building
            </span>
          </div>

          <div className="h-4 w-px bg-bwb-border hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            {allGames.length > 1 ? (
              <select
                value={game.id}
                onChange={(e) => {
                  const target = allGames.find((g) => g.id === e.target.value)
                  if (target) setGame(target)
                }}
                className="bg-bwb-surface-2 border border-bwb-border rounded-xl px-2.5 py-1 text-xs font-semibold text-bwb-text focus:outline-none focus:border-bwb-accent"
              >
                {allGames.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.code})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-mono font-bold text-bwb-text truncate">{game.name || 'Arena Broadcast'}</span>
            )}
          </div>
        </div>

        {/* Round-Aware Stage Director Phase Bar */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-1 bg-bwb-surface-2/80 p-1 rounded-xl border border-white/10 text-[11px] font-mono font-bold">
            <span className="px-2 py-0.5 text-[10px] text-purple-300 bg-purple-500/20 rounded-md mr-1 border border-purple-500/30">
              Round {currentRound}
            </span>
            {(() => {
              const activeRoundPhases: GamePhase[] =
                currentRound === 1
                  ? ['LOBBY', 'PROBLEM_REVEAL', 'CARD_REVEAL', 'BUILDING', 'PITCHING', 'JUDGING', 'LEADERBOARD']
                  : currentRound === 2
                  ? ['LOBBY', 'BUILDING', 'PITCHING', 'JUDGING', 'LEADERBOARD']
                  : ['LOBBY', 'BUILDING', 'PITCHING', 'JUDGING', 'RESULTS']

              return activeRoundPhases.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setManualOverridePhase(p === game.phase ? null : p)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currentPhase === p
                      ? 'bg-bwb-accent text-bwb-bg shadow-sm font-black'
                      : 'text-bwb-muted hover:text-bwb-text hover:bg-white/5'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))
            })()}
          </div>

          <div className="lg:hidden">
            <PhaseIndicator phase={currentPhase} />
          </div>
        </div>
      </header>

      {/* Main Projector Stage Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 relative max-w-[1600px] w-full mx-auto justify-center">
        {/* ============================================================
            1. LOBBY PHASE: UNIQUE GRAND STADIUM BROADCAST STAGE
            ============================================================ */}
        {currentPhase === 'LOBBY' && (
          <div className="w-full flex flex-col items-center justify-center my-auto space-y-8">
            {/* GRAND BROADCAST STADIUM SHOWCASE HERO */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden bg-gradient-to-b from-bwb-surface-2/95 via-bwb-surface/95 to-bwb-bg/95 backdrop-blur-2xl"
            >
              {/* Stadium Neon Mesh Lighting */}
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-[110px] pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[110px] pointer-events-none" />
              <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />

              {/* STAGE HEADER: Live Mascot & Stadium Broadcast Ticker */}
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-white/10">
                {/* Left: Grand Broadcast Mascot with Interactive Physics */}
                <div className="flex items-center gap-6 text-left">
                  <div
                    onClick={handleMascotClick}
                    className="relative cursor-pointer group select-none shrink-0"
                    title="Click Spike for stadium sparkles!"
                  >
                    {/* Floating Glow Halo */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-full blur-xl group-hover:opacity-100 opacity-70 transition-opacity" />

                    <motion.div
                      animate={
                        mascotWiggle
                          ? { rotate: [-10, 10, -10, 8, -4, 0], scale: [1, 1.15, 1], y: [0, -12, 0] }
                          : { y: [0, -8, 0], rotate: [-2, 2, -2] }
                      }
                      transition={
                        mascotWiggle
                          ? { duration: 0.75, ease: 'easeOut' }
                          : { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
                      }
                      className="w-28 h-32 sm:w-32 sm:h-36 relative inline-flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.45)] group-hover:scale-105 transition-transform will-change-transform"
                    >
                      <svg viewBox="0 0 100 134" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="projPotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FDBA74" />
                            <stop offset="50%" stopColor="#F97316" />
                            <stop offset="100%" stopColor="#C2410C" />
                          </linearGradient>
                          <linearGradient id="projCactusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6EE7B7" />
                            <stop offset="30%" stopColor="#34D399" />
                            <stop offset="75%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#047857" />
                          </linearGradient>
                        </defs>

                        {/* Pot Base with 3D Bevel & Shadow */}
                        <path d="M22 92 L29 122 Q50 126 71 122 L78 92 Z" fill="url(#projPotGrad)" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M18 87 Q50 82 82 87 L80 93 Q50 88 20 93 Z" fill="#FB923C" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
                        <ellipse cx="50" cy="88" rx="28" ry="3.5" fill="#7C2D12" opacity="0.7" />

                        {/* Left Cute Stubby Arm (Chubby Branch) */}
                        <motion.g
                          animate={mascotWiggle ? { rotate: [-12, 14, -12] } : undefined}
                          transition={{ repeat: 1, duration: 0.35, ease: 'easeInOut' }}
                          style={{ transformOrigin: '32px 64px' }}
                        >
                          <path
                            d="M32 66 C18 66 10 66 10 50 L10 38 C10 28 20 28 20 38 L20 48 C20 54 26 54 32 54 Z"
                            fill="url(#projCactusGrad)"
                            stroke="#064E3B"
                            strokeWidth="2.2"
                            strokeLinejoin="round"
                          />
                          <path d="M15 38 L15 48 C15 51 18 52 24 52" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
                          <circle cx="8" cy="46" r="1.2" fill="#D1FAE5" />
                        </motion.g>

                        {/* Right Cute Stubby Arm (Waving Branch) */}
                        <motion.g
                          animate={{ rotate: [-10, 18, -10] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          style={{ transformOrigin: '68px 60px' }}
                        >
                          <path
                            d="M68 54 C74 54 80 54 80 48 L80 32 C80 22 90 22 90 32 L90 46 C90 62 82 62 68 62 Z"
                            fill="url(#projCactusGrad)"
                            stroke="#064E3B"
                            strokeWidth="2.2"
                            strokeLinejoin="round"
                          />
                          <path d="M85 32 L85 46 C85 52 80 54 74 54" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
                          <circle cx="92" cy="40" r="1.2" fill="#D1FAE5" />
                        </motion.g>

                        {/* Chubby Round Cactus Body (Plump Capsule with Outlines) */}
                        <path
                          d="M28 36 C28 14 72 14 72 36 L72 89 Q50 93 28 89 Z"
                          fill="url(#projCactusGrad)"
                          stroke="#064E3B"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        {/* Highlight Curved Ridges */}
                        <path d="M42 20 Q48 18 48 90" stroke="#A7F3D0" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.45" />
                        <path d="M58 20 Q52 18 52 90" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

                        {/* Top Spinning Kawaii Cherry Blossom Cluster */}
                        <motion.g
                          animate={flowerSpin ? { rotate: 360, scale: [1, 1.25, 1] } : undefined}
                          transition={{ duration: 0.75, repeat: 0 }}
                          style={{ transformOrigin: '50px 14px' }}
                        >
                          <circle cx="50" cy="14" r="7.5" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
                          <circle cx="42" cy="11" r="5.5" fill="#FB7185" />
                          <circle cx="58" cy="11" r="5.5" fill="#FB7185" />
                          <circle cx="50" cy="6" r="5.5" fill="#FDA4AF" />
                          <circle cx="43" cy="19" r="5" fill="#FDA4AF" />
                          <circle cx="57" cy="19" r="5" fill="#FDA4AF" />
                          <circle cx="50" cy="14" r="4" fill="#FEF08A" stroke="#EAB308" strokeWidth="0.8" />
                        </motion.g>

                        {/* Big Glossy Anime Eyes with Catchlights */}
                        {mascotWiggle ? (
                          <g>
                            <path d="M38 42 Q43 35 48 42" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                            <path d="M52 42 Q57 35 62 42" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                          </g>
                        ) : (
                          <g>
                            <ellipse cx="43" cy="41" rx="4.5" ry="5.2" fill="#064E3B" />
                            <ellipse cx="57" cy="41" rx="4.5" ry="5.2" fill="#064E3B" />
                            <circle cx="41.5" cy="39" r="2" fill="#FFFFFF" />
                            <circle cx="55.5" cy="39" r="2" fill="#FFFFFF" />
                            <circle cx="44.8" cy="43.5" r="1" fill="#FFFFFF" />
                            <circle cx="58.8" cy="43.5" r="1" fill="#FFFFFF" />
                          </g>
                        )}

                        {/* Soft Blushing Rosy Cheeks */}
                        <ellipse
                          cx="36"
                          cy="49"
                          rx={isBlushing ? 5 : 4}
                          ry={isBlushing ? 3.2 : 2.5}
                          fill={isBlushing ? '#F43F5E' : '#FB7185'}
                          opacity={isBlushing ? 0.95 : 0.75}
                        />
                        <ellipse
                          cx="64"
                          cy="49"
                          rx={isBlushing ? 5 : 4}
                          ry={isBlushing ? 3.2 : 2.5}
                          fill={isBlushing ? '#F43F5E' : '#FB7185'}
                          opacity={isBlushing ? 0.95 : 0.75}
                        />

                        {/* Sweet Happy Anime Smile */}
                        <path d="M46 47 Q50 53 54 47" stroke="#064E3B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                      </svg>

                      {/* Click Burst Particles */}
                      {stageParticles.map((p) => (
                        <motion.span
                          key={p.id}
                          initial={{ opacity: 1, scale: 0.6, x: p.x, y: p.y }}
                          animate={{ opacity: 0, scale: 1.5, y: p.y - 45 }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className="absolute text-sm pointer-events-none select-none z-30"
                        >
                          {p.emoji}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>

                  {/* Stage Mascot Dialogue & Broadcast Ticker */}
                  <div className="space-y-2 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>{currentAnnouncement.tag}</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.h3
                        key={announcementIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="font-display font-black text-xl sm:text-2xl text-bwb-text leading-snug"
                      >
                        <span className="mr-2">{currentAnnouncement.icon}</span>
                        {currentAnnouncement.text}
                      </motion.h3>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right: Grand Auditorium Join HUD Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-bwb-bg/90 border border-bwb-accent/40 shadow-xl text-left space-y-3 min-w-[280px] shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-bwb-success animate-pulse" />
                      <span className="text-[11px] font-mono uppercase text-bwb-muted font-bold tracking-widest">
                        Auditorium Entry
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-bwb-accent bg-bwb-accent/10 px-2 py-0.5 rounded-md border border-bwb-accent/20">
                      /join
                    </span>
                  </div>

                  {/* Giant Room PIN */}
                  <div className="p-3 rounded-xl bg-bwb-surface-2 border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold">Room Game Code</p>
                      <p className="font-mono text-2xl sm:text-3xl font-black text-bwb-accent tracking-widest select-all">
                        {game.code || 'BWB-LIVE'}
                      </p>
                    </div>
                    <Radio size={22} className="text-bwb-accent animate-pulse shrink-0" />
                  </div>

                  {/* Live Capacity Meter */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-bwb-muted flex items-center gap-1.5 font-medium">
                      <Users size={13} className="text-bwb-accent" /> Capacity:
                    </span>
                    <span className={`font-bold ${isRoomFull ? 'text-rose-400' : 'text-bwb-text'}`}>
                      {game.teams.length} / {game.maxTeams || 32} Squads {isRoomFull ? '(Full)' : `(${(game.maxTeams || 32) - game.teams.length} slots left)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* STAGE CENTER: GRAND COUNTDOWN OR STANDBY RADAR */}
              {timeLeft.hasSchedule && !timeLeft.isPast ? (
                <div className="mb-8 p-6 rounded-2xl bg-bwb-bg/90 border border-amber-400/40 shadow-inner relative overflow-hidden text-center">
                  <div className="flex flex-col items-center gap-1 mb-4">
                    <p className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold flex items-center gap-2">
                      <Clock size={15} className="animate-spin text-amber-400" />
                      <span>TOURNAMENT STARTS IN</span>
                    </p>
                    {game.scheduledStartTime && (
                      <span className="text-xs font-mono text-bwb-muted font-semibold">
                        Scheduled for: {new Date(game.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center font-mono">
                    <div className="p-3 sm:p-5 rounded-2xl bg-bwb-surface border border-white/5 shadow-lg">
                      <span className="block text-3xl sm:text-6xl font-black text-bwb-text">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-bwb-muted uppercase font-bold tracking-widest mt-1 block">Days</span>
                    </div>
                    <div className="p-3 sm:p-5 rounded-2xl bg-bwb-surface border border-white/5 shadow-lg">
                      <span className="block text-3xl sm:text-6xl font-black text-bwb-text">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-bwb-muted uppercase font-bold tracking-widest mt-1 block">Hours</span>
                    </div>
                    <div className="p-3 sm:p-5 rounded-2xl bg-bwb-surface border border-white/5 shadow-lg">
                      <span className="block text-3xl sm:text-6xl font-black text-bwb-text">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-bwb-muted uppercase font-bold tracking-widest mt-1 block">Mins</span>
                    </div>
                    <div className="p-3 sm:p-5 rounded-2xl bg-bwb-surface border border-amber-400/40 shadow-lg shadow-amber-400/10">
                      <span className="block text-3xl sm:text-6xl font-black text-amber-400 animate-pulse">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-amber-400 uppercase font-bold tracking-widest mt-1 block">Secs</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-5 rounded-2xl bg-bwb-bg/80 border border-emerald-500/30 shadow-inner flex items-center justify-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-300 tracking-wider uppercase">
                    Host Standby Mode · Tournament Launches Live When Round 1 Begins
                  </span>
                </div>
              )}

              {/* STAGE FOOTER: 3-ROUND CHAMPIONSHIP ROADMAP & 7-STAGE PIPELINE */}
              <div className="space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs font-mono uppercase text-bwb-muted font-bold tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-bwb-accent" />
                    <span>Tournament Format & Championship Rules</span>
                  </p>
                  <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                    ⏱️ Total Event Runtime: ~4.5 to 5.0 Hours
                  </span>
                </div>

                {/* 3-Round Format Cards */}
                <div className="grid sm:grid-cols-3 gap-3.5">
                  {/* Round 1 */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-purple-500/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">ROUND 1 · 100 PTS</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">45m Build · Zero Elim</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Problem & Existing Landscape</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      Select 1 of 8 problems, draft 3 surprise tech cards, and pitch your deep problem understanding, root causes, and critique of existing solutions.
                    </p>
                  </div>

                  {/* Round 2 */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-bwb-accent/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-bwb-accent/20 text-bwb-accent font-mono text-[10px] font-bold">ROUND 2 · 100 PTS</span>
                      <span className="text-[10px] font-mono text-bwb-accent font-bold">30m Build · Top 8</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Solution & Tech Architecture</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      Present how you enhance your solution, integrate all 3 surprise tech cards, and deliver novel ideation. Top 8 squads qualify for Grand Finals!
                    </p>
                  </div>

                  {/* Round 3 */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-amber-500/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">ROUND 3 · GRAND FINALS</span>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">30m Polish · Top 4</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Master Pitch & Defense</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      Top 8 Finalists pitch refined master architectures and defend against live judge Q&A. Top 4 squads are crowned on the championship podium!
                    </p>
                  </div>
                </div>

                {/* 7-Stage Live Pipeline Bar */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-bwb-muted">
                  <span className="font-bold text-bwb-text flex items-center gap-1">
                    <Zap size={12} className="text-amber-400" /> 7-Stage Flow:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-bwb-text">1. Lobby</span>
                    <span>➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-bwb-text">2. Problem Reveal</span>
                    <span>➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-bwb-text">3. Card Draft</span>
                    <span>➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-bwb-text">4. Build</span>
                    <span>➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-bwb-text">5. Pitch</span>
                    <span>➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-purple-300">6. Judging</span>
                    <span>➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold">7. Prize Podium</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Teams & Players Arena Wall (NO PASSCODES DISPLAYED) */}
            <div className="w-full max-w-6xl">
              <div className="mb-5 pb-3 border-b border-bwb-border">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Users className="text-bwb-accent shrink-0" size={24} />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-bwb-text">
                    {game.currentRound === 3 ? 'Grand Finalists (Top 8)' : `Registered Arena Teams (${lobbyTeams.length})`}
                  </h2>
                </div>
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-bwb-muted">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live in Room: {lobbyTeams.filter((t) => t.isOnline).length} / {lobbyTeams.length}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span>Total Players: <strong className="text-bwb-text">{totalParticipants}</strong></span>
                </div>
              </div>

              {lobbyTeams.length === 0 ? (
                <div className="stereo-card rounded-3xl p-12 text-center border border-dashed border-bwb-border">
                  <div className="w-16 h-16 rounded-full bg-bwb-surface-2 mx-auto flex items-center justify-center text-bwb-muted mb-4 animate-bounce">
                    <Users size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Waiting for teams to join…</h3>
                  <p className="text-sm text-bwb-muted">Open /join on your device and enter PIN {game.code}</p>
                </div>
              ) : (
                <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {lobbyTeams.map((team, idx) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.85, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ delay: idx * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
                        className="stereo-card rounded-2xl p-5 border border-bwb-border/80 hover:border-bwb-accent/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bwb-accent/20 to-bwb-purple/20 border border-bwb-accent/30 flex items-center justify-center font-display font-bold text-sm text-bwb-accent shadow-inner">
                              #{idx + 1}
                            </div>

                            {/* Live Presence Badge */}
                            {team.isOnline ? (
                              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-bwb-muted bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> OFFLINE
                              </span>
                            )}
                          </div>

                          <h4 className="font-display font-black text-lg text-bwb-text mb-2 truncate">
                            {team.name}
                          </h4>

                          {/* Member Chips with Leader Crown (NO PASSCODES) */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {team.members && team.members.length > 0 ? (
                              team.members.map((member, mIdx) => (
                                <span
                                  key={mIdx}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 truncate max-w-[140px] ${
                                    mIdx === 0
                                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                                      : 'bg-bwb-surface-2 text-bwb-muted border-white/5'
                                  }`}
                                >
                                  {mIdx === 0 && <Crown size={11} className="text-amber-400 shrink-0" />}
                                  <span className="truncate">{member}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-bwb-muted italic">1 player joined</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-bwb-muted font-mono">
                          <span>{team.members?.length || 1}/3 Players</span>
                          <span className="text-bwb-accent font-semibold">Registered</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            2. PROBLEM REVEAL PHASE: 8 PROBLEM STATEMENTS SHOWCASE
            ============================================================ */}
        {currentPhase === 'PROBLEM_REVEAL' && (
          <div className="w-full flex flex-col items-center justify-center my-auto">
            <div className="w-full max-w-6xl mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentRound === 1
                    ? 'Round 1 · Open Qualifier (No Elimination)'
                    : currentRound === 2
                    ? 'Round 2 · Problem Showdown (Top 8 Qualify)'
                    : 'Round 3 · Grand Finals (Top 4 Prized)'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Problem Reveal
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black flex items-center justify-center gap-3 text-gradient">
                <Sparkles className="text-emerald-400" size={36} />
                Problem Statements Showcase
              </h1>
              <p className="text-bwb-muted mt-2">{game.name || 'Build Without Building Tournament'}</p>
              <p className="text-bwb-muted text-sm mt-1">
                8 challenges revealed · Teams are currently selecting on their devices
              </p>
            </div>

            <div className="w-full max-w-6xl mb-6 flex flex-wrap items-center justify-end gap-4">

              {/* Showcase Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoCycle(!autoCycle)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    autoCycle ? 'bg-bwb-accent/15 text-bwb-accent border-bwb-accent/40' : 'bg-bwb-surface text-bwb-muted border-bwb-border'
                  }`}
                >
                  {autoCycle ? <Pause size={14} /> : <Play size={14} />}
                  <span>{autoCycle ? 'Auto-Cycling (7s)' : 'Paused'}</span>
                </button>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveProblemIndex((prev) => (prev > 0 ? prev - 1 : catalog.problems.length - 1))}
                    className="w-9 h-9 rounded-xl glass border border-bwb-border flex items-center justify-center text-bwb-muted hover:text-bwb-accent transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProblemIndex((prev) => (prev + 1) % catalog.problems.length)}
                    className="w-9 h-9 rounded-xl glass border border-bwb-border flex items-center justify-center text-bwb-muted hover:text-bwb-accent transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Giant Active Problem Showcase Card */}
            {activeProblem && activeProblemTheme && (
              <div className="w-full max-w-6xl mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProblem.id}
                    initial={{ opacity: 0, y: 25, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -25, scale: 0.96 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 220, damping: 22 }}
                    className={`rounded-3xl border-2 ${activeProblemTheme.border} bg-gradient-to-br ${activeProblemTheme.gradient} stereo-card p-8 sm:p-12 relative overflow-hidden shadow-2xl`}
                  >
                    {/* Background glow accent */}
                    <div
                      className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
                      style={{ backgroundColor: activeProblemTheme.accent }}
                    />

                    <div className="flex items-center justify-between gap-4 mb-6">
                      <span className={`px-4 py-1.5 rounded-xl text-sm font-bold border ${activeProblemTheme.badge} flex items-center gap-2 shadow-lg`}>
                        <span className="text-lg">{activeProblemTheme.icon}</span>
                        <span>{activeProblem.category}</span>
                      </span>

                      <span className="text-sm font-mono text-bwb-muted bg-bwb-bg/60 px-3 py-1 rounded-xl border border-white/5">
                        Problem {activeProblemIndex + 1} / {catalog.problems.length}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-bwb-text mb-6 leading-tight">
                      {activeProblem.title}
                    </h3>

                    {/* Problem Context */}
                    <div className="mb-6 p-5 rounded-2xl bg-bwb-bg/40 border border-white/5">
                      <p className="text-xs uppercase tracking-widest text-bwb-muted font-bold mb-2">
                        📌 The Problem Scenario:
                      </p>
                      <p className="text-base sm:text-lg text-bwb-text/90 leading-relaxed">
                        {activeProblem.description}
                      </p>
                    </div>

                    {/* Challenge Objective */}
                    {activeProblem.challenge && (
                      <div className="mb-6 p-5 rounded-2xl bg-bwb-surface-2/90 border border-bwb-accent/30 shadow-inner">
                        <p className="text-xs uppercase tracking-widest text-bwb-accent font-bold mb-2">
                          🎯 The Challenge:
                        </p>
                        <p className="text-base sm:text-xl text-bwb-text font-bold leading-snug">
                          {activeProblem.challenge}
                        </p>
                      </div>
                    )}

                    {/* Twist Banner */}
                    {activeProblem.twist && (
                      <div className="p-5 rounded-2xl bg-bwb-warn/15 border-2 border-bwb-warn/40 glass shadow-lg flex items-start gap-4">
                        <div className="p-2 rounded-xl bg-bwb-warn/20 text-bwb-warn shrink-0">
                          <Sparkles size={24} className="animate-spin" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-bwb-warn font-display font-bold mb-1">
                            COMPETITION TWIST / CONSTRAINT
                          </p>
                          <p className="text-base sm:text-lg text-bwb-text font-semibold">
                            {activeProblem.twist}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* 8 Problem Selector Thumbnails & Live Team Pick Tracker */}
            <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {catalog.problems.map((p, idx) => {
                const isCurrent = idx === activeProblemIndex
                const theme = categoryThemes[p.category]
                const teamsSelectingThis = game.teams.filter((t) => t.selectedProblemId === p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setActiveProblemIndex(idx); setAutoCycle(false) }}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[90px] ${
                      isCurrent
                        ? 'border-bwb-accent bg-bwb-accent/15 shadow-lg shadow-bwb-accent/20 ring-1 ring-bwb-accent'
                        : 'border-bwb-border bg-bwb-surface-2/70 hover:border-bwb-muted'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{theme?.icon ?? '💡'}</span>
                        <span className="font-mono text-[10px] text-bwb-muted">#{idx + 1}</span>
                      </div>
                      <p className="text-xs font-bold text-bwb-text truncate">{p.category}</p>
                    </div>

                    {teamsSelectingThis.length > 0 && (
                      <span className="mt-1 text-[10px] font-bold text-bwb-accent flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>{teamsSelectingThis.length} {teamsSelectingThis.length === 1 ? 'team' : 'teams'}</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            3. CARD REVEAL PHASE: REAL-TIME HOLOGRAPHIC TECH CARD MATRIX (16-TEAM OPTIMIZED)
            ============================================================ */}
        {currentPhase === 'CARD_REVEAL' && (
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center my-auto px-2 sm:px-4">
            {/* Header with Live Broadcast Badges */}
            <div className="w-full text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentRound === 1
                    ? 'Round 1 · Open Qualifier (100 Pts)'
                    : currentRound === 2
                    ? 'Round 2 · Problem Showdown (Top 8 Qualify)'
                    : 'Round 3 · Grand Finals (Top 4 Podium)'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-cyan-400 animate-spin" />
                  Live Holographic Card Draft
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black flex items-center justify-center gap-3 text-gradient">
                <Layers className="text-cyan-400" size={36} />
                Surprise Tech Card Matrix
              </h1>
              <p className="text-bwb-muted text-xs sm:text-sm mt-1 max-w-2xl mx-auto">
                Real-time draft feed · Each squad unlocks 3 surprise frontier technology cards to integrate into their architecture
              </p>
            </div>

            {/* Live Progress Bar & Stats Ticker */}
            <div className="w-full mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-bwb-surface-2/80 border border-white/10 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-bwb-text">
                  Squads Live: <strong className="text-bwb-accent">{game.teams.length} Teams</strong>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-bwb-muted">Revealed Cards: </span>
                  <strong className="text-cyan-400 font-bold text-sm">{totalCardsRevealed}</strong>
                  <span className="text-bwb-muted"> / {Math.max(1, game.teams.length * 3)}</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div>
                  <span className="text-bwb-muted">Draft Complete: </span>
                  <strong className="text-emerald-400 font-bold text-sm">
                    {game.teams.length > 0 ? Math.round((totalCardsRevealed / (game.teams.length * 3)) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Responsive Team Card Matrix (Generously sized for 1-16 teams) */}
            <div className={`w-full grid gap-4 sm:gap-6 mb-6 ${
              game.teams.length === 1
                ? 'grid-cols-1 max-w-4xl mx-auto'
                : game.teams.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto'
                : game.teams.length <= 4
                ? 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto'
                : game.teams.length <= 8
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}>
              {game.teams.map((team, tIdx) => {
                const teamTechs = (team.technologies && team.technologies.length >= 3)
                  ? team.technologies
                  : (catalog.technologies.length >= 3 ? catalog.technologies.slice(0, 3) : [])
                const revealedSlots = team.revealedCards ?? []
                const isFullyUnlocked = revealedSlots.length >= 3
                const isSingleTeam = game.teams.length === 1
                const isFewTeams = game.teams.length <= 4

                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: tIdx * 0.03, duration: 0.2 }}
                    className={`rounded-3xl p-5 sm:p-7 border transition-all duration-300 relative overflow-hidden shadow-2xl flex flex-col justify-between backdrop-blur-2xl ${
                      isFullyUnlocked
                        ? 'bg-gradient-to-b from-bwb-surface-2/95 via-bwb-surface/90 to-bwb-bg/95 border-cyan-400/50 shadow-[0_0_40px_rgba(0,229,199,0.12)] ring-1 ring-cyan-400/30'
                        : 'bg-bwb-surface/95 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Atmospheric Glow Flare behind Card */}
                    <div className="absolute top-0 right-1/4 w-72 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

                    {/* Top Team Header */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-3.5 border-b border-white/10 relative z-10">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`font-mono font-black rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shrink-0 shadow-sm ${
                          isSingleTeam ? 'text-sm sm:text-base px-3 py-1' : 'text-xs px-2.5 py-0.5'
                        }`}>
                          #{tIdx + 1}
                        </span>
                        <h4 className={`font-display font-black text-gradient tracking-tight truncate ${
                          isSingleTeam ? 'text-2xl sm:text-3xl' : isFewTeams ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                        }`}>
                          {team.name}
                        </h4>
                      </div>
                      <span className={`font-mono font-bold px-3.5 py-1 rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm ${
                        isSingleTeam ? 'text-xs' : 'text-[11px]'
                      } ${
                        isFullyUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-emerald-500/10'
                          : 'text-amber-300 bg-amber-500/10 border border-amber-400/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFullyUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{revealedSlots.length}/3 {isFullyUnlocked ? 'Active' : 'Drafting'}</span>
                      </span>
                    </div>

                    {/* 3 Holographic Card Slots with Glowing Chambers & Rich Aesthetics */}
                    <div className={`grid grid-cols-3 ${isSingleTeam ? 'gap-4 sm:gap-5' : 'gap-3'} relative z-10`}>
                      {[0, 1, 2].map((slotIdx) => {
                        const isRevealed = revealedSlots.includes(slotIdx)
                        const tech = teamTechs[slotIdx] || catalog.technologies[slotIdx]
                        const badgeStyle = tech ? techCategoryBadges[tech.category] ?? 'bg-bwb-surface-2 text-bwb-text border-bwb-border' : ''
                        const cat = tech?.category || 'Intelligence'

                        const glowTheme = isRevealed && tech ? (
                          cat === 'Intelligence' ? 'border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.22)] bg-gradient-to-b from-purple-950/30 via-bwb-surface-2/95 to-bwb-bg ring-1 ring-purple-500/30' :
                          cat === 'Connectivity' ? 'border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.22)] bg-gradient-to-b from-cyan-950/30 via-bwb-surface-2/95 to-bwb-bg ring-1 ring-cyan-500/30' :
                          cat === 'Infrastructure' ? 'border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.22)] bg-gradient-to-b from-amber-950/30 via-bwb-surface-2/95 to-bwb-bg ring-1 ring-amber-500/30' :
                          cat === 'Security' ? 'border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.22)] bg-gradient-to-b from-emerald-950/30 via-bwb-surface-2/95 to-bwb-bg ring-1 ring-emerald-500/30' :
                          cat === 'Interface' ? 'border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.22)] bg-gradient-to-b from-rose-950/30 via-bwb-surface-2/95 to-bwb-bg ring-1 ring-rose-500/30' :
                          'border-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.22)] bg-gradient-to-b from-indigo-950/30 via-bwb-surface-2/95 to-bwb-bg ring-1 ring-indigo-500/30'
                        ) : 'bg-bwb-bg/85 border-dashed border-white/15 neo-inset'

                        return (
                          <div
                            key={slotIdx}
                            className={`rounded-2xl border flex flex-col items-center justify-between text-center transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                              isSingleTeam
                                ? 'min-h-[190px] sm:min-h-[220px] p-4 sm:p-5'
                                : isFewTeams
                                ? 'min-h-[155px] sm:min-h-[175px] p-3.5'
                                : 'min-h-[125px] sm:min-h-[135px] p-2.5'
                            } ${glowTheme}`}
                          >
                            {/* Holographic Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                            {!isRevealed || !tech ? (
                              <div className="flex-1 flex flex-col items-center justify-center p-2">
                                <Sparkles size={isSingleTeam ? 28 : 20} className="text-cyan-400/40 mb-2 animate-pulse" />
                                <span className={`uppercase font-mono font-black text-bwb-muted tracking-widest ${
                                  isSingleTeam ? 'text-xs' : 'text-[10px]'
                                }`}>
                                  Slot #{slotIdx + 1}
                                </span>
                                <span className="text-[9px] font-mono text-bwb-muted/60 mt-0.5">Surprise Tech</span>
                              </div>
                            ) : (
                              <>
                                {/* Top Slot Monospace Tag */}
                                <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-bwb-muted mb-1 px-1">
                                  <span>SLOT 0{slotIdx + 1}</span>
                                  <span className="text-cyan-400">UNLOCKED</span>
                                </div>

                                {/* Futuristic Holographic Icon Chamber */}
                                <div className={`rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/15 shadow-[inset_0_0_20px_rgba(255,255,255,0.06)] my-auto transition-transform group-hover:scale-110 duration-300 ${
                                  isSingleTeam
                                    ? 'text-5xl sm:text-6xl p-3.5'
                                    : isFewTeams
                                    ? 'text-4xl sm:text-5xl p-2.5'
                                    : 'text-2xl sm:text-3xl p-2'
                                }`}>
                                  {tech.icon}
                                </div>

                                {/* Card Details */}
                                <div className="w-full mt-2">
                                  <p className={`font-black text-bwb-text leading-tight line-clamp-2 ${
                                    isSingleTeam
                                      ? 'text-base sm:text-lg md:text-xl'
                                      : isFewTeams
                                      ? 'text-sm sm:text-base md:text-lg'
                                      : 'text-xs sm:text-sm font-bold'
                                  }`} title={tech.name}>
                                    {tech.name}
                                  </p>
                                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-lg font-mono font-black border uppercase tracking-wider truncate max-w-full ${
                                    isSingleTeam ? 'text-[10px]' : 'text-[9px]'
                                  } ${badgeStyle}`}>
                                    {tech.category}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Multi-Row Alternating Holographic Tech Pool Marquee (No Scrollbars, Auto-Sliding Left/Right) */}
            <div className="w-full rounded-3xl bg-bwb-surface/90 border border-cyan-500/20 p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-3">
              {/* Left and Right Ambient Fade Masks */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-bwb-surface via-bwb-surface/90 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-bwb-surface via-bwb-surface/90 to-transparent z-10" />

              {/* Header Title */}
              <div className="flex items-center justify-between px-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-mono uppercase font-black text-cyan-300 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" /> Frontier Technology Catalog Pool ({Array.from(new Map(catalog.technologies.map((t) => [t.name.trim().toLowerCase(), t])).values()).length} Technologies)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-bwb-muted font-bold hidden sm:inline-block">
                  Live Holographic Draft Stream
                </span>
              </div>

              {/* Row 1: Slides Left */}
              {(() => {
                const uniqueTechs = Array.from(
                  new Map(catalog.technologies.map((t) => [t.name.trim().toLowerCase().replace(/s$/, ''), t])).values()
                )
                const total = uniqueTechs.length
                const r1 = uniqueTechs.slice(0, Math.ceil(total / 3))
                const r2 = uniqueTechs.slice(Math.ceil(total / 3), Math.ceil((total * 2) / 3))
                const r3 = uniqueTechs.slice(Math.ceil((total * 2) / 3))

                return (
                  <div className="space-y-2.5 overflow-hidden">
                    {/* Row 1: Leftward */}
                    <div className="flex overflow-hidden">
                      <motion.div
                        className="flex items-center gap-3 shrink-0"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ ease: 'linear', duration: 28, repeat: Infinity }}
                      >
                        {[...r1, ...r1].map((tech, idx) => {
                          const badgeStyle = techCategoryBadges[tech.category] ?? 'bg-bwb-surface-2 text-bwb-text border-bwb-border'
                          return (
                            <div
                              key={`${tech.id}-r1-${idx}`}
                              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-bwb-surface-2/90 border border-white/10 shadow-md flex items-center gap-2.5 shrink-0 hover:border-cyan-400/60 transition-all hover:scale-105"
                            >
                              <span className="text-xl sm:text-2xl">{tech.icon}</span>
                              <span className="text-xs sm:text-sm font-black text-bwb-text tracking-wide whitespace-nowrap">
                                {tech.name}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase shrink-0 ${badgeStyle}`}>
                                {tech.category}
                              </span>
                            </div>
                          )
                        })}
                      </motion.div>
                    </div>

                    {/* Row 2: Rightward */}
                    <div className="flex overflow-hidden">
                      <motion.div
                        className="flex items-center gap-3 shrink-0"
                        animate={{ x: ['-50%', '0%'] }}
                        transition={{ ease: 'linear', duration: 32, repeat: Infinity }}
                      >
                        {[...r2, ...r2].map((tech, idx) => {
                          const badgeStyle = techCategoryBadges[tech.category] ?? 'bg-bwb-surface-2 text-bwb-text border-bwb-border'
                          return (
                            <div
                              key={`${tech.id}-r2-${idx}`}
                              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-bwb-surface-2/90 border border-white/10 shadow-md flex items-center gap-2.5 shrink-0 hover:border-purple-400/60 transition-all hover:scale-105"
                            >
                              <span className="text-xl sm:text-2xl">{tech.icon}</span>
                              <span className="text-xs sm:text-sm font-black text-bwb-text tracking-wide whitespace-nowrap">
                                {tech.name}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase shrink-0 ${badgeStyle}`}>
                                {tech.category}
                              </span>
                            </div>
                          )
                        })}
                      </motion.div>
                    </div>

                    {/* Row 3: Leftward */}
                    <div className="flex overflow-hidden">
                      <motion.div
                        className="flex items-center gap-3 shrink-0"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
                      >
                        {[...r3, ...r3].map((tech, idx) => {
                          const badgeStyle = techCategoryBadges[tech.category] ?? 'bg-bwb-surface-2 text-bwb-text border-bwb-border'
                          return (
                            <div
                              key={`${tech.id}-r3-${idx}`}
                              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-bwb-surface-2/90 border border-white/10 shadow-md flex items-center gap-2.5 shrink-0 hover:border-amber-400/60 transition-all hover:scale-105"
                            >
                              <span className="text-xl sm:text-2xl">{tech.icon}</span>
                              <span className="text-xs sm:text-sm font-black text-bwb-text tracking-wide whitespace-nowrap">
                                {tech.name}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase shrink-0 ${badgeStyle}`}>
                                {tech.category}
                              </span>
                            </div>
                          )
                        })}
                      </motion.div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ============================================================
            4. BUILDING PHASE: LIVE COUNTDOWN & TEAMS STRATEGY ARENA
            ============================================================ */}
        {currentPhase === 'BUILDING' && (
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center my-auto px-4">
            {/* Round & Phase Badges + Title */}
            <div className="w-full text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentRound === 1
                    ? 'Round 1 · Open Qualifier (No Elimination)'
                    : currentRound === 2
                    ? 'Round 2 · Problem Showdown (Top 8 Qualify)'
                    : 'Round 3 · Grand Finals (Top 4 Prized)'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30">
                  Build Phase
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black flex items-center justify-center gap-3 text-gradient">
                <Zap className="text-amber-400" size={36} />
                Live Engineering Arena
              </h1>
              <p className="text-bwb-muted mt-2">{game.name || 'Build Without Building Tournament'}</p>
            </div>

            {/* Countdown Hero */}
            <div className="w-full text-center mb-8">
              <div className="stereo-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border-2 border-bwb-accent/40 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-bwb-accent/10 blur-3xl pointer-events-none" />
                <CountdownTimer
                  key={`proj-build-r${currentRound}`}
                  initialSeconds={getPhaseDuration(game.id, currentRound, 'BUILDING', game.buildDurationMinutes)}
                  size="xl"
                  label="BUILD PHASE TIME REMAINING"
                />
              </div>

              {/* Live Submission Status Tracker */}
              <div className="p-3.5 px-6 rounded-2xl glass border border-bwb-border max-w-2xl mx-auto flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="text-bwb-accent animate-pulse" size={18} />
                  <span>Submissions: <strong className="text-bwb-accent">{totalSubmissions}</strong> / {game.teams.length} teams submitted</span>
                </div>
                <div className="w-36 bg-bwb-surface-2 rounded-full h-3 overflow-hidden border border-white/5">
                  <div
                    className="bg-bwb-accent h-full transition-all duration-500 rounded-full"
                    style={{ width: `${game.teams.length > 0 ? (totalSubmissions / game.teams.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Live Teams Wall: Showing their actual chosen problem & tech stack */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
                  <Users size={18} className="text-bwb-accent" />
                  Live Team Challenges & Architectures
                </h3>
                <span className="text-xs font-mono text-bwb-muted">
                  {game.teams.length} Competing Teams
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {game.teams.map((team, tIdx) => {
                  const teamProblem = catalog.problems.find((p) => p.id === team.selectedProblemId) ?? catalog.problems[0]
                  const theme = teamProblem ? categoryThemes[teamProblem.category] : null
                  const teamTechs = (team.technologies && team.technologies.length >= 3)
                    ? team.technologies
                    : (catalog.technologies.length >= 3 ? catalog.technologies.slice(0, 3) : [])
                  const isSubmitted = !!team.submission

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: tIdx * 0.05 }}
                      className="stereo-card rounded-3xl p-5 border border-bwb-border relative overflow-hidden flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        {/* Team Header */}
                        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-bwb-accent font-bold px-2 py-0.5 rounded-lg bg-bwb-accent/10 border border-bwb-accent/20">
                              #{tIdx + 1}
                            </span>
                            <h4 className="font-display font-bold text-base text-bwb-text truncate">
                              {team.name}
                            </h4>
                          </div>

                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 border ${
                            isSubmitted
                              ? 'bg-bwb-success/20 text-bwb-success border-bwb-success/30'
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
                        </div>

                        {/* Chosen Problem */}
                        {teamProblem && theme && (
                          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.border} mb-3`}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${theme.badge}`}>
                                {theme.icon} {teamProblem.category}
                              </span>
                            </div>
                            <h5 className="font-display font-bold text-sm text-bwb-text leading-snug line-clamp-2">
                              {teamProblem.title}
                            </h5>
                            {teamProblem.twist && (
                              <p className="text-[10px] text-bwb-warn mt-1.5 font-medium line-clamp-1">
                                ⚡ Twist: {teamProblem.twist}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3 Assigned Tech Cards */}
                      <div>
                        <p className="text-[10px] uppercase font-mono text-bwb-muted font-bold mb-1.5">
                          Assigned Tech Stack:
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {teamTechs.map((tech) => (
                            <div
                              key={tech.id}
                              className="p-1.5 rounded-xl bg-bwb-surface-2 border border-white/5 flex items-center gap-1.5 text-xs text-bwb-text truncate"
                            >
                              <span className="text-sm shrink-0">{tech.icon}</span>
                              <span className="truncate font-semibold text-[11px]">{tech.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            5. PITCHING PHASE: GRAND STAGE & TEAM ARCHITECTURE SPOTLIGHT
            ============================================================ */}
        {(currentPhase === 'PITCHING' || currentPhase === 'JUDGE_ATTACK') && (() => {
          const roundConfig = PITCH_ROUND_CONFIG[currentRound] || PITCH_ROUND_CONFIG[1]
          return (
            <div className="w-full max-w-6xl mx-auto my-auto flex flex-col items-center justify-center px-4">
              {/* MINIMAL TOP BROADCAST HUD */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/15">
                      {roundConfig.roundLabel}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-sm ${roundConfig.badgeClass}`}>
                      {roundConfig.badge}
                    </span>
                    {currentPhase === 'JUDGE_ATTACK' && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Flame size={12} className="animate-bounce text-amber-400" />
                        <span>Judge Q&A Defense</span>
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-bwb-text tracking-tight flex items-center gap-2">
                    <Radio size={20} className="text-bwb-accent animate-pulse shrink-0" />
                    <span>{currentPhase === 'JUDGE_ATTACK' ? 'Live Defense & Technical Attack' : roundConfig.title}</span>
                  </h1>
                </div>

                {/* Session Clock */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-bwb-surface-2/90 border border-white/10 text-xs font-mono font-bold text-bwb-muted shrink-0 self-start sm:self-auto">
                  <span>Session:</span>
                  <CountdownTimer
                    initialSeconds={60 * 60}
                    size="sm"
                    running
                    showExpired={false}
                  />
                </div>
              </div>

              {/* Active Pitching Stage Hero */}
              {pitchTeam ? (
                <motion.div
                  key={pitchTeam.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-full stereo-card rounded-3xl p-6 sm:p-8 border-2 shadow-2xl relative overflow-hidden mb-6 bg-gradient-to-br ${roundConfig.glowGradient} ${roundConfig.borderColor}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-bwb-accent text-bwb-bg shadow-md">
                          ON STAGE NOW
                        </span>
                        <span className="text-xs text-bwb-muted font-mono">
                          {pitchTeam.members?.join(', ') || 'Team Members'}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-3xl sm:text-5xl text-bwb-text tracking-tight">
                        {pitchTeam.name}
                      </h3>
                    </div>

                    {/* Pitch / Defense Clock */}
                    <div className="p-3.5 sm:p-4 rounded-2xl stereo-card border border-white/15 bg-bwb-bg/80 text-center min-w-[160px] shadow-lg">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-bwb-accent font-bold mb-1 flex items-center justify-center gap-1">
                        <Clock size={12} />
                        <span>{currentPhase === 'JUDGE_ATTACK' ? 'Defense Clock' : 'Pitch Clock'}</span>
                      </p>
                      <CountdownTimer
                        initialSeconds={currentPhase === 'JUDGE_ATTACK' ? 30 : 90}
                        size="lg"
                      />
                    </div>
                  </div>

                  {/* Team's Problem & Tech Details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    {/* Problem Domain */}
                    {(() => {
                      const teamProblem = catalog.problems.find((p) => p.id === pitchTeam.selectedProblemId) ?? catalog.problems[0]
                      const theme = teamProblem ? categoryThemes[teamProblem.category] : null
                      return (
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${theme?.gradient ?? 'from-bwb-surface to-bwb-surface-2'} border ${theme?.border ?? 'border-white/10'} text-left space-y-1.5`}>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${theme?.badge} inline-block`}>
                            {theme?.icon} {teamProblem?.category}
                          </span>
                          <h4 className="font-display font-bold text-base text-bwb-text leading-snug">
                            {teamProblem?.title}
                          </h4>
                          {teamProblem?.twist && (
                            <p className="text-xs text-bwb-warn font-semibold">
                              ⚡ Constraint: {teamProblem.twist}
                            </p>
                          )}
                        </div>
                      )
                    })()}

                    {/* 3 Frontier Tech Cards */}
                    <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-white/10 flex flex-col justify-between text-left">
                      <p className="text-[10px] uppercase tracking-wider text-bwb-muted font-bold mb-2 flex items-center gap-1.5">
                        <Zap size={12} className="text-amber-400" />
                        <span>Assigned Frontier Tech:</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {((pitchTeam.technologies && pitchTeam.technologies.length >= 3) ? pitchTeam.technologies : catalog.technologies.slice(0, 3)).map((tech) => (
                          <div key={tech.id} className="p-2 rounded-xl bg-bwb-surface-2 border border-white/5 text-center">
                            <span className="text-2xl block mb-0.5">{tech.icon}</span>
                            <span className="text-xs font-bold text-bwb-text truncate block">{tech.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Architecture Summary */}
                  {pitchTeam.submission && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-bwb-bg/90 border border-white/10 text-left space-y-1.5">
                      <p className="text-xs uppercase font-mono tracking-widest text-bwb-accent font-bold">
                        {pitchTeam.submission.solutionName || 'System Architecture Proposal'}
                      </p>
                      <p className="text-sm text-bwb-text/90 leading-relaxed font-medium">
                        {pitchTeam.submission.whatItDoes || pitchTeam.submission.howItWorks}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* MINIMAL SLEEK WAITING CARD */
                <div className={`w-full stereo-card rounded-3xl p-8 sm:p-12 border-2 shadow-2xl text-center mb-6 bg-gradient-to-br ${roundConfig.glowGradient} ${roundConfig.borderColor}`}>
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-bwb-bg/80 border border-white/15 flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Mic size={38} className="text-bwb-accent animate-pulse" />
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-bwb-text uppercase tracking-widest mb-3">
                    <span className="w-2 h-2 rounded-full bg-bwb-accent animate-ping" />
                    <span>Stage Standby</span>
                  </div>

                  <h2 className="font-display font-black text-2xl sm:text-4xl text-bwb-text mb-2">
                    {roundConfig.waitingHeadline}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-bwb-muted max-w-md mx-auto mb-6">
                    {roundConfig.waitingSubtext}
                  </p>

                  {/* Minimal 4-Pill Evaluation Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {roundConfig.focusHighlights.map((f) => (
                      <div key={f.label} className="p-3 rounded-2xl bg-bwb-bg/70 border border-white/10 text-center">
                        <span className="text-lg block mb-0.5">{f.icon}</span>
                        <span className="text-xs font-bold text-bwb-text block truncate">{f.label}</span>
                        <span className={`text-[11px] font-mono font-bold ${roundConfig.accentColor}`}>{f.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Presentation Queue Bar */}
              <div className="w-full flex items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-xs font-mono text-bwb-muted mr-1 shrink-0 font-bold">Stage Queue:</span>
                {game.teams.map((team, idx) => {
                  const isCurrent = team.id === (pitchTeam?.id ?? '')
                  const isPitched = pitchedTeamIds.includes(team.id)
                  return (
                    <div
                      key={team.id}
                      className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isCurrent
                          ? 'bg-bwb-accent text-bwb-bg border-bwb-accent shadow-md scale-105'
                          : isPitched
                          ? 'bg-bwb-success/15 text-bwb-success border-bwb-success/30'
                          : 'bg-bwb-surface-2 text-bwb-muted border-bwb-border'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      <span>{team.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* ============================================================
            6. JUDGING PHASE: GRAND STADIUM EVALUATION & DELIBERATION ARENA
            ============================================================ */}
        {currentPhase === 'JUDGING' && (
          <div className="w-full max-w-5xl mx-auto my-auto px-4">
            {/* Top Judging Banner */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentRound === 1
                    ? 'Round 1 · Open Qualifier (No Elimination)'
                    : currentRound === 2
                    ? 'Round 2 · Problem Showdown (Top 8 Qualify)'
                    : 'Round 3 · Grand Finals (Top 4 Prized)'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Jury Deliberation
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black flex items-center justify-center gap-3 text-gradient">
                <Sparkles className="text-purple-400" size={36} />
                Jury Evaluating Architectures
              </h1>
              <p className="text-bwb-muted mt-2">{game.name || 'Build Without Building Tournament'}</p>
              <p className="text-sm sm:text-base text-bwb-muted font-medium mt-1">
                Evaluating technical feasibility, creativity, problem understanding, and team defenses.
              </p>
            </div>

            {/* Stadium Progress Bar Hero */}
            <div className="stereo-card rounded-3xl p-6 sm:p-8 mb-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-bwb-surface-2 to-bwb-surface shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <span className="text-xs font-mono uppercase font-bold text-purple-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                  Live Evaluation Progress
                </span>
                <span className="text-sm font-mono font-black text-bwb-accent">
                  {game.teams.filter((t) => (t.score ?? 0) > 0).length} of {game.teams.length} Squads Evaluated
                </span>
              </div>

              <div className="w-full bg-bwb-bg rounded-full h-4 overflow-hidden p-0.5 border border-white/10 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${game.teams.length > 0 ? Math.round((game.teams.filter((t) => (t.score ?? 0) > 0).length / game.teams.length) * 100) : 0}%`,
                  }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-r from-purple-500 via-bwb-accent to-pink-500 h-full rounded-full shadow-lg"
                />
              </div>
            </div>

            {/* Competing Squads Evaluation Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {game.teams.map((team, idx) => {
                const isScored = (team.score ?? 0) > 0
                return (
                  <div
                    key={team.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 shadow-md ${
                      isScored
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-bwb-surface border-white/5 text-bwb-muted'
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-[10px] font-mono font-bold block opacity-70">
                        Squad #{idx + 1}
                      </span>
                      <p className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate">
                        {team.name}
                      </p>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                      isScored
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}>
                      {isScored ? '✓ Scored' : '⚖️ Grading'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            7. TOURNAMENT LEADERBOARD & ANIMATED PODIUM REVEAL
            ============================================================ */}
        {(currentPhase === 'LEADERBOARD' || currentPhase === 'FINAL_ROUND' || currentPhase === 'RESULTS') && (
          <div className="w-full max-w-5xl mx-auto my-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentRound === 1
                    ? 'Round 1 · Open Qualifier (No Elimination)'
                    : currentRound === 2
                    ? 'Round 2 · Problem Showdown (Top 8 Qualify)'
                    : 'Round 3 · Grand Finals (Top 4 Prized)'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30">
                  Leaderboard
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-black flex items-center justify-center gap-3 text-gradient">
                <Trophy className="text-bwb-gold" size={48} />
                {isResults || currentRound === 3 ? 'Grand Finals Championship Results' : `Round ${currentRound} Leaderboard`}
              </h1>
              <p className="text-bwb-muted mt-2">{game.name || 'Build Without Building Tournament'}</p>
            </div>

            {/* 3D Animated Esports Podium for Finals / Results */}
            {((currentPhase === 'RESULTS' || game.currentRound === 3) && game.teams.length > 0) && (
              <TournamentPodium teams={game.teams} />
            )}

            {/* Complete Rank Breakdown */}
            <LeaderboardTable
              teams={game.teams}
              showMovement
              round={currentRound}
              isFinalResults={currentPhase === 'RESULTS' || game.currentRound === 3}
            />

            {/* Round Explanatory Card */}
            <div className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-bwb-surface via-bwb-surface-2 to-bwb-surface p-4 text-center">
              {currentRound === 1 ? (
                <p className="text-xs sm:text-sm text-bwb-text">
                  ✨ <strong className="text-bwb-accent">Round 1 (No Elimination)</strong>: All registered teams advance to Round 2 to compete across the 8 Problem Statements (max 2 teams per problem).
                </p>
              ) : currentRound === 2 ? (
                <p className="text-xs sm:text-sm text-bwb-text">
                  ⚡ <strong className="text-emerald-400">Round 2 Showdown</strong>: The <strong className="text-bwb-accent">Top 8 teams</strong> on this leaderboard advance to the Grand Finals (Round 3).
                </p>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono font-bold text-bwb-text">
                  <span className="flex items-center gap-1 text-bwb-gold"><Trophy size={14} /> 1st: Champion (1)</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-300"><Award size={14} /> 2nd: Runner-Up (1)</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-amber-400"><Award size={14} /> 3rd: Dual Bronze (2)</span>
                </div>
              )}
            </div>
          </div>
        )}


      </main>

      {/* Projector Footer Status Bar */}
      <footer className="px-6 py-2 bg-bwb-surface/50 border-t border-bwb-border text-xs text-bwb-muted flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-bwb-success animate-pulse" />
          <span>Realtime Stream Active</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Active Game: <strong className="text-bwb-text">{game.code || 'None'}</strong></span>
          <span>Phase: <strong className="text-bwb-accent">{currentPhase}</strong></span>
        </div>
      </footer>
    </div>
  )
}
