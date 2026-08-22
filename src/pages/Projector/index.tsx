import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Sparkles, Trophy, Play, Pause,
  ChevronLeft, ChevronRight, CheckCircle2, Radio, Activity,
  Crown, Clock, Layers, Zap, Mic
} from 'lucide-react'
import { CountdownTimer } from '../../components/timer/CountdownTimer'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { TournamentPodium } from '../../components/leaderboard/TournamentPodium'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { Badge } from '../../components/ui/Badge'
import { SoundFX } from '../../lib/soundEffects'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import type { Game, GamePhase, Problem, Technology } from '../../types'

const STADIUM_ANNOUNCEMENTS = [
  { icon: '🚀', tag: 'ARENA STAGE BROADCAST', text: 'Welcome squads! Connect your devices at /join and prepare your architecture strategy!' },
  { icon: '⚡', tag: '3-ROUND TOURNAMENT', text: 'Round 1 (Open Qualifier) ➔ Round 2 (Problem Showdown) ➔ Round 3 (Grand Finals)!' },
  { icon: '🎯', tag: '8 REAL-WORLD DOMAINS', text: 'Prepare for challenges across Disaster Response, Urban Mobility, Healthcare & more!' },
  { icon: '🤖', tag: 'SURPRISE TECH CARDS', text: 'Draft 3 surprise frontier tech cards and integrate them into a 15-minute system pitch!' },
  { icon: '🏆', tag: 'CHAMPIONSHIP PODIUM', text: 'Top 8 squads defend live on stage · Top 4 crowned on the prize podium with trophies!' },
  { icon: '⏱️', tag: 'RAPID ARCHITECTURE', text: 'Formulate system flows, edge-to-cloud handshakes, and realistic BOM feasibility!' },
]

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

        {/* Manual Phase Switcher for Stage Director */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <div className="hidden xl:flex items-center gap-1 bg-bwb-surface-2/60 p-1 rounded-xl border border-white/5 text-[11px] font-mono font-bold">
            {(['LOBBY', 'PROBLEM_REVEAL', 'CARD_REVEAL', 'BUILDING', 'PITCHING', 'JUDGING', 'LEADERBOARD', 'RESULTS'] as GamePhase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setManualOverridePhase(p === game.phase ? null : p)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currentPhase === p
                    ? 'bg-bwb-accent text-bwb-bg shadow-sm'
                    : 'text-bwb-muted hover:text-bwb-text'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>

          <PhaseIndicator phase={currentPhase} />
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
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
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase text-bwb-muted font-bold tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-bwb-accent" />
                    <span>Tournament Format & Championship Rules</span>
                  </p>
                  <span className="text-[11px] font-mono text-bwb-muted">
                    No Elimination in Round 1
                  </span>
                </div>

                {/* 3-Round Format Cards */}
                <div className="grid sm:grid-cols-3 gap-3.5">
                  {/* Round 1 */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-purple-500/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">ROUND 1</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Qualify</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Open Qualifier</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      Choose from 8 problem domains, draft 3 surprise tech cards, and create a 15-minute system architecture.
                    </p>
                  </div>

                  {/* Round 2 */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-bwb-accent/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-bwb-accent/20 text-bwb-accent font-mono text-[10px] font-bold">ROUND 2</span>
                      <span className="text-[10px] font-mono text-bwb-accent font-bold">Top 8 Advance</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Problem Showdown</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      8 challenge tracks with max 2 teams per statement. The Top 8 squads advance to the Grand Finals.
                    </p>
                  </div>

                  {/* Round 3 */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-amber-500/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">ROUND 3</span>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">Top 4 Prized</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Grand Finals & Podium</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      Top 8 Finalists defend live on stage. Top 4 teams receive championship trophies and prize podium awards!
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
            <div className="w-full max-w-6xl mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge variant="accent" className="mb-1 text-xs">Phase 1 of 4</Badge>
                <h2 className="font-display text-3xl sm:text-4xl font-bold">
                  Problem Statements Showcase
                </h2>
                <p className="text-bwb-muted text-sm mt-1">
                  8 challenges revealed · Teams are currently selecting on their devices
                </p>
              </div>

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
            3. CARD REVEAL PHASE: REAL-TIME HOLOGRAPHIC TECH CARD MATRIX
            ============================================================ */}
        {currentPhase === 'CARD_REVEAL' && (
          <div className="w-full flex flex-col items-center justify-center my-auto">
            <div className="w-full max-w-6xl mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge variant="accent" className="mb-1 text-xs">Phase 2 of 4</Badge>
                <h2 className="font-display text-3xl sm:text-4xl font-bold">
                  Holographic Tech Card Matrix
                </h2>
                <p className="text-bwb-muted text-sm mt-1">
                  Live feed of teams drafting and revealing their 3 technology cards
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm bg-bwb-surface-2 px-4 py-2 rounded-2xl border border-bwb-border">
                <div>
                  <span className="text-bwb-muted">Revealed Cards: </span>
                  <strong className="text-bwb-accent">{totalCardsRevealed}</strong> / {game.teams.length * 3}
                </div>
                <div className="h-4 w-px bg-bwb-border" />
                <div>
                  <span className="text-bwb-muted">Draft Progress: </span>
                  <strong className="text-bwb-success">
                    {game.teams.length > 0 ? Math.round((totalCardsRevealed / (game.teams.length * 3)) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Team Cards Matrix Grid */}
            <div className="w-full max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {game.teams.map((team, tIdx) => {
                const teamTechs = (team.technologies && team.technologies.length >= 3)
                  ? team.technologies
                  : (catalog.technologies.length >= 3 ? catalog.technologies.slice(0, 3) : [])
                const revealedSlots = team.revealedCards ?? []
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: tIdx * 0.05 }}
                    className="stereo-card rounded-3xl p-5 border border-bwb-border relative overflow-hidden shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-bwb-accent font-bold px-2 py-0.5 rounded-lg bg-bwb-accent/10 border border-bwb-accent/20">
                          #{tIdx + 1}
                        </span>
                        <h4 className="font-display font-bold text-base text-bwb-text truncate max-w-[180px]">
                          {team.name}
                        </h4>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                        revealedSlots.length >= 3
                          ? 'bg-bwb-success/20 text-bwb-success border border-bwb-success/30'
                          : 'text-bwb-muted bg-bwb-surface-2'
                      }`}>
                        {revealedSlots.length}/3 Unlocked
                      </span>
                    </div>

                    {/* 3 Slots for this team */}
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((slotIdx) => {
                        const isRevealed = revealedSlots.includes(slotIdx)
                        const tech = teamTechs[slotIdx] || catalog.technologies[slotIdx]
                        const badgeStyle = tech ? techCategoryBadges[tech.category] ?? 'bg-bwb-surface-2 text-bwb-text border-bwb-border' : ''
                        return (
                          <div
                            key={slotIdx}
                            className={`min-h-[125px] rounded-2xl border p-2.5 flex flex-col items-center justify-between text-center transition-all ${
                              isRevealed && tech
                                ? 'bg-bwb-surface-2/95 border-bwb-accent/50 shadow-xl shadow-bwb-accent/15 ring-1 ring-bwb-accent/30'
                                : 'bg-bwb-bg/60 border-dashed border-bwb-border/80 neo-inset'
                            }`}
                          >
                            {!isRevealed || !tech ? (
                              <div className="flex-1 flex flex-col items-center justify-center">
                                <Sparkles size={20} className="text-bwb-muted/40 mb-1.5 animate-pulse" />
                                <span className="text-[11px] uppercase font-mono font-semibold text-bwb-muted">
                                  SLOT #{slotIdx + 1}
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="text-3xl p-1.5 rounded-xl bg-bwb-bg/60 border border-white/5 shadow-inner">
                                  {tech.icon}
                                </div>
                                <div className="w-full">
                                  <p className="text-xs font-black text-bwb-text leading-tight truncate">
                                    {tech.name}
                                  </p>
                                  <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border truncate max-w-full ${badgeStyle}`}>
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

            {/* Catalog Technology Legend */}
            <div className="w-full max-w-6xl p-4 rounded-2xl glass border border-bwb-border flex flex-wrap items-center justify-around gap-3 text-xs">
              <span className="text-bwb-muted font-display font-semibold uppercase tracking-wider">Tech Pool:</span>
              {catalog.technologies.map((tech) => (
                <div key={tech.id} className="flex items-center gap-1.5 text-bwb-text font-medium">
                  <span className="text-base">{tech.icon}</span>
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            4. BUILDING PHASE: LIVE COUNTDOWN & TEAMS STRATEGY ARENA
            ============================================================ */}
        {currentPhase === 'BUILDING' && (
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center my-auto px-4">
            {/* Countdown Hero */}
            <div className="w-full text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bwb-accent/15 border border-bwb-accent/30 text-bwb-accent text-xs font-mono font-bold uppercase tracking-widest mb-4">
                <Activity size={14} className="animate-pulse" />
                <span>Live Engineering Arena · Build Phase Active</span>
              </div>

              <div className="stereo-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border-2 border-bwb-accent/40 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-bwb-accent/10 blur-3xl pointer-events-none" />
                <CountdownTimer
                  initialSeconds={game.buildDurationMinutes * 60}
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
        {(currentPhase === 'PITCHING' || currentPhase === 'JUDGE_ATTACK') && (
          <div className="w-full max-w-6xl mx-auto my-auto flex flex-col items-center justify-center px-4">
            {/* Top Pitch Round Header */}
            <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-white/10">
              <div>
                <p className="text-xs uppercase font-mono tracking-widest text-bwb-accent font-bold mb-1 flex items-center gap-1.5">
                  <Radio size={14} className="animate-pulse" />
                  {currentPhase === 'JUDGE_ATTACK' ? 'DEFENSE & JUDGE Q&A ARENA' : 'OFFICIAL PITCH ROUND ARENA'}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-bwb-text">
                  Live Solution Presentations
                </h2>
              </div>

              {/* Overall Round Pitch Clock */}
              <div className="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-bwb-surface-2 border border-bwb-accent/30 shadow-lg">
                <span className="text-[11px] font-mono uppercase text-bwb-muted font-bold">Pitch Session:</span>
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
                className="w-full stereo-card rounded-3xl p-6 sm:p-10 border-2 border-bwb-accent/40 shadow-2xl relative overflow-hidden mb-6 bg-gradient-to-br from-bwb-surface-2/95 to-bwb-surface"
              >
                <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-bwb-accent text-bwb-bg shadow-md">
                        ON STAGE NOW
                      </span>
                      <span className="text-xs text-bwb-muted font-mono">
                        ({pitchTeam.members?.join(', ') || 'Team Members'})
                      </span>
                    </div>
                    <h3 className="font-display font-black text-4xl sm:text-6xl text-bwb-text tracking-tight">
                      {pitchTeam.name}
                    </h3>
                  </div>

                  {/* Individual 60s pitch / defense clock */}
                  <div className="p-4 rounded-2xl stereo-card border border-purple-500/40 bg-purple-950/20 text-center min-w-[160px]">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-purple-300 font-bold mb-1">
                      {currentPhase === 'JUDGE_ATTACK' ? 'Defense Clock' : 'Pitch Clock'}
                    </p>
                    <CountdownTimer
                      initialSeconds={currentPhase === 'JUDGE_ATTACK' ? 30 : 90}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Team's Solution Formulation Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Problem being solved */}
                  {(() => {
                    const teamProblem = catalog.problems.find((p) => p.id === pitchTeam.selectedProblemId) ?? catalog.problems[0]
                    const theme = teamProblem ? categoryThemes[teamProblem.category] : null
                    return (
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${theme?.gradient ?? 'from-bwb-surface to-bwb-surface-2'} border ${theme?.border ?? 'border-white/10'}`}>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${theme?.badge} inline-block mb-1.5`}>
                          {theme?.icon} {teamProblem?.category}
                        </span>
                        <h4 className="font-display font-bold text-base text-bwb-text mb-1">
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

                  {/* 3 Tech components integrated */}
                  <div className="p-4 rounded-2xl bg-bwb-bg/70 border border-white/10 flex flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-bwb-muted font-bold mb-2">
                      Drafted Tech Components (3):
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

                {/* Solution Summary */}
                {pitchTeam.submission && (
                  <div className="p-4 rounded-2xl bg-bwb-bg/80 border border-bwb-accent/20">
                    <p className="text-xs uppercase font-mono tracking-widest text-bwb-accent font-bold mb-1">
                      Architecture Proposal: {pitchTeam.submission.solutionName || 'System Architecture'}
                    </p>
                    <p className="text-sm text-bwb-text/90 leading-relaxed font-medium">
                      {pitchTeam.submission.whatItDoes || pitchTeam.submission.howItWorks}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="w-full stereo-card rounded-3xl p-10 sm:p-16 border-2 border-bwb-accent/20 shadow-2xl text-center bg-gradient-to-br from-bwb-surface-2/95 to-bwb-surface mb-6">
                <div className="w-20 h-20 rounded-2xl bg-bwb-accent/10 border border-bwb-accent/30 flex items-center justify-center mx-auto mb-5">
                  <Mic size={36} className="text-bwb-accent animate-pulse" />
                </div>
                <h3 className="font-display font-black text-3xl sm:text-4xl text-bwb-text mb-2">
                  WAITING FOR NEXT PITCH
                </h3>
                <p className="text-sm text-bwb-muted max-w-md mx-auto">
                  The judge will call the next team to the stage. Please standby.
                </p>
              </div>
            )}

            {/* Team Presentation Queue Bar */}
            <div className="w-full flex items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-mono text-bwb-muted mr-1 shrink-0">Stage Queue:</span>
              {game.teams.map((team, idx) => {
                const isCurrent = team.id === (pitchTeam?.id ?? '')
                const isPitched = pitchedTeamIds.includes(team.id)
                return (
                  <div
                    key={team.id}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isCurrent
                        ? 'bg-bwb-accent text-bwb-bg border-bwb-accent shadow-md'
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
        )}

        {/* ============================================================
            6. JUDGING PHASE: GRAND STADIUM EVALUATION & DELIBERATION ARENA
            ============================================================ */}
        {currentPhase === 'JUDGING' && (
          <div className="w-full max-w-5xl mx-auto my-auto px-4">
            {/* Top Judging Banner */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-lg">
                <Sparkles size={14} className="animate-spin text-purple-400" />
                <span>Round {game.currentRound || 1} · Official Jury Deliberation</span>
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-black text-bwb-text">
                Jury Evaluating Architectures
              </h2>
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
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bwb-gold/15 border border-bwb-gold/30 text-bwb-gold text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-lg">
                <Trophy size={14} /> Round {game.currentRound || (game.isFinalRound ? 3 : 1)} Official Standings
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-black text-gradient">
                {(currentPhase === 'RESULTS' || game.currentRound === 3) ? 'Tournament Grand Finals' : `Round ${game.currentRound || 1} Leaderboard`}
              </h2>
            </div>

            {/* 3D Animated Esports Podium for Finals / Results */}
            {((currentPhase === 'RESULTS' || game.currentRound === 3) && game.teams.length > 0) && (
              <TournamentPodium teams={game.teams} />
            )}

            {/* Complete Rank Breakdown */}
            <div className="stereo-card rounded-3xl p-6 border border-bwb-border shadow-2xl">
              <h3 className="font-display font-bold text-base text-bwb-text mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-bwb-gold" />
                Tournament Scoreboard
              </h3>
              <LeaderboardTable
                teams={game.teams}
                showMovement
                round={game.currentRound || (game.isFinalRound ? 3 : 1)}
                isFinalResults={currentPhase === 'RESULTS' || game.currentRound === 3}
              />
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
