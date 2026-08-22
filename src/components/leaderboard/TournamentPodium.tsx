import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Sparkles, Award } from 'lucide-react'
import type { Team } from '../../types'

interface TournamentPodiumProps {
  teams: Team[]
}

function CountUpNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1400
    const stepTime = 25
    const totalSteps = duration / stepTime
    const increment = target / totalSteps

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target])

  return <span>{count}</span>
}

export function TournamentPodium({ teams }: TournamentPodiumProps) {
  const sorted = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const first = sorted[0]
  const second = sorted[1]
  const thirdA = sorted[2]
  const thirdB = sorted[3]

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Top 4 Tournament Prize Banner */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-gradient-to-r from-amber-500/20 via-bwb-accent/20 to-amber-500/20 text-bwb-gold border border-bwb-gold/40 flex items-center gap-2 shadow-lg">
          <Sparkles size={14} className="text-bwb-gold animate-spin" />
          <span>TOP 4 GRAND PRIZE WINNERS · 1ST (1), 2ND (1), 3RD (2)</span>
          <Sparkles size={14} className="text-bwb-gold animate-spin" />
        </span>
      </div>

      {/* 3D Esports Tournament Podium (Main Top 3 Pillars) */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end justify-center mb-8 pt-8">
        {/* 2ND PLACE (SILVER) */}
        {second ? (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, type: 'spring', stiffness: 180 }}
            className="flex flex-col items-center text-center order-2 md:order-1"
          >
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-400/20 text-slate-300 border-2 border-slate-300/50 flex items-center justify-center text-2xl shadow-xl shadow-slate-400/10">
                <Medal size={34} className="text-slate-300" />
              </div>
              <span className="mt-2 text-xs font-mono font-bold text-slate-300 bg-slate-700/40 px-2.5 py-0.5 rounded-full border border-slate-400/30">
                🥈 2ND PLACE (RUNNER-UP)
              </span>
              <h3 className="font-display font-bold text-base sm:text-xl text-bwb-text truncate max-w-[180px] sm:max-w-[220px] mt-1">
                {second.name}
              </h3>
              <div className="text-xl sm:text-3xl font-black text-slate-200 font-display mt-1">
                <CountUpNumber target={second.score ?? 0} />
                <span className="text-xs text-bwb-muted font-normal"> pts</span>
              </div>
            </div>

            {/* Pedestal */}
            <div className="w-full h-36 sm:h-44 rounded-t-3xl bg-gradient-to-b from-slate-500/30 via-slate-700/20 to-bwb-surface border-t-2 border-x-2 border-slate-400/40 p-3 flex flex-col items-center justify-center shadow-2xl">
              <span className="font-display font-black text-4xl sm:text-6xl text-slate-400/60">2</span>
              <p className="text-xs text-slate-300/90 font-mono font-bold mt-1">Silver Prize</p>
            </div>
          </motion.div>
        ) : <div className="order-2 md:order-1" />}

        {/* 1ST PLACE (GOLD CHAMPION) */}
        {first ? (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center text-center relative z-20 order-1 md:order-2"
          >
            {/* Victory Aura */}
            <div className="absolute -top-16 w-56 h-56 rounded-full bg-bwb-gold/25 blur-3xl pointer-events-none animate-pulse" />

            <div className="relative mb-3 flex flex-col items-center">
              <div className="relative mb-1">
                <Crown size={36} className="text-bwb-gold animate-bounce mb-1" />
                <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-3xl bg-gradient-to-br from-amber-400/30 to-amber-600/20 text-bwb-gold border-2 border-bwb-gold flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-amber-500/40">
                  <Trophy size={48} className="text-bwb-gold" />
                </div>
              </div>

              <span className="mt-1 px-3.5 py-1 rounded-full text-xs font-mono font-black bg-bwb-gold text-bwb-bg shadow-xl tracking-wider">
                🏆 1ST PLACE · GRAND CHAMPION
              </span>
              <h2 className="font-display font-black text-xl sm:text-3xl text-bwb-text truncate max-w-[180px] sm:max-w-[260px] mt-1.5">
                {first.name}
              </h2>
              <div className="text-3xl sm:text-5xl font-black text-bwb-gold font-display mt-1">
                <CountUpNumber target={first.score ?? 0} />
                <span className="text-xs text-bwb-muted font-normal"> pts</span>
              </div>
            </div>

            {/* Pedestal */}
            <div className="w-full h-48 sm:h-60 rounded-t-3xl bg-gradient-to-b from-amber-500/40 via-amber-700/20 to-bwb-surface border-t-2 border-x-2 border-bwb-gold/70 p-3 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-bwb-gold/5 animate-pulse" />
              <span className="font-display font-black text-5xl sm:text-7xl text-bwb-gold">1</span>
              <p className="text-xs text-bwb-gold font-bold font-mono mt-1">Tournament Champion</p>
            </div>
          </motion.div>
        ) : <div className="order-1 md:order-2" />}

        {/* 3RD PLACE PRIZE A */}
        {thirdA ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 170 }}
            className="flex flex-col items-center text-center order-3"
          >
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-800/20 text-amber-500 border-2 border-amber-600/40 flex items-center justify-center text-2xl shadow-xl">
                <Medal size={32} className="text-amber-500" />
              </div>
              <span className="mt-2 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-600/30">
                🥉 3RD PLACE (WINNER 1)
              </span>
              <h3 className="font-display font-bold text-base sm:text-xl text-bwb-text truncate max-w-[180px] sm:max-w-[220px] mt-1">
                {thirdA.name}
              </h3>
              <div className="text-xl sm:text-3xl font-black text-amber-400 font-display mt-1">
                <CountUpNumber target={thirdA.score ?? 0} />
                <span className="text-xs text-bwb-muted font-normal"> pts</span>
              </div>
            </div>

            {/* Pedestal */}
            <div className="w-full h-28 sm:h-36 rounded-t-3xl bg-gradient-to-b from-amber-900/30 via-amber-950/20 to-bwb-surface border-t-2 border-x-2 border-amber-600/40 p-3 flex flex-col items-center justify-center shadow-2xl">
              <span className="font-display font-black text-4xl sm:text-5xl text-amber-600/60">3</span>
              <p className="text-xs text-amber-500 font-mono font-bold mt-1">Bronze Prize A</p>
            </div>
          </motion.div>
        ) : <div className="order-3" />}
      </div>

      {/* DUAL 3RD PLACE JOINT WINNER CARD (Prize Winner #2 for 3rd Place) */}
      {thirdB && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="w-full max-w-2xl mt-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-bwb-surface-2 to-amber-950/40 border-2 border-amber-600/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-800/30 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
              <Award size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  🥉 3RD PLACE (WINNER 2)
                </span>
                <span className="text-xs text-bwb-muted font-mono">Joint Bronze Laureate</span>
              </div>
              <h4 className="font-display font-bold text-lg text-bwb-text mt-0.5">
                {thirdB.name}
              </h4>
              <p className="text-xs text-bwb-muted">
                {thirdB.members?.join(', ')}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold">Score</p>
            <div className="text-2xl font-black text-amber-400 font-display">
              <CountUpNumber target={thirdB.score ?? 0} />
              <span className="text-xs text-bwb-muted font-normal"> pts</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

