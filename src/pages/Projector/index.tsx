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
import { LivePitchDeck } from '../../components/pitch/LivePitchDeck'
import { SoundFX } from '../../lib/soundEffects'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import { getPhaseDuration } from '../../lib/phaseTimers'
import { drawProblemCards } from '../../data/mockData'
import type { Game, GamePhase, Problem, Technology, Team } from '../../types'

const LOBBY_ROUND_ANNOUNCEMENTS: Record<number, Array<{ icon: string; tag: string; text: string }>> = {
  1: [
    { icon: '🚀', tag: 'ROUND 1 · OPEN QUALIFIER', text: 'Welcome squads! Connect your devices at /join and prepare your problem root cause analysis!' },
    { icon: '⚡', tag: 'ROUND 1 · 100 PTS', text: 'Round 1: Pitch deep problem understanding, target user needs & landscape critique (Zero elimination, all points carry forward)!' },
    { icon: '🎯', tag: '45-MIN SPRINT', text: 'Formulate stakeholder pain points, legacy shortcomings & initial open architectural tech stack!' },
    { icon: '💡', tag: 'ZERO ELIMINATION', text: 'All squads advance to Round 2 to compete across the problem statement duel tracks!' },
  ],
  2: [
    { icon: '⚔️', tag: 'ROUND 2 · 1V1 DUELS', text: 'Round 2 Showdown Duels! 1v1 match per problem statement. Top 8 Problem Champions advance to Grand Finals!' },
    { icon: '🔮', tag: '3-TECH CARDS ACTIVE', text: 'Incorporate all 3 surprise frontier tech constraint cards seamlessly into your solution architecture!' },
    { icon: '⚡', tag: 'ROUND 2 · 100 PTS', text: 'Defend your enhanced architecture, edge-to-cloud data flows, and BOM cost feasibility!' },
    { icon: '🏆', tag: '8 PROBLEM CHAMPIONS', text: 'The winner of each problem track advances directly into Round 3 Grand Finals!' },
  ],
  3: [
    { icon: '🏆', tag: 'ROUND 3 · GRAND FINALS', text: 'The 8 Problem Champions deliver master blueprints and defend live on stage against aggressive judge Q&A!' },
    { icon: '🥇', tag: 'CHAMPIONSHIP PODIUM', text: 'Top 4 winners crowned on podium: 1st Champion, 2nd Runner-Up, and Dual 3rd Place Bronze winners!' },
    { icon: '🎤', tag: 'STAGE SPOTLIGHT', text: 'Deliver your master presentation and defend system architectures under judge cross-examination.' },
  ],
}

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
      setAnnouncementIndex((prev) => (prev + 1) % 4)
    }, 5500)
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

  // Live Lobby Team Showcase 3D Auto-Pagination States (8 teams per view)
  const [teamPageIndex, setTeamPageIndex] = useState(0)
  const [isTeamPagePaused, setIsTeamPagePaused] = useState(false)
  const [teamPageSwapProgress, setTeamPageSwapProgress] = useState(0)

  // Live Building Phase Team Matrix Auto-Pagination (4 teams per view to fit 100vh frame without scrolling)
  const [buildPageIndex, setBuildPageIndex] = useState(0)
  const [isBuildPagePaused, setIsBuildPagePaused] = useState(false)
  const [buildPageSwapProgress, setBuildPageSwapProgress] = useState(0)

  // Active display phase (strictly driven in real-time by host via SSE)
  const currentPhase: GamePhase = game.phase ?? 'LOBBY'
  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)
  const isResults = currentPhase === 'RESULTS' || game.currentRound === 3
  const activeProblemTracks = game.activeProblems && game.activeProblems.length > 0
    ? game.activeProblems
    : (game.activeProblemIds && game.activeProblemIds.length > 0
      ? catalog.problems.filter((p) => game.activeProblemIds?.includes(p.id))
      : (game.maxTeams === 8 ? catalog.problems.slice(0, 4) : catalog.problems))
  const trackCount = activeProblemTracks.length || (game.maxTeams === 8 ? 4 : 8)
  const squadLimit = game.maxTeams === 8 ? 8 : 16

  const activeProblem = activeProblemTracks[activeProblemIndex] ?? game.currentProblem ?? activeProblemTracks[0]
  const activeProblemTheme = activeProblem ? categoryThemes[activeProblem.category] : null
  const pitchTeam = game.teams.find((t) => t.id === game.currentPitchTeamId) ?? null
  const pitchedTeamIds = game.pitchedTeamIds || []

  const totalParticipants = game.teams.reduce((acc, t) => acc + (t.members?.length ?? 0), 0)
  const totalCardsRevealed = game.teams.reduce((acc, t) => acc + (t.revealedCards?.length ?? 0), 0)

  // Competing teams for current round (in Round 3, only qualified finalists compete if finalists exist)
  const competingTeams = currentRound === 3 && (game.finalistTeamIds?.length ?? 0) > 0
    ? game.teams.filter((team) => game.finalistTeamIds?.includes(team.id))
    : game.teams

  const isTeamSubmittedForCurrentRound = (t: Team) => {
    const sub = t.submissionsByRound?.[currentRound] || (t.submission?.round === currentRound ? t.submission : null)
    return !!sub
  }

  const totalSubmissions = competingTeams.filter(isTeamSubmittedForCurrentRound).length
  const isRoomFull = game.teams.length >= (game.maxTeams || 16)
  const lobbyTeams = competingTeams
  const activeAnnouncements = LOBBY_ROUND_ANNOUNCEMENTS[currentRound] || LOBBY_ROUND_ANNOUNCEMENTS[1]
  const currentAnnouncement = activeAnnouncements[announcementIndex % activeAnnouncements.length]

  const TEAMS_PER_PAGE = 8
  const totalTeamPages = Math.max(1, Math.ceil(lobbyTeams.length / TEAMS_PER_PAGE))
  const safeTeamPageIndex = teamPageIndex % totalTeamPages
  const currentBatchTeams = lobbyTeams.slice(safeTeamPageIndex * TEAMS_PER_PAGE, (safeTeamPageIndex + 1) * TEAMS_PER_PAGE)

  const BUILD_TEAMS_PER_PAGE = 4
  const totalBuildPages = Math.max(1, Math.ceil(competingTeams.length / BUILD_TEAMS_PER_PAGE))
  const safeBuildPageIndex = buildPageIndex % totalBuildPages
  const currentBuildBatchTeams = competingTeams.slice(safeBuildPageIndex * BUILD_TEAMS_PER_PAGE, (safeBuildPageIndex + 1) * BUILD_TEAMS_PER_PAGE)

  // Auto-cycle lobby teams every 7.5s with progress bar when > 8 teams
  useEffect(() => {
    if (totalTeamPages <= 1 || isTeamPagePaused || currentPhase !== 'LOBBY') {
      setTeamPageSwapProgress(0)
      return
    }

    const DURATION_MS = 7500
    const STEP_MS = 50
    let elapsed = 0

    const progressTimer = setInterval(() => {
      elapsed += STEP_MS
      setTeamPageSwapProgress(Math.min(100, (elapsed / DURATION_MS) * 100))

      if (elapsed >= DURATION_MS) {
        elapsed = 0
        setTeamPageSwapProgress(0)
        setTeamPageIndex((prev) => (prev + 1) % totalTeamPages)
      }
    }, STEP_MS)

    return () => clearInterval(progressTimer)
  }, [totalTeamPages, isTeamPagePaused, currentPhase])

  // Auto-cycle building teams every 6.5s with progress bar when > 4 teams
  useEffect(() => {
    if (totalBuildPages <= 1 || isBuildPagePaused || currentPhase !== 'BUILDING') {
      setBuildPageSwapProgress(0)
      return
    }

    const DURATION_MS = 6500
    const STEP_MS = 50
    let elapsed = 0

    const progressTimer = setInterval(() => {
      elapsed += STEP_MS
      setBuildPageSwapProgress(Math.min(100, (elapsed / DURATION_MS) * 100))

      if (elapsed >= DURATION_MS) {
        elapsed = 0
        setBuildPageSwapProgress(0)
        setBuildPageIndex((prev) => (prev + 1) % totalBuildPages)
      }
    }, STEP_MS)

    return () => clearInterval(progressTimer)
  }, [totalBuildPages, isBuildPagePaused, currentPhase])

  const is8TeamRoom = Number(game.maxTeams) === 8 || (game.teams.length <= 8 && (game.activeProblemIds?.length === 4 || game.activeProblems?.length === 4))
  const targetFinalists = is8TeamRoom ? 4 : 8

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

        {/* Round-Aware Stage Director Phase Bar (Locked to Host Phase) */}
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

              const currentStageIdx = activeRoundPhases.indexOf(currentPhase)

              return activeRoundPhases.map((p, idx) => {
                const isCurrent = currentPhase === p
                const isPast = currentStageIdx > idx
                return (
                  <div
                    key={p}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-bwb-accent text-bwb-bg shadow-sm font-black ring-1 ring-bwb-accent/50'
                        : isPast
                        ? 'text-emerald-400/80 bg-emerald-500/10'
                        : 'text-bwb-muted/50 bg-white/[0.02]'
                    }`}
                  >
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-bwb-bg animate-pulse" />}
                    {isPast && <CheckCircle2 size={11} className="text-emerald-400" />}
                    <span>{p.replace('_', ' ')}</span>
                  </div>
                )
              })
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
                      {game.teams.length} / {game.maxTeams || 16} Squads {isRoomFull ? '(Full)' : `(${(game.maxTeams || 16) - game.teams.length} slots left)`}
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
                    Host Standby Mode · Tournament Launches Live When Round {currentRound} Begins
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
                  <div className={`p-4 rounded-2xl bg-bwb-bg/80 space-y-1.5 shadow-sm transition-all border ${
                    currentRound === 1
                      ? 'border-purple-400 ring-2 ring-purple-500/30 bg-purple-950/25 shadow-purple-500/10'
                      : 'border-purple-500/20 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                        ROUND 1 · 100 PTS
                      </span>
                      {currentRound === 1 ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-purple-500 text-bwb-bg">
                          ACTIVE ROUND
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">45m Build · Zero Elim</span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Problem & Existing Landscape</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      Select your problem track, preview surprise tech cards, and pitch deep problem root causes, pain points & critique of existing solutions.
                    </p>
                  </div>

                  {/* Round 2 */}
                  <div className={`p-4 rounded-2xl bg-bwb-bg/80 space-y-1.5 shadow-sm transition-all border ${
                    currentRound === 2
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/25 shadow-cyan-500/10'
                      : 'border-bwb-accent/20 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-bwb-accent/20 text-bwb-accent font-mono text-[10px] font-bold">
                        ROUND 2 · 100 PTS
                      </span>
                      {currentRound === 2 ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-bwb-accent text-bwb-bg">
                          ACTIVE ROUND
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-bwb-accent font-bold">30m Build · Top 8 Champions</span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Solution & Tech Architecture</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      1v1 problem showdown duels! Integrate all 3 surprise frontier tech constraint cards into your solution architecture. The 8 Problem Champions qualify for Grand Finals!
                    </p>
                  </div>

                  {/* Round 3 */}
                  <div className={`p-4 rounded-2xl bg-bwb-bg/80 space-y-1.5 shadow-sm transition-all border ${
                    currentRound === 3
                      ? 'border-amber-400 ring-2 ring-amber-500/30 bg-amber-950/25 shadow-amber-500/10'
                      : 'border-amber-500/20 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        ROUND 3 · GRAND FINALS
                      </span>
                      {currentRound === 3 ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-amber-400 text-bwb-bg">
                          ACTIVE ROUND
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-300 font-bold">30m Polish · Top 4 Prized</span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-sm text-bwb-text">Master Pitch & Defense</h4>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      The 8 Problem Champions deliver master blueprints and defend live on stage against judge Q&A. Top 4 squads are crowned on the championship podium!
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

            {/* Live Teams & Players Arena Wall with 3D Holographic Staggered Matrix Showcase */}
            <div
              className="w-full max-w-6xl"
              onMouseEnter={() => setIsTeamPagePaused(true)}
              onMouseLeave={() => setIsTeamPagePaused(false)}
            >
              <div className="mb-5 pb-3 border-b border-bwb-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Users className="text-bwb-accent shrink-0" size={24} />
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-bwb-text">
                      {game.currentRound === 3 ? `Grand Finalists (Top ${targetFinalists})` : `Registered Arena Teams (${lobbyTeams.length})`}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-bwb-muted">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live in Room: {lobbyTeams.filter((t) => t.isOnline).length} / {lobbyTeams.length}
                    </span>
                    <span className="hidden sm:inline">·</span>
                    <span>Total Players: <strong className="text-bwb-text">{totalParticipants}</strong></span>
                  </div>
                </div>

                {/* Cyber Matrix Showcase Page HUD & Auto-Swap Countdown (Only when > 8 squads) */}
                {totalTeamPages > 1 && (
                  <div className="flex items-center gap-2.5 bg-bwb-surface-2/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-2xl shadow-lg backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-mono font-black text-cyan-300 tracking-wide">
                        PAGE {safeTeamPageIndex + 1}/{totalTeamPages}
                      </span>
                      <span className="text-[11px] font-mono text-bwb-muted hidden sm:inline">
                        (Squads #{safeTeamPageIndex * TEAMS_PER_PAGE + 1}–#{Math.min(lobbyTeams.length, (safeTeamPageIndex + 1) * TEAMS_PER_PAGE)})
                      </span>
                    </div>

                    {/* Progress Countdown Line */}
                    <div className="w-14 sm:w-20 bg-white/10 h-1.5 rounded-full overflow-hidden relative" title="Time until next batch rotates">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                        style={{ width: `${teamPageSwapProgress}%` }}
                      />
                    </div>

                    {/* Interactive Page Dot Pills */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalTeamPages }).map((_, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setTeamPageIndex(pIdx)}
                          className={`w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                            pIdx === safeTeamPageIndex
                              ? 'bg-cyan-400 text-black font-black scale-110 shadow-[0_0_10px_rgba(0,229,199,0.5)]'
                              : 'bg-white/10 text-bwb-muted hover:bg-white/20 hover:text-white'
                          }`}
                          title={`Jump to Page ${pIdx + 1}`}
                        >
                          {pIdx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Pause / Play and Arrows */}
                    <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                      <button
                        onClick={() => setTeamPageIndex((prev) => (prev - 1 + totalTeamPages) % totalTeamPages)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white transition-colors"
                        title="Previous Squads"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        onClick={() => setIsTeamPagePaused(!isTeamPagePaused)}
                        className={`p-1 rounded-lg transition-colors ${
                          isTeamPagePaused ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white'
                        }`}
                        title={isTeamPagePaused ? 'Resume Auto-Rotation' : 'Pause on these Squads'}
                      >
                        {isTeamPagePaused ? <Play size={13} /> : <Pause size={13} />}
                      </button>
                      <button
                        onClick={() => setTeamPageIndex((prev) => (prev + 1) % totalTeamPages)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white transition-colors"
                        title="Next Squads"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
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
                <div style={{ perspective: 1200 }} className="relative min-h-[360px]">
                  {/* Staggered 3D Holographic Morph Matrix */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`lobby-teams-page-${safeTeamPageIndex}`}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.045 } },
                        exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
                      }}
                      className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {currentBatchTeams.map((team, idx) => {
                        const teamAbsoluteIndex = safeTeamPageIndex * TEAMS_PER_PAGE + idx + 1
                        return (
                          <motion.div
                            key={team.id}
                            variants={{
                              hidden: { opacity: 0, rotateY: 70, scale: 0.86, y: 22 },
                              show: {
                                opacity: 1,
                                rotateY: 0,
                                scale: 1,
                                y: 0,
                                transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
                              },
                              exit: {
                                opacity: 0,
                                rotateY: -70,
                                scale: 0.86,
                                y: -22,
                                transition: { duration: 0.32, ease: 'easeIn' },
                              },
                            }}
                            className="stereo-card rounded-2xl p-5 border border-bwb-border/80 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(0,229,199,0.18)] transition-all flex flex-col justify-between group relative overflow-hidden transform-gpu"
                          >
                            {/* Ambient Top Glow Line on Hover */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div>
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bwb-accent/20 to-bwb-purple/20 border border-bwb-accent/30 flex items-center justify-center font-display font-bold text-sm text-bwb-accent shadow-inner">
                                  #{teamAbsoluteIndex}
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

                              <h4 className="font-display font-black text-lg text-bwb-text mb-2 truncate group-hover:text-cyan-300 transition-colors">
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
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
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
                    ? `Round 2 · Problem Showdown (Top ${trackCount} Qualify)`
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
                {trackCount} challenges revealed · Teams are currently selecting on their devices
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

            {/* Problem Selector Thumbnails & Live Team Pick Tracker */}
            <div className={`w-full max-w-6xl grid ${trackCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'} gap-2.5`}>
              {activeProblemTracks.map((p, idx) => {
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
                    ? `Round 2 · Problem Showdown (Top ${targetFinalists} Qualify)`
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
        {/* ============================================================
            4. BUILDING PHASE: LIVE COUNTDOWN & AUTO-SWAPPING TEAMS MATRIX
            ============================================================ */}
        {currentPhase === 'BUILDING' && (
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center my-auto px-4 sm:px-8 py-3 select-none">
            {/* Top Round & Phase HUD */}
            <div className="w-full text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
                  {currentRound === 1
                    ? 'Round 1 · Open Qualifier (No Elimination)'
                    : currentRound === 2
                    ? `Round 2 · Problem Showdown (Top ${targetFinalists} Qualify)`
                    : 'Round 3 · Grand Finals (Top 4 Prized)'}
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/40 shadow-sm">
                  Build Phase
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold text-bwb-muted bg-white/5 border border-white/10">
                  Room: {game.code}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black flex items-center justify-center gap-3 text-gradient tracking-tight">
                <Zap className="text-amber-400 animate-pulse" size={32} />
                <span>Live Engineering Arena</span>
              </h1>
              <p className="text-bwb-muted text-xs sm:text-sm font-mono mt-1">{game.name || 'Build Without Building Tournament'}</p>
            </div>

            {/* Countdown Hero & Submissions Tracker in a Single Balanced Stadium Widget */}
            <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 sm:p-5 rounded-3xl stereo-card border border-bwb-accent/40 bg-gradient-to-r from-bwb-surface-2/95 via-bwb-surface/90 to-bwb-surface-2/95 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Clock size={24} className="animate-spin text-bwb-accent" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-black text-bwb-muted uppercase tracking-widest block mb-0.5">
                    BUILD PHASE TIME REMAINING
                  </span>
                  <CountdownTimer
                    key={`proj-build-${currentRound}-${game.phaseExpiresAt}`}
                    targetTime={game.phaseExpiresAt}
                    initialSeconds={getPhaseDuration(game.id, currentRound, 'BUILDING', game.buildDurationMinutes)}
                    size="lg"
                    showExpired={false}
                  />
                </div>
              </div>

              <div className="w-full sm:w-80 bg-bwb-bg/90 p-3 rounded-2xl border border-white/10 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-bwb-muted flex items-center gap-1.5 font-bold">
                    <Activity className="text-bwb-accent animate-pulse" size={14} /> Live Submissions
                  </span>
                  <span className="text-bwb-accent font-black text-xs">
                    {totalSubmissions} / {competingTeams.length} ({competingTeams.length > 0 ? Math.round((totalSubmissions / competingTeams.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 via-bwb-accent to-emerald-400 h-full transition-all duration-500 rounded-full shadow-lg"
                    style={{ width: `${competingTeams.length > 0 ? (totalSubmissions / competingTeams.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Live Teams Wall with Auto-Rotation Carousel (4 Teams Per View to Fit 100vh Single Frame) */}
            <div
              className="w-full"
              onMouseEnter={() => setIsBuildPagePaused(true)}
              onMouseLeave={() => setIsBuildPagePaused(false)}
            >
              <div className="flex items-center justify-between mb-3.5 px-1">
                <h3 className="font-display font-bold text-base sm:text-lg text-bwb-text flex items-center gap-2.5">
                  <Users size={20} className="text-bwb-accent" />
                  <span>Live Team Challenges & Architectures</span>
                  <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                    {competingTeams.length} Competing Squads
                  </span>
                </h3>

                {totalBuildPages > 1 && (
                  <div className="flex items-center gap-2.5 bg-bwb-surface-2/95 border border-cyan-500/40 px-3.5 py-1.5 rounded-2xl shadow-xl backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-mono font-black text-cyan-300 tracking-wider">
                        PAGE {safeBuildPageIndex + 1}/{totalBuildPages}
                      </span>
                    </div>

                    {/* Progress Countdown Line */}
                    <div className="w-16 sm:w-20 bg-white/10 h-1.5 rounded-full overflow-hidden relative" title="Time until next batch rotates">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                        style={{ width: `${buildPageSwapProgress}%` }}
                      />
                    </div>

                    {/* Interactive Page Dot Buttons */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalBuildPages }).map((_, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setBuildPageIndex(pIdx)}
                          className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                            pIdx === safeBuildPageIndex
                              ? 'bg-cyan-400 text-black font-black scale-110 shadow-[0_0_10px_rgba(0,229,199,0.5)]'
                              : 'bg-white/10 text-bwb-muted hover:bg-white/20 hover:text-white'
                          }`}
                          title={`View Page ${pIdx + 1}`}
                        >
                          {pIdx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
                      <button
                        onClick={() => setBuildPageIndex((prev) => (prev - 1 + totalBuildPages) % totalBuildPages)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white transition-colors"
                        title="Previous Squads"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => setIsBuildPagePaused(!isBuildPagePaused)}
                        className={`p-1 rounded-lg transition-colors ${
                          isBuildPagePaused ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white'
                        }`}
                        title={isBuildPagePaused ? 'Resume Auto-Rotation' : 'Pause on these Squads'}
                      >
                        {isBuildPagePaused ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                      <button
                        onClick={() => setBuildPageIndex((prev) => (prev + 1) % totalBuildPages)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white transition-colors"
                        title="Next Squads"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4-Card Auto-Swapping Staggered Row */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`build-page-${safeBuildPageIndex}`}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05 } },
                    exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
                >
                  {currentBuildBatchTeams.map((team, idx) => {
                    const teamAbsoluteIndex = safeBuildPageIndex * BUILD_TEAMS_PER_PAGE + idx + 1
                    const teamProblem = team.selectedProblemId
                      ? (catalog.problems.find((p) => p.id === team.selectedProblemId) || (game.activeProblems || []).find((p) => p.id === team.selectedProblemId))
                      : null
                    const theme = teamProblem ? categoryThemes[teamProblem.category] : null
                    const teamTechs = (team.technologies && team.technologies.length >= 3)
                      ? team.technologies
                      : (team.selectedProblemId ? drawProblemCards(team.selectedProblemId) : null)
                    const isSubmitted = isTeamSubmittedForCurrentRound(team)

                    return (
                      <motion.div
                        key={team.id}
                        variants={{
                          hidden: { opacity: 0, scale: 0.92, y: 15 },
                          show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                          exit: { opacity: 0, scale: 0.92, y: -15, transition: { duration: 0.22, ease: 'easeIn' } },
                        }}
                        className="stereo-card rounded-3xl p-4 sm:p-5 border border-white/10 hover:border-cyan-400/50 relative overflow-hidden flex flex-col justify-between shadow-2xl bg-bwb-surface-2/95 group transition-all min-h-[220px]"
                      >
                        {/* Atmospheric Card Header Line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div>
                          {/* Team Header */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center font-display font-black text-xs text-cyan-300 shadow-inner shrink-0">
                                #{teamAbsoluteIndex}
                              </div>
                              <h4 className="font-display font-black text-base sm:text-lg text-bwb-text truncate group-hover:text-cyan-300 transition-colors">
                                {team.name}
                              </h4>
                            </div>

                            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-xl flex items-center gap-1 border shrink-0 ${
                              isSubmitted
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm'
                                : 'bg-bwb-surface text-bwb-muted border-white/10'
                            }`}>
                              {isSubmitted ? (
                                <>
                                  <CheckCircle2 size={12} className="text-emerald-400" />
                                  <span>Submitted</span>
                                </>
                              ) : (
                                <span>Building...</span>
                              )}
                            </span>
                          </div>

                          {/* Problem Statement Card */}
                          {teamProblem && theme ? (
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.border} mb-3 shadow-md`}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${theme.badge}`}>
                                  {theme.icon} {teamProblem.category}
                                </span>
                              </div>
                              <h5 className="font-display font-bold text-xs sm:text-sm text-bwb-text leading-snug line-clamp-2">
                                {teamProblem.title}
                              </h5>
                              {teamProblem.twist && (
                                <p className="text-[10px] text-amber-300 mt-1 font-semibold line-clamp-1">
                                  ⚡ Twist: {teamProblem.twist}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-2xl bg-bwb-bg/60 border border-dashed border-white/15 mb-3 text-center flex flex-col items-center justify-center min-h-[82px]">
                              <span className="text-[10px] font-mono font-bold text-amber-300/90 uppercase tracking-wider mb-0.5">
                                ⏳ Challenge Selection Pending
                              </span>
                              <p className="text-[11px] text-bwb-muted">
                                Squad is selecting track on device...
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 3 Assigned Frontier Tech Stack */}
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-[9px] uppercase font-mono text-cyan-300/80 font-black tracking-wider mb-1.5">
                            Assigned Frontier Tech:
                          </p>
                          {teamTechs && teamTechs.length >= 3 ? (
                            <div className="grid grid-cols-3 gap-1.5">
                              {teamTechs.map((tech) => (
                                <div
                                  key={tech.id}
                                  className="p-1.5 rounded-xl bg-bwb-surface border border-white/10 flex items-center gap-1.5 text-xs text-bwb-text truncate hover:border-cyan-400/30 transition-colors"
                                  title={tech.name}
                                >
                                  <span className="text-sm shrink-0">{tech.icon}</span>
                                  <span className="truncate font-bold text-[10px] text-white">{tech.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                              {[1, 2, 3].map((slot) => (
                                <div
                                  key={slot}
                                  className="p-1.5 rounded-xl bg-bwb-bg/40 border border-dashed border-white/10 flex items-center justify-center gap-1 text-[10px] font-mono text-bwb-muted/60"
                                >
                                  <span>Slot #{slot}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
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
                        key={`proj-pitch-${pitchTeam.id}-${currentPhase}-${game.pitchExpiresAt || game.phaseExpiresAt}`}
                        targetTime={game.pitchExpiresAt || game.phaseExpiresAt}
                        initialSeconds={currentPhase === 'JUDGE_ATTACK' ? 30 : 180}
                        size="lg"
                      />
                    </div>
                  </div>

                  {/* Team's Problem & Tech Details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    {/* Problem Domain */}
                    {(() => {
                      const teamProblem =
                        ((game.activeProblems || []).find((p) => p.id === pitchTeam.selectedProblemId)) ||
                        (catalog.problems.find((p) => p.id === pitchTeam.selectedProblemId)) ||
                        catalog.problems[0]
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
                        {((pitchTeam.technologies && pitchTeam.technologies.length >= 3)
                          ? pitchTeam.technologies
                          : (pitchTeam.selectedProblemId ? drawProblemCards(pitchTeam.selectedProblemId) : catalog.technologies.slice(0, 3))
                        ).map((tech: Technology) => (
                          <div key={tech.id} className="p-2 rounded-xl bg-bwb-surface-2 border border-white/5 text-center">
                            <span className="text-2xl block mb-0.5">{tech.icon}</span>
                            <span className="text-xs font-bold text-bwb-text truncate block">{tech.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Synchronized Live Presentation Deck / PPT */}
                  <div className="w-full mt-4">
                    <LivePitchDeck
                      team={pitchTeam}
                      activeSlideIndex={game.currentSlideIndex ?? pitchTeam.currentSlideIndex ?? 0}
                      isController={false}
                      catalogProblems={catalog.problems}
                      round={game.currentRound || 1}
                    />
                  </div>
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
                    ? `Round 2 · Problem Showdown (Top ${targetFinalists} Qualify)`
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

            {/* Complete Rank Breakdown & 1v1 Duels */}
            <LeaderboardTable
              teams={game.teams}
              showMovement
              round={currentRound}
              isFinalResults={currentPhase === 'RESULTS' || game.currentRound === 3}
            />

            {/* Round Explanatory Card */}
            <div className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-bwb-surface via-bwb-surface-2 to-bwb-surface p-4 text-center">
              {currentRound === 1 ? (
                <p className="text-xs sm:text-sm text-bwb-text font-medium">
                  ✨ <strong className="text-bwb-accent font-bold">Round 1 Open Qualifier (Zero Elimination)</strong>: All {squadLimit} registered squads advance directly to Round 2 to compete head-to-head across the {trackCount} Problem Statements.
                </p>
              ) : currentRound === 2 ? (
                <p className="text-xs sm:text-sm text-bwb-text font-medium">
                  ⚡ <strong className="text-emerald-400 font-bold">Round 2 Problem Showdown</strong>: The <strong className="text-bwb-accent">{trackCount} Problem Track Champions</strong> (1 winner per unique problem statement duel) advance to the Grand Finals (Round 3). Defeated squads are left behind.
                </p>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono font-bold text-bwb-text">
                  <span className="flex items-center gap-1 text-bwb-gold"><Trophy size={14} /> 🥇 1st: Tournament Champion</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-300"><Award size={14} /> 🥈 2nd: Runner-Up</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-amber-400"><Award size={14} /> 🥉 3rd: Dual Bronze Winners (Top 4 Prized)</span>
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
