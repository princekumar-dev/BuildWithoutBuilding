import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, Users, Download, FileSpreadsheet, Key, Mail, Phone,
  Search, Play, Pause, RotateCcw,
  Sparkles, Copy, ExternalLink, MessageSquare, ShieldAlert
} from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import { PROBLEMS } from '../../data/mockData'

export default function HostRoundPage() {
  const { game, setGame } = useGameStore()
  useRealtimeGame()

  // Problem & Catalog
  const [catalog, setCatalog] = useState<{ technologies: any[]; problems: any[] }>({ technologies: [], problems: PROBLEMS })
  useEffect(() => {
    api.getCatalog().then(setCatalog).catch(() => {})
  }, [])

  // Timer Configuration State
  const [buildMinutes, setBuildMinutes] = useState(game.buildDurationMinutes || 15)
  const [pitchSeconds, setPitchSeconds] = useState(60)
  const [attackSeconds, setAttackSeconds] = useState(20)
  const [finalBuildMinutes, setFinalBuildMinutes] = useState(10)

  // Live Timer Controller State
  const [activeTimerType, setActiveTimerType] = useState<'BUILD' | 'PITCH' | 'ATTACK' | null>(null)
  const [timerRemaining, setTimerRemaining] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Active Pitching Team Queue Index
  const [currentPitchTeamIndex, setCurrentPitchTeamIndex] = useState(0)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL')
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL')

  // Sync game data on mount
  useEffect(() => {
    if (game.id) {
      api.getGame(game.id).then(setGame).catch(() => {})
    }
  }, [game.id, setGame])

  // Timer tick effect
  useEffect(() => {
    let interval: any = null
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            toast.success(`⏰ ${activeTimerType} Timer Finished!`)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerRemaining, activeTimerType])

  const startTimer = (type: 'BUILD' | 'PITCH' | 'ATTACK', durationSec: number) => {
    setActiveTimerType(type)
    setTimerRemaining(durationSec)
    setIsTimerRunning(true)
    toast.success(`Started ${type} Timer (${durationSec >= 60 ? `${Math.floor(durationSec / 60)}m` : `${durationSec}s`})`)
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerRemaining(0)
    setActiveTimerType(null)
  }

  // Filtered Teams List
  const filteredTeams = useMemo(() => {
    return game.teams.filter((team) => {
      const matchesSearch =
        searchQuery === '' ||
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.passcode && team.passcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (team.leaderName && team.leaderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        team.members.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (team.department && team.department.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        (team.department && team.department.toUpperCase() === selectedDeptFilter.toUpperCase())

      const matchesYear =
        selectedYearFilter === 'ALL' ||
        (team.year && team.year.toUpperCase().includes(selectedYearFilter.toUpperCase()))

      return matchesSearch && matchesDept && matchesYear
    })
  }, [game.teams, searchQuery, selectedDeptFilter, selectedYearFilter])

  // EXCEL / CSV EXPORT HANDLER
  const handleExportToExcel = () => {
    if (game.teams.length === 0) {
      toast.error('No teams currently registered in this room to export.')
      return
    }

    const headers = [
      'Sl. No',
      'Team ID',
      'Team Name',
      'Passcode',
      'Room Code',
      'Team Leader (Member 1)',
      'Teammate #2',
      'Teammate #3',
      'All Members (Combined)',
      'Member Count',
      'Department',
      'Year',
      'Section',
      'Email Address',
      'Phone Number',
      'Challenge Category',
      'Challenge Title',
      'Tech Card 1',
      'Tech Card 2',
      'Tech Card 3',
      'Submission Status',
      'Solution Name',
      'Main Advantage',
      'Judge Score',
      'Rank',
      'Online Status',
      'Registered At'
    ]

    const rows = game.teams.map((team, idx) => {
      const selectedProblem = (catalog.problems || PROBLEMS).find((p) => p.id === team.selectedProblemId)
      const t1 = team.technologies?.[0]?.name || 'N/A'
      const t2 = team.technologies?.[1]?.name || 'N/A'
      const t3 = team.technologies?.[2]?.name || 'N/A'

      const leader = team.leaderName || (team.members && team.members[0]) || 'N/A'
      const member2 = team.members && team.members[1] ? team.members[1] : 'N/A'
      const member3 = team.members && team.members[2] ? team.members[2] : 'N/A'

      return [
        idx + 1,
        team.id,
        team.name,
        team.passcode || 'N/A',
        game.code,
        leader,
        member2,
        member3,
        team.members.join('; '),
        team.members.length,
        team.department || 'N/A',
        team.year || 'N/A',
        team.section || 'N/A',
        team.email || 'N/A',
        team.phone || 'N/A',
        selectedProblem?.category || 'Pending',
        selectedProblem?.title || 'Pending Selection',
        t1,
        t2,
        t3,
        team.submission ? 'Submitted' : 'Pending',
        team.submission?.solutionName || 'N/A',
        team.submission?.mainAdvantage || 'N/A',
        team.score || 0,
        team.rank || idx + 1,
        team.isOnline ? 'LIVE IN ROOM' : 'OFFLINE',
        team.registeredAt ? new Date(team.registeredAt).toLocaleString() : 'N/A'
      ]
    })

    // Build CSV with proper quotes and UTF-8 BOM
    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row
            .map((field) => {
              const str = String(field ?? '').replace(/"/g, '""')
              return `"${str}"`
            })
            .join(',')
        )
        .join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute('download', `BWB_Registered_Teams_${game.code}_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Successfully exported ${game.teams.length} teams to Excel spreadsheet (.csv)!`)
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label} to clipboard!`)
  }

  const copyAllPasscodes = () => {
    if (game.teams.length === 0) return
    const text = game.teams
      .map((t) => `${t.name}: Passcode: ${t.passcode || 'N/A'} (Leader: ${t.leaderName || t.members[0]})`)
      .join('\n')
    copyText(text, 'All Team Passcodes')
  }

  const activePitchTeam = game.teams[currentPitchTeamIndex]
  const activePitchProblem = (catalog.problems || PROBLEMS).find((p) => p.id === activePitchTeam?.selectedProblemId)

  // AI Judge Attack Suggested Questions
  const suggestedAttackQuestions = [
    `How does your architecture handle edge cases if the primary network drops completely?`,
    `What is the single biggest bottleneck in your technology stack integration?`,
    `How do you guarantee user privacy and data security under peak stress?`,
    `If you had to build this within 48 hours, which feature would you cut first?`
  ]

  return (
    <PageLayout fullWidth className="pb-12">
      {/* Top Header Bar */}
      <div className="bg-bwb-bg/90 backdrop-blur-xl border-b border-bwb-border px-4 sm:px-6 py-4 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/host/game/${game.id}`}
              className="text-xs font-mono text-bwb-muted hover:text-bwb-accent flex items-center gap-1 transition-colors"
            >
              ← Back to Control Room
            </Link>
            <span className="text-bwb-border">|</span>
            <span className="text-xs font-mono text-bwb-accent font-bold px-2 py-0.5 rounded-md bg-bwb-accent/10 border border-bwb-accent/20">
              Room PIN: {game.code}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportToExcel}
              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 font-bold text-xs shadow-sm"
            >
              <FileSpreadsheet size={15} className="mr-1.5 text-emerald-400" />
              <span>Export to Excel (.csv)</span>
            </Button>

            <Link to="/projector" target="_blank">
              <Button size="sm" variant="ghost" className="text-xs text-bwb-muted hover:text-bwb-text">
                <ExternalLink size={13} className="mr-1" /> Projector View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Page Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Round {game.currentRound || (game.isFinalRound ? 3 : 1)} of 3
              </span>
              <span className="text-xs text-bwb-muted">
                {game.currentRound === 1 ? 'Open Qualifier (No Elimination)' : game.currentRound === 2 ? 'Problem Showdown (8×2 Slots · Top 8 Advance)' : 'Grand Finals (Top 4 Prized)'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-bwb-text flex items-center gap-3">
              <span>Tournament Operations & Round Manager</span>
              <Badge variant="accent">{game.phase}</Badge>
            </h1>
            <p className="text-xs sm:text-sm text-bwb-muted mt-1">
              Configure phase timings, conduct live pitch & judge attack rounds, and manage team registries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-bwb-surface-2 border border-bwb-border text-center">
              <p className="text-[10px] font-mono uppercase text-bwb-muted">Total Squads</p>
              <p className="font-display font-black text-lg text-bwb-accent">{game.teams.length}</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-bwb-surface-2 border border-bwb-border text-center">
              <p className="text-[10px] font-mono uppercase text-bwb-muted">Submissions</p>
              <p className="font-display font-black text-lg text-bwb-success">
                {game.teams.filter((t) => !!t.submission).length}
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-bwb-surface-2 border border-bwb-border text-center">
              <p className="text-[10px] font-mono uppercase text-bwb-muted">Live in Room</p>
              <p className="font-display font-black text-lg text-emerald-400">
                {game.teams.filter((t) => t.isOnline).length}
              </p>
            </div>
          </div>
        </div>


        {/* ============================================================
            SECTION 1: PHASE TIMINGS & LIVE TIMER CONTROLLER
            ============================================================ */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Phase Timers Configuration Card */}
          <div className="lg:col-span-6">
            <Card padding="lg" className="h-full border-bwb-border/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-base text-bwb-text flex items-center gap-2">
                    <Clock size={18} className="text-bwb-accent" />
                    <span>Phase Timer Durations</span>
                  </h2>
                  <span className="text-[11px] font-mono text-bwb-muted">Editable Presets</span>
                </div>

                <div className="space-y-3">
                  {/* Build Phase */}
                  <div className="p-3.5 rounded-2xl bg-bwb-surface-2 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-bwb-text">Build & Solution Phase</p>
                      <p className="text-[10px] text-bwb-muted">Architecture formulation time</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={buildMinutes}
                        onChange={(e) => setBuildMinutes(Number(e.target.value) || 15)}
                        className="w-16 px-2.5 py-1 rounded-xl bg-bwb-bg border border-bwb-border text-center font-mono font-bold text-xs text-bwb-accent"
                      />
                      <span className="text-xs text-bwb-muted font-mono">min</span>
                      <Button
                        size="sm"
                        onClick={() => startTimer('BUILD', buildMinutes * 60)}
                        className="text-xs py-1 px-2.5 h-8 bg-bwb-accent text-bwb-bg font-bold"
                      >
                        <Play size={12} className="mr-1" /> Start
                      </Button>
                    </div>
                  </div>

                  {/* Pitch Duration */}
                  <div className="p-3.5 rounded-2xl bg-bwb-surface-2 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-bwb-text">Team Pitch Duration</p>
                      <p className="text-[10px] text-bwb-muted">Per team verbal presentation</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="600"
                        value={pitchSeconds}
                        onChange={(e) => setPitchSeconds(Number(e.target.value) || 60)}
                        className="w-16 px-2.5 py-1 rounded-xl bg-bwb-bg border border-bwb-border text-center font-mono font-bold text-xs text-amber-300"
                      />
                      <span className="text-xs text-bwb-muted font-mono">sec</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startTimer('PITCH', pitchSeconds)}
                        className="text-xs py-1 px-2.5 h-8 border-amber-400/40 text-amber-300 font-bold hover:bg-amber-400/10"
                      >
                        <Play size={12} className="mr-1" /> Start
                      </Button>
                    </div>
                  </div>

                  {/* Judge Attack Duration */}
                  <div className="p-3.5 rounded-2xl bg-bwb-surface-2 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-bwb-text">Judge Attack / Q&A</p>
                      <p className="text-[10px] text-bwb-muted">Rapid-fire question defense</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={attackSeconds}
                        onChange={(e) => setAttackSeconds(Number(e.target.value) || 20)}
                        className="w-16 px-2.5 py-1 rounded-xl bg-bwb-bg border border-bwb-border text-center font-mono font-bold text-xs text-bwb-warn"
                      />
                      <span className="text-xs text-bwb-muted font-mono">sec</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startTimer('ATTACK', attackSeconds)}
                        className="text-xs py-1 px-2.5 h-8 border-bwb-warn/40 text-bwb-warn font-bold hover:bg-bwb-warn/10"
                      >
                        <Play size={12} className="mr-1" /> Start
                      </Button>
                    </div>
                  </div>

                  {/* Final Round Build */}
                  <div className="p-3.5 rounded-2xl bg-bwb-surface-2 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-bwb-text">Final Round Build</p>
                      <p className="text-[10px] text-bwb-muted">Top squad sprint duration</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={finalBuildMinutes}
                        onChange={(e) => setFinalBuildMinutes(Number(e.target.value) || 10)}
                        className="w-16 px-2.5 py-1 rounded-xl bg-bwb-bg border border-bwb-border text-center font-mono font-bold text-xs text-purple-300"
                      />
                      <span className="text-xs text-bwb-muted font-mono">min</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startTimer('BUILD', finalBuildMinutes * 60)}
                        className="text-xs py-1 px-2.5 h-8 border-purple-400/40 text-purple-300 font-bold hover:bg-purple-400/10"
                      >
                        <Play size={12} className="mr-1" /> Start
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Live Stage HUD & Timer Display Card */}
          <div className="lg:col-span-6">
            <Card padding="lg" className="h-full border-bwb-accent/30 shadow-2xl bg-gradient-to-br from-bwb-surface via-bwb-surface-2 to-bwb-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-bwb-accent animate-pulse" />
                    <h3 className="font-display font-bold text-base text-bwb-text">Live Stage HUD</h3>
                  </div>
                  {activeTimerType && (
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30">
                      {activeTimerType} TIMER ACTIVE
                    </span>
                  )}
                </div>

                {/* Giant Digit Clock */}
                <div className="p-6 rounded-3xl bg-bwb-bg/90 border border-white/10 text-center shadow-inner my-2">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-bwb-muted mb-1">
                    {activeTimerType ? `${activeTimerType} REMAINING` : 'TIMER STANDBY'}
                  </p>
                  <p className="font-display font-black text-5xl sm:text-6xl text-bwb-accent font-mono tracking-tight select-none">
                    {String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:
                    {String(timerRemaining % 60).padStart(2, '0')}
                  </p>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button
                    size="md"
                    onClick={toggleTimer}
                    disabled={timerRemaining === 0}
                    className={`font-bold text-xs ${
                      isTimerRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-bwb-bg'
                        : 'bg-bwb-accent hover:bg-bwb-accent/90 text-bwb-bg'
                    }`}
                  >
                    {isTimerRunning ? <Pause size={14} className="mr-1.5" /> : <Play size={14} className="mr-1.5" />}
                    <span>{isTimerRunning ? 'Pause Clock' : 'Resume Clock'}</span>
                  </Button>

                  <Button
                    size="md"
                    variant="secondary"
                    onClick={resetTimer}
                    className="text-xs font-bold border-white/10 text-bwb-muted hover:text-bwb-text"
                  >
                    <RotateCcw size={14} className="mr-1.5" />
                    <span>Reset</span>
                  </Button>
                </div>
              </div>

              {/* Quick Phase Shortcut */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-bwb-muted">Direct stage transition:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => api.setPhase(game.id, 'BUILDING')}
                    className="px-2.5 py-1 rounded-lg bg-bwb-surface-2 border border-bwb-border hover:border-bwb-accent text-bwb-text text-[11px] font-bold"
                  >
                    To Building
                  </button>
                  <button
                    type="button"
                    onClick={() => api.setPhase(game.id, 'PITCHING')}
                    className="px-2.5 py-1 rounded-lg bg-bwb-accent/15 border border-bwb-accent/30 text-bwb-accent text-[11px] font-bold"
                  >
                    To Pitching
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ============================================================
            SECTION 2: LIVE PITCH STAGE & JUDGE ATTACK QUESTION BANK
            ============================================================ */}
        <Card padding="lg" className="border-bwb-border/80 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
            <div>
              <h2 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
                <MessageSquare size={18} className="text-bwb-accent" />
                <span>Live Pitch Stage & AI Judge Attack Questions</span>
              </h2>
              <p className="text-xs text-bwb-muted mt-0.5">
                Manage presenting team order, launch rapid-fire attack questions, and preview architectural defense.
              </p>
            </div>

            {/* Team Queue Selector */}
            {game.teams.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-bwb-muted">Presenting:</span>
                <select
                  value={currentPitchTeamIndex}
                  onChange={(e) => setCurrentPitchTeamIndex(Number(e.target.value))}
                  style={{ colorScheme: 'dark' }}
                  className="px-3 py-1.5 rounded-xl bg-bwb-surface-2 border border-bwb-border text-bwb-text text-xs font-bold cursor-pointer outline-none focus:border-bwb-accent"
                >
                  {game.teams.map((team, idx) => (
                    <option key={team.id} value={idx}>
                      #{idx + 1} - {team.name} ({team.submission ? 'Submitted' : 'Pending'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activePitchTeam ? (
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Presenting Squad Info */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-bwb-surface-2 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-bwb-accent font-bold px-2.5 py-0.5 rounded-lg bg-bwb-accent/10 border border-bwb-accent/20">
                    Squad #{currentPitchTeamIndex + 1}
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    Passcode: {activePitchTeam.passcode || 'N/A'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-bwb-text">{activePitchTeam.name}</h3>
                  <p className="text-xs text-bwb-muted mt-0.5">
                    Lead: <strong className="text-bwb-text">{activePitchTeam.leaderName || activePitchTeam.members[0]}</strong>
                    {activePitchTeam.department && ` · ${activePitchTeam.department} ${activePitchTeam.year || ''}`}
                  </p>
                </div>

                {/* Assigned Problem */}
                <div className="p-3 rounded-xl bg-bwb-bg border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-bwb-accent font-bold mb-1">Assigned Challenge</p>
                  <p className="text-xs font-bold text-bwb-text">{activePitchProblem?.title || 'Problem Pending'}</p>
                </div>

                {/* 3 Tech Cards */}
                <div>
                  <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold mb-2">Assigned Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activePitchTeam.technologies && activePitchTeam.technologies.length > 0 ? (
                      activePitchTeam.technologies.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-bwb-surface border border-bwb-accent/30 text-bwb-text">
                          {t.icon} {t.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-bwb-muted italic">No cards drafted yet</span>
                    )}
                  </div>
                </div>

                {/* Quick Pitch Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => startTimer('PITCH', pitchSeconds)}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-bwb-bg font-bold text-xs"
                  >
                    <Play size={13} className="mr-1" /> Start 60s Pitch
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => startTimer('ATTACK', attackSeconds)}
                    className="flex-1 bg-bwb-warn hover:bg-bwb-warn/90 text-bwb-bg font-bold text-xs"
                  >
                    <ShieldAlert size={13} className="mr-1" /> 20s Attack
                  </Button>
                </div>
              </div>

              {/* AI Judge Attack Question Bank */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-bwb-text flex items-center gap-1.5">
                    <Sparkles size={14} className="text-bwb-accent" />
                    Recommended Judge Attack Question Bank
                  </h4>
                  <span className="text-[11px] font-mono text-bwb-muted">Click question to copy</span>
                </div>

                <div className="space-y-2">
                  {suggestedAttackQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      onClick={() => copyText(q, 'Judge Question')}
                      className="p-3 rounded-2xl bg-bwb-surface-2/70 border border-white/5 hover:border-bwb-accent/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-xs text-bwb-accent font-bold mt-0.5">Q{idx + 1}.</span>
                        <p className="text-xs sm:text-sm text-bwb-text group-hover:text-bwb-accent transition-colors">
                          {q}
                        </p>
                      </div>
                      <Copy size={13} className="text-bwb-muted group-hover:text-bwb-accent shrink-0 mt-1 opacity-60 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-bwb-muted text-sm">
              No registered teams yet in this tournament room. Teams can join at <strong className="text-bwb-accent font-mono">/join</strong>.
            </div>
          )}
        </Card>

        {/* ============================================================
            SECTION 3: REGISTERED TEAMS DIRECTORY & EXCEL DOWNLOAD TABLE
            ============================================================ */}
        <Card padding="lg" className="border-bwb-border/80 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
            <div>
              <h2 className="font-display font-bold text-lg text-bwb-text flex items-center gap-2">
                <Users size={18} className="text-bwb-accent" />
                <span>Registered Teams Directory & Contact Data</span>
                <Badge variant="default" className="text-xs">{filteredTeams.length} / {game.teams.length}</Badge>
              </h2>
              <p className="text-xs text-bwb-muted mt-0.5">
                Complete roster with team passcodes, phone numbers, emails, and academic departments.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={copyAllPasscodes}
                disabled={game.teams.length === 0}
                className="text-xs font-bold border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
              >
                <Key size={13} className="mr-1.5 text-amber-400" />
                <span>Copy All Passcodes</span>
              </Button>

              <Button
                size="sm"
                onClick={handleExportToExcel}
                disabled={game.teams.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-bwb-bg font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                <Download size={14} className="mr-1.5" />
                <span>Download Excel (.csv)</span>
              </Button>
            </div>
          </div>

          {/* Search & Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-bwb-muted" />
              <input
                type="text"
                placeholder="Search team, leader, passcode, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-bwb-surface-2 border border-bwb-border text-bwb-text text-xs placeholder:text-bwb-muted/60 focus:border-bwb-accent outline-none"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full px-3 py-2 rounded-xl bg-bwb-surface-2 border border-bwb-border text-bwb-text text-xs font-semibold cursor-pointer outline-none focus:border-bwb-accent"
              >
                <option value="ALL">All Departments</option>
                <option value="AIDS">AIDS (AI & DS)</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full px-3 py-2 rounded-xl bg-bwb-surface-2 border border-bwb-border text-bwb-text text-xs font-semibold cursor-pointer outline-none focus:border-bwb-accent"
              >
                <option value="ALL">All Academic Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
          </div>

          {/* Comprehensive Teams Table */}
          {filteredTeams.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-bwb-border shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-bwb-surface-2 text-bwb-muted font-mono uppercase text-[11px] border-b border-bwb-border">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Squad Name</th>
                    <th className="py-3 px-3">Passcode</th>
                    <th className="py-3 px-3">👑 Team Leader</th>
                    <th className="py-3 px-3">👤 Teammate #2</th>
                    <th className="py-3 px-3">👤 Teammate #3</th>
                    <th className="py-3 px-3">Academic Dept</th>
                    <th className="py-3 px-3">Contact Info</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredTeams.map((team, idx) => {
                    const teamPasscode = team.passcode || 'N/A'
                    const isSubmitted = !!team.submission
                    const leader = team.leaderName || (team.members && team.members[0]) || 'N/A'
                    const member2 = team.members && team.members[1] ? team.members[1] : null
                    const member3 = team.members && team.members[2] ? team.members[2] : null

                    return (
                      <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Index */}
                        <td className="py-3.5 px-3 font-mono text-bwb-muted font-bold">
                          #{idx + 1}
                        </td>

                        {/* Squad Name */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-bwb-text">
                              {team.name}
                            </span>
                            {team.isOnline ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live in room" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-gray-500" title="Offline" />
                            )}
                          </div>
                        </td>

                        {/* Passcode with Copy */}
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => copyText(teamPasscode, `Passcode for ${team.name}`)}
                            title="Click to copy passcode"
                            className="px-2 py-1 rounded-xl text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1 hover:bg-amber-400/20 transition-colors shadow-sm"
                          >
                            <Key size={11} className="text-amber-400" />
                            <span>{teamPasscode}</span>
                            <Copy size={10} className="text-amber-400/70" />
                          </button>
                        </td>

                        {/* Team Leader */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            <span>👑</span>
                            <span>{leader}</span>
                          </span>
                        </td>

                        {/* Teammate #2 */}
                        <td className="py-3.5 px-3">
                          {member2 ? (
                            <span className="font-medium text-bwb-text flex items-center gap-1">
                              <span className="text-bwb-accent">#2</span>
                              <span>{member2}</span>
                            </span>
                          ) : (
                            <span className="text-bwb-muted/50 font-mono">—</span>
                          )}
                        </td>

                        {/* Teammate #3 (Optional) */}
                        <td className="py-3.5 px-3">
                          {member3 ? (
                            <span className="font-medium text-bwb-text flex items-center gap-1">
                              <span className="text-cyan-400">#3</span>
                              <span>{member3}</span>
                            </span>
                          ) : (
                            <span className="text-bwb-muted/40 font-mono text-[11px]">None (2-member)</span>
                          )}
                        </td>

                        {/* Academic Dept / Year / Section */}
                        <td className="py-3.5 px-3">
                          {(team.department || team.year || team.section) ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-purple-300">
                                {team.department || 'Dept N/A'}
                              </span>
                              <span className="text-[10px] text-bwb-muted font-mono">
                                {[team.year, team.section ? `Sec ${team.section}` : null].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-bwb-muted italic text-[11px]">Not provided</span>
                          )}
                        </td>

                        {/* Contact Info */}
                        <td className="py-3.5 px-3">
                          {(team.email || team.phone) ? (
                            <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                              {team.email && (
                                <span className="text-bwb-text truncate max-w-[180px] flex items-center gap-1">
                                  <Mail size={11} className="text-bwb-accent shrink-0" />
                                  {team.email}
                                </span>
                              )}
                              {team.phone && (
                                <span className="text-bwb-muted flex items-center gap-1">
                                  <Phone size={11} className="text-bwb-accent shrink-0" />
                                  {team.phone}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-bwb-muted italic text-[11px]">N/A</span>
                          )}
                        </td>

                        {/* Submission & Online Status */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                              isSubmitted
                                ? 'bg-bwb-success/15 text-bwb-success border-bwb-success/30'
                                : 'bg-bwb-surface-2 text-bwb-muted border-bwb-border'
                            }`}>
                              {isSubmitted ? 'Submitted' : 'Building'}
                            </span>

                            {team.isOnline && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                LIVE
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-bwb-muted text-xs bg-bwb-surface-2/40 rounded-2xl border border-dashed border-bwb-border">
              No teams found matching the selected filter criteria.
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}
