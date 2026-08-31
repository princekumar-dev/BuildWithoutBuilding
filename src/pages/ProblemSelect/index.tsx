import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { CheckCircle2, Sparkles, ChevronLeft, ChevronRight, Zap, Target, Lock, Users } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { useGameStore } from '../../store/gameStore'
import { usePhaseNavigation } from '../../hooks/usePhaseNavigation'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import type { Problem } from '../../types'
import { api } from '../../lib/api'

const categoryThemes: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
  'Disaster Response': { bg: 'from-red-950/40 via-red-900/20 to-bwb-surface', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '🚨' },
  'Urban Mobility': { bg: 'from-blue-950/40 via-blue-900/20 to-bwb-surface', border: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '🚦' },
  'Water Management': { bg: 'from-cyan-950/40 via-cyan-900/20 to-bwb-surface', border: 'border-cyan-500/40', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: '💧' },
  'Healthcare': { bg: 'from-pink-950/40 via-pink-900/20 to-bwb-surface', border: 'border-pink-500/40', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30', icon: '🏥' },
  'Waste Management': { bg: 'from-amber-950/40 via-amber-900/20 to-bwb-surface', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '♻️' },
  'Agriculture': { bg: 'from-emerald-950/40 via-emerald-900/20 to-bwb-surface', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🌾' },
  'Public Transport': { bg: 'from-purple-950/40 via-purple-900/20 to-bwb-surface', border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '🚌' },
  'Civic Infrastructure': { bg: 'from-orange-950/40 via-orange-900/20 to-bwb-surface', border: 'border-orange-500/40', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '🏙️' },
}

export default function ProblemSelectPage() {
  usePhaseNavigation()
  useRealtimeGame()
  const { game, session, setSelectedProblem, setGame } = useGameStore()
  const [problems, setProblems] = useState<Problem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragDirection, setDragDirection] = useState(0)
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pillContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (game?.activeProblems && game.activeProblems.length > 0) {
      setProblems((prev) => {
        const prevIds = prev.map((p) => p.id).join(',')
        const nextIds = game.activeProblems!.map((p) => p.id).join(',')
        return prevIds === nextIds ? prev : game.activeProblems!
      })
    } else {
      api.getCatalog().then((c) => {
        if (game?.activeProblemIds && game.activeProblemIds.length > 0) {
          const filtered = c.problems.filter((p) => game.activeProblemIds?.includes(p.id))
          setProblems((prev) => {
            const prevIds = prev.map((p) => p.id).join(',')
            const nextIds = filtered.map((p) => p.id).join(',')
            return prevIds === nextIds ? prev : filtered
          })
        } else if (game?.maxTeams === 8) {
          setProblems(c.problems.slice(0, 4))
        } else {
          setProblems(c.problems)
        }
      }).catch(() => {})
    }
  }, [game?.activeProblems, (game?.activeProblemIds || []).join(','), game?.maxTeams])

  useEffect(() => {
    const myTeam = game.teams.find((t) => t.id === session?.teamId)
    if (myTeam?.selectedProblemId) {
      setSelected(myTeam.selectedProblemId)
      const foundIdx = problems.findIndex((p) => p.id === myTeam.selectedProblemId)
      if (foundIdx >= 0) setActiveIndex(foundIdx)
    }
  }, [game.teams, session?.teamId, problems])

  // Automatically scroll active pill into center view
  useEffect(() => {
    if (pillRefs.current[activeIndex]) {
      pillRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [activeIndex])

  const handleConfirm = async (problem: Problem) => {
    if (!session?.teamId || confirming) return

    // Pre-check client capacity
    const currentCount = game.problemTeamCounts?.[problem.id] || game.teams.filter((t) => t.selectedProblemId === problem.id && t.id !== session.teamId).length
    if (currentCount >= 2 && selected !== problem.id) {
      toast.error(`"${problem.category}" is already full (maximum 2 teams per problem). Please choose another.`)
      return
    }

    setConfirming(true)
    try {
      const updated = await api.selectProblem(game.id, session.teamId, problem.id)
      setGame(updated)
      setSelected(problem.id)
      setSelectedProblem(problem)
      toast.success(`Challenge track locked: "${problem.category}" (2/2 Squads Max)`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Unable to select challenge')
    } finally {
      setConfirming(false)
    }
  }

  const nextProblem = () => {
    setDragDirection(1)
    setActiveIndex((prev) => (prev < problems.length - 1 ? prev + 1 : 0))
  }

  const prevProblem = () => {
    setDragDirection(-1)
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : problems.length - 1))
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 40
    if (info.offset.x < -threshold) {
      nextProblem()
    } else if (info.offset.x > threshold) {
      prevProblem()
    }
  }

  const currentProblem = problems[activeIndex] || problems[0]
  const currentTheme = currentProblem ? (categoryThemes[currentProblem.category] || {
    bg: 'from-purple-950/40 via-purple-900/20 to-bwb-surface',
    border: 'border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: '⚡',
  }) : {
    bg: 'from-purple-950/40 via-purple-900/20 to-bwb-surface',
    border: 'border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: '⚡',
  }

  const trackCount = problems.length || (game?.maxTeams === 8 ? 4 : 8)

  // Capacity calculation for current problem
  const currentProblemTeamCount = currentProblem
    ? (game.problemTeamCounts?.[currentProblem.id] ?? game.teams.filter((t) => t.selectedProblemId === currentProblem.id).length)
    : 0
  const isSelectedByMe = selected === currentProblem?.id
  const isCurrentProblemFull = currentProblemTeamCount >= 2 && !isSelectedByMe

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header Navigation & Phase Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Round 2 · Challenge Selection
              </span>
              {selected && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Track Locked</span>
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-gradient">
              Choose Your Problem Statement
            </h1>
          </div>
          <PhaseIndicator phase={game.phase} />
        </div>

        {/* Instructions / Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="stereo-card rounded-2xl p-4 sm:p-5 mb-5 text-center relative overflow-hidden border border-purple-500/20"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="text-bwb-accent" size={20} />
            <h2 className="font-display text-lg sm:text-xl font-bold">{trackCount} Challenges · 1v1 Head-to-Head Duels (2 Squads / Track)</h2>
          </div>
          <p className="text-bwb-muted text-xs sm:text-sm max-w-lg mx-auto">
            Select your challenge track below. Exactly <strong className="text-bwb-accent">2 squads</strong> share each problem statement to duel head-to-head in Round 2. The winner of each 1v1 duel advances to the Grand Finals ({trackCount} Problem Champions total).
          </p>
        </motion.div>

        {/* Problem Quick Jump Chips with Smooth Auto-Centering & Balanced Justification */}
        {problems.length > 0 && (
          <div className="relative mb-5">
            <div
              ref={pillContainerRef}
              className={`flex gap-2.5 overflow-x-auto pb-2 scroll-smooth scrollbar-none no-print px-1 ${
                problems.length <= 4 ? 'justify-start sm:justify-center' : 'justify-start'
              }`}
            >
              {problems.map((p, idx) => {
                const isCurrent = idx === activeIndex
                const isSelected = selected === p.id
                const theme = categoryThemes[p.category]
                const count = game.problemTeamCounts?.[p.id] ?? game.teams.filter((t) => t.selectedProblemId === p.id).length
                const isFull = count >= 2 && !isSelected

                return (
                  <button
                    key={p.id}
                    ref={(el) => { pillRefs.current[idx] = el }}
                    type="button"
                    onClick={() => {
                      setDragDirection(idx > activeIndex ? 1 : -1)
                      setActiveIndex(idx)
                    }}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border shadow-sm cursor-pointer ${
                      isCurrent
                        ? 'bg-bwb-accent text-bwb-bg font-bold shadow-lg shadow-bwb-accent/25 border-bwb-accent scale-105 ring-2 ring-bwb-accent/30'
                        : isSelected
                        ? 'bg-bwb-accent/20 text-bwb-accent border-bwb-accent/50 hover:bg-bwb-accent/30'
                        : isFull
                        ? 'bg-bwb-surface-2/60 text-bwb-muted/50 border-white/5 opacity-60'
                        : 'bg-bwb-surface-2 text-bwb-muted hover:text-bwb-text border-bwb-border hover:border-bwb-accent/40'
                    }`}
                  >
                    <span className="text-sm">{theme?.icon ?? '💡'}</span>
                    <span>{p.category}</span>
                    {isSelected ? (
                      <CheckCircle2 size={13} className={isCurrent ? 'text-bwb-bg' : 'text-bwb-accent'} />
                    ) : isFull ? (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isCurrent ? 'bg-black/25 text-bwb-bg' : 'bg-red-500/20 text-red-300'
                      }`}>
                        2/2 FULL
                      </span>
                    ) : (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isCurrent ? 'bg-black/25 text-bwb-bg font-black' : 'bg-white/10 text-bwb-muted'
                      }`}>
                        {count}/2
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Problem 3D Card with Direct Swipe/Drag Physics */}
        {currentProblem && currentTheme && (
          <div className="relative">
            <AnimatePresence mode="wait" custom={dragDirection}>
              <motion.div
                key={currentProblem.id}
                custom={dragDirection}
                initial={{ opacity: 0, x: dragDirection > 0 ? 60 : -60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: dragDirection > 0 ? -60 : 60, scale: 0.95 }}
                transition={{ duration: 0.28, type: 'spring', stiffness: 280, damping: 25 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={handleDragEnd}
                className={`rounded-3xl border ${currentTheme.border} bg-gradient-to-br ${currentTheme.bg} stereo-card p-4 sm:p-8 min-h-[380px] flex flex-col justify-between relative overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y select-none shadow-2xl`}
              >
                {/* Background glow circle */}
                <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-bwb-accent/5 blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                    <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${currentTheme.badge} flex items-center gap-1.5 shadow-sm`}>
                      <span className="text-sm">{currentTheme.icon}</span>
                      <span>{currentProblem.category}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1 ${
                        isCurrentProblemFull
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : isSelectedByMe
                          ? 'bg-bwb-accent/20 text-bwb-accent border-bwb-accent/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        <Users size={12} />
                        <span>{currentProblemTeamCount}/2 Teams</span>
                        {isCurrentProblemFull && <span>· LOCKED</span>}
                      </span>

                      <span className="text-xs font-mono text-bwb-muted bg-bwb-bg/50 px-2.5 py-1 rounded-lg border border-white/5">
                        {activeIndex + 1} of {problems.length}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-2xl sm:text-3xl mb-4 leading-tight text-bwb-text">
                    {currentProblem.title}
                  </h3>

                  {/* Problem Context */}
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-bwb-muted font-bold mb-1 flex items-center gap-1.5">
                      <span>📌</span> The Problem:
                    </p>
                    <p className="text-xs sm:text-sm text-bwb-text/90 leading-relaxed">
                      {currentProblem.description}
                    </p>
                  </div>

                  {/* Challenge Objective */}
                  {currentProblem.challenge && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-bwb-surface-2/80 border border-bwb-accent/30 shadow-inner">
                      <p className="text-xs uppercase tracking-wider text-bwb-accent font-bold mb-1 flex items-center gap-1.5">
                        <Target size={13} /> The Challenge:
                      </p>
                      <p className="text-xs sm:text-sm text-bwb-text leading-snug font-medium">
                        {currentProblem.challenge}
                      </p>
                    </div>
                  )}
                </div>

                {/* Twist Section */}
                {currentProblem.twist && (
                  <div className="mt-3 px-4 py-3 rounded-2xl bg-bwb-warn/10 border border-bwb-warn/30 glass">
                    <p className="text-xs text-bwb-warn font-semibold flex items-center gap-1.5 mb-1">
                      <Sparkles size={14} className="animate-spin" />
                      <span>THE TWIST / CONSTRAINT:</span>
                    </p>
                    <p className="text-xs sm:text-sm text-bwb-text leading-snug font-medium">
                      {currentProblem.twist}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {problems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevProblem}
                  className="absolute left-2 top-1/2 -translate-y-1/2 sm:-translate-x-5 z-20 w-11 h-11 rounded-full glass border border-bwb-border flex items-center justify-center text-bwb-muted hover:text-bwb-accent hover:border-bwb-accent/50 transition-all shadow-xl touch-manipulation"
                  aria-label="Previous Challenge"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={nextProblem}
                  className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-11 h-11 rounded-full glass border border-bwb-border flex items-center justify-center text-bwb-muted hover:text-bwb-accent hover:border-bwb-accent/50 transition-all shadow-xl"
                  aria-label="Next Challenge"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Action Button & Selection Lock Status */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {isSelectedByMe ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="holo-card rounded-2xl px-6 py-4 text-center w-full max-w-md"
            >
              <div className="flex items-center justify-center gap-2 text-bwb-accent font-bold text-base mb-1">
                <CheckCircle2 size={20} />
                <span>Selected by Your Team!</span>
              </div>
              <p className="text-xs text-bwb-muted">
                Your challenge is locked ({currentProblemTeamCount}/2 slots filled). When the host begins the next phase, you will draft your 3 tech cards.
              </p>
            </motion.div>
          ) : isCurrentProblemFull ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center w-full max-w-md">
              <div className="flex items-center justify-center gap-2 text-red-300 font-bold text-sm mb-1">
                <Lock size={16} />
                <span>Problem Statement Full (2/2 Teams)</span>
              </div>
              <p className="text-xs text-bwb-muted">
                Both team slots for &ldquo;{currentProblem?.category}&rdquo; have been claimed. Please swipe to another open problem statement.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              <Button
                fullWidth
                size="lg"
                onClick={() => currentProblem && handleConfirm(currentProblem)}
                disabled={confirming || !currentProblem}
                className="glow-accent"
              >
                <Target size={18} className="mr-2" />
                {confirming ? 'Locking in...' : `Select "${currentProblem?.category}" (${2 - currentProblemTeamCount} slot left)`}
              </Button>
            </div>
          )}

          {selected && !isSelectedByMe && (
            <p className="text-xs text-bwb-muted mt-1">
              Currently locked on another challenge. You can switch as long as this problem statement is not full.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
