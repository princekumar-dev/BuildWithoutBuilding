import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, Zap } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { Button } from '../../components/ui/Button'
import { TechnologyCard } from '../../components/cards/TechnologyCard'
import { useGameStore } from '../../store/gameStore'
import { usePhaseNavigation } from '../../hooks/usePhaseNavigation'
import { drawProblemCards } from '../../data/mockData'
import { api } from '../../lib/api'
import { SoundFX } from '../../lib/soundEffects'
import type { Problem, Technology } from '../../types'

export default function CardRevealPage() {
  usePhaseNavigation()
  const { game, session, setGame } = useGameStore()
  const [catalog, setCatalog] = useState<{ problems: Problem[]; technologies: Technology[] }>({ problems: [], technologies: [] })

  useEffect(() => {
    api.getCatalog().then(setCatalog).catch(() => {})
  }, [])

  useEffect(() => {
    if (game.id) {
      api.getGame(game.id).then(setGame).catch(() => {})
    }
  }, [game.id, setGame])

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const activeProblemId = myTeam?.selectedProblemId || 'p1'
  const problem = (game.activeProblems || []).find((p) => p.id === activeProblemId)
    || catalog.problems.find((p) => p.id === activeProblemId)
    || null
  
  // Ensure we always have 3 real technologies drawn from this problem's specific card stacks
  const myTechs = (myTeam?.technologies && myTeam.technologies.length >= 3)
    ? myTeam.technologies
    : drawProblemCards(activeProblemId)

  const serverRevealed = myTeam?.revealedCards ?? []
  const [localRevealed, setLocalRevealed] = useState<number[]>(serverRevealed)
  const revealed = [...new Set([...serverRevealed, ...localRevealed])]

  const revealSlot = async (slotIndex: number) => {
    if (revealed.includes(slotIndex) || !session?.teamId) return
    SoundFX.playSuccessChime()
    setLocalRevealed((prev) => [...prev, slotIndex])
    try {
      setGame(await api.revealCard(game.id, session.teamId, slotIndex))
    } catch { /* local state fallback */ }
  }


  const revealAll = async () => {
    if (!session?.teamId) return
    const unrevealed = [0, 1, 2].filter((i) => !revealed.includes(i))
    for (const slot of unrevealed) {
      await revealSlot(slot)
    }
  }

  const allRevealed = revealed.length >= 3

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-16 sm:pb-24">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent">{game.code}</Badge>
              <span className="text-xs text-bwb-muted">Tech Stack Drafting</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">{game.name}</h1>
            <p className="text-bwb-muted text-sm mt-0.5">
              Team: <span className="text-bwb-text font-semibold">{session?.teamName ?? 'Your Team'}</span>
            </p>
          </div>
          <PhaseIndicator phase={game.phase} />
        </div>

        {/* Instructions / Progress HUD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="stereo-card rounded-3xl p-6 sm:p-8 text-center mb-8 relative overflow-hidden"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bwb-purple/15 text-bwb-purple mb-3 border border-bwb-purple/30 shadow-lg">
            <Sparkles size={24} className="animate-spin" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Reveal Your 3 Tech Cards
          </h2>
          {problem && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto text-center">
              <p className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-0.5">Your Chosen Challenge Track</p>
              <p className="font-display font-bold text-sm text-bwb-text">{problem.title} ({problem.category})</p>
            </div>
          )}
          <p className="text-bwb-muted text-xs sm:text-sm max-w-lg mx-auto mb-6">
            Click each mystery slot below to reveal your assigned technologies. Your team must incorporate all 3 into your final architecture!
          </p>

          {/* 3-Step Progress Indicator */}
          <div className="max-w-xs mx-auto flex items-center justify-between gap-2 p-2 rounded-2xl glass border border-white/5">
            {[0, 1, 2].map((slotIdx) => {
              const isUnlocked = revealed.includes(slotIdx)
              return (
                <div
                  key={slotIdx}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isUnlocked
                      ? 'bg-bwb-accent text-bwb-bg shadow-md shadow-bwb-accent/20'
                      : 'text-bwb-muted bg-bwb-surface-2/60'
                  }`}
                >
                  {isUnlocked ? <CheckCircle2 size={13} /> : <span>#{slotIdx + 1}</span>}
                  <span>Slot {slotIdx + 1}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 3 Interactive Tech Card Slots */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-10">
          {[0, 1, 2].map((slotIndex) => {
            const isRevealed = revealed.includes(slotIndex)
            const tech = myTechs[slotIndex]
            return (
              <motion.div
                key={slotIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slotIndex * 0.1 }}
              >
                <TechnologyCard
                  technology={tech}
                  revealed={isRevealed}
                  index={slotIndex}
                  locked={isRevealed}
                  clickable={!isRevealed}
                  onClick={() => revealSlot(slotIndex)}
                  size="lg"
                />
              </motion.div>
            )
          })}
        </div>

        {/* Quick Action Button for player */}
        {!allRevealed && (
          <div className="text-center mb-8">
            <Button variant="secondary" size="md" onClick={revealAll}>
              <Zap size={16} className="mr-1.5 text-bwb-accent" />
              Reveal All Remaining Cards
            </Button>
          </div>
        )}

        {/* Full Tech Stack Summary & Ready Status */}
        <AnimatePresence>
          {allRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="holo-card rounded-3xl p-6 sm:p-8 text-center mt-6 sm:mt-8 shadow-2xl border border-bwb-success/30"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bwb-success/20 text-bwb-success mb-3 border border-bwb-success/30">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-bwb-text mb-2">
                Tech Stack Locked & Loaded!
              </h3>
              <p className="text-xs sm:text-sm text-bwb-muted max-w-md mx-auto mb-5">
                All 3 technologies have been securely registered to your team. Prepare your strategy—the host will start the Build Phase shortly.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {myTechs.map((t, i) => (
                  <span
                    key={t.id || i}
                    className="px-3 py-1.5 rounded-xl glass border border-bwb-accent/30 text-xs font-semibold text-bwb-text flex items-center gap-1.5"
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  )
}

