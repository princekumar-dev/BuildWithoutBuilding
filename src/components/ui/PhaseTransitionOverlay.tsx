import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy, Radio, Zap, Flame, ShieldAlert } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { SoundFX } from '../../lib/soundEffects'
import { getPhaseDuration } from '../../lib/phaseTimers'
import type { GamePhase } from '../../types'

function getPhaseDetails(gameId: string, currentRound: number, buildMinutes: number): Record<GamePhase, { title: string; subtitle: string; icon: any; color: string }> {
  const buildSec = getPhaseDuration(gameId, currentRound, 'BUILDING', buildMinutes)
  const pitchSec = getPhaseDuration(gameId, currentRound, 'PITCHING', buildMinutes)
  const buildLabel = buildSec >= 3600 ? `${buildSec / 3600}h` : `${Math.round(buildSec / 60)}-Minute`
  const pitchLabel = pitchSec >= 60 ? `${Math.round(pitchSec / 60)}-Minute` : `${pitchSec}-Second`

  return {
    LOBBY: {
      title: 'LOBBY OPEN',
      subtitle: 'Teams Assembling in Arena',
      icon: Sparkles,
      color: 'from-blue-600/30 to-purple-600/30 border-blue-500/50',
    },
    PROBLEM_REVEAL: {
      title: 'PROBLEM REVEAL',
      subtitle: '8 Challenges Open · Max 2 Teams per Problem',
      icon: Zap,
      color: 'from-amber-600/30 to-orange-600/30 border-amber-500/50',
    },
    CARD_REVEAL: {
      title: 'CARD DRAFT REVEAL',
      subtitle: 'Tech Components Allocated & Locked',
      icon: Flame,
      color: 'from-purple-600/30 to-pink-600/30 border-purple-500/50',
    },
    BUILDING: {
      title: 'BUILD PHASE ACTIVE',
      subtitle: `${buildLabel} Architecture Formulations Started`,
      icon: Zap,
      color: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/50',
    },
    SUBMISSION_LOCKED: {
      title: 'SUBMISSIONS LOCKED',
      subtitle: 'All Architectures Sealed for Evaluation',
      icon: ShieldAlert,
      color: 'from-red-600/30 to-amber-600/30 border-red-500/50',
    },
    PITCHING: {
      title: 'PITCH ARENA LIVE',
      subtitle: `${pitchLabel} Solution Presentations on Stage`,
      icon: Radio,
      color: 'from-cyan-600/30 to-blue-600/30 border-cyan-500/50',
    },
    JUDGE_ATTACK: {
      title: 'DEFENSE & JUDGE Q&A',
      subtitle: 'Defend Architecture Decisions Under Fire',
      icon: Flame,
      color: 'from-rose-600/30 to-red-600/30 border-rose-500/50',
    },
    JUDGING: {
      title: 'JUDGES DELIBERATING',
      subtitle: 'Rubric Scoring & Score Submissions',
      icon: Sparkles,
      color: 'from-purple-600/30 to-indigo-600/30 border-purple-500/50',
    },
    LEADERBOARD: {
      title: 'LEADERBOARD REVEAL',
      subtitle: 'Live Standings & Qualification Status',
      icon: Trophy,
      color: 'from-amber-500/30 to-yellow-600/30 border-amber-400/60',
    },
    FINAL_ROUND: {
      title: 'GRAND FINALS COMMENCING',
      subtitle: 'Top 8 Finalists Showdown for the Championship',
      icon: Trophy,
      color: 'from-amber-600/40 to-purple-600/40 border-amber-400/80',
    },
    RESULTS: {
      title: 'CHAMPIONSHIP CEREMONY',
      subtitle: 'Top 4 Grand Prize Honors Awarded',
      icon: Trophy,
      color: 'from-amber-500/40 to-yellow-500/40 border-bwb-gold',
    },
  }
}

export function PhaseTransitionOverlay() {
  const { game } = useGameStore()
  const [activeBanner, setActiveBanner] = useState<{ phase: GamePhase; round: number } | null>(null)
  const lastPhaseRef = useRef<GamePhase | null>(null)
  const lastRoundRef = useRef<number | null>(null)

  useEffect(() => {
    if (!game.phase) return

    const isPhaseChanged = lastPhaseRef.current !== null && lastPhaseRef.current !== game.phase
    const isRoundChanged = lastRoundRef.current !== null && lastRoundRef.current !== (game.currentRound ?? 1)

    if (isPhaseChanged || isRoundChanged) {
      const phase = game.phase
      const round = game.currentRound ?? 1
      setActiveBanner({ phase, round })

      if (phase === 'RESULTS' || (phase === 'LEADERBOARD' && round === 3)) {
        SoundFX.playVictoryFanfare()
      } else if (phase === 'FINAL_ROUND' || (isRoundChanged && round === 3)) {
        SoundFX.playEliminationAlert()
      } else {
        SoundFX.playPhaseTransition()
      }

      const timer = setTimeout(() => {
        setActiveBanner(null)
      }, 2600)

      lastPhaseRef.current = game.phase
      lastRoundRef.current = round
      return () => clearTimeout(timer)
    }

    lastPhaseRef.current = game.phase
    lastRoundRef.current = game.currentRound ?? 1
  }, [game.phase, game.currentRound])

  if (!activeBanner) return null

  const info = getPhaseDetails(game.id ?? '', game.currentRound ?? 1, game.buildDurationMinutes ?? 15)[activeBanner.phase] || getPhaseDetails('', 1, 15).LOBBY
  const IconComp = info.icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4">
        {/* Glow backdrop pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-bwb-bg/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          className={`relative max-w-xl w-full p-8 rounded-3xl bg-gradient-to-br ${info.color} border-2 shadow-2xl text-center backdrop-blur-2xl flex flex-col items-center justify-center`}
        >
          {/* Cybernetic Header Flare */}
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 shadow-xl text-bwb-accent">
            <IconComp size={34} className="animate-bounce text-amber-300" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-white/10 text-white border border-white/20 uppercase tracking-widest">
              ROUND {activeBanner.round} OF 3
            </span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide uppercase mb-2">
            {info.title}
          </h2>

          <p className="text-sm font-medium text-white/80 max-w-md">
            {info.subtitle}
          </p>

          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Room Synchronized</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
