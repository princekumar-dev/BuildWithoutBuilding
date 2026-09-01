import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Sparkles } from 'lucide-react'
import type { Team } from '../../types'
import { getRound3Finalists } from '../../lib/tournament'

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
  // Filter contenders strictly to qualified finalists
  const finalists = getRound3Finalists(teams, [])
  const sorted = [...finalists].sort((a, b) => {
    const scoreA = a.round3Score ?? a.score ?? 0
    const scoreB = b.round3Score ?? b.score ?? 0
    return scoreB - scoreA
  })

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

      {/* 3D Esports Tournament Podium (Main Top 3 Pillars Side-by-Side Olympic Style) */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-1.5 sm:gap-6 items-end justify-center mb-6 sm:mb-8 pt-4 sm:pt-8">
        {/* 2ND PLACE (SILVER) */}
        {second ? (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, type: 'spring', stiffness: 180 }}
            className="flex flex-col items-center text-center order-1"
          >
            <div className="relative mb-2 sm:mb-3 flex flex-col items-center">
              <div className="w-11 h-11 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-400/20 text-slate-300 border-2 border-slate-300/50 flex items-center justify-center text-lg sm:text-2xl shadow-xl shadow-slate-400/10">
                <Medal size={22} className="sm:w-8 sm:h-8 text-slate-300" />
              </div>
              <span className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-mono font-bold text-slate-300 bg-slate-700/40 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-slate-400/30">
                🥈 2ND
              </span>
              <h3 className="font-display font-bold text-xs sm:text-lg text-bwb-text truncate max-w-[95px] sm:max-w-[220px] mt-1">
                {second.name}
              </h3>
              <div className="text-sm sm:text-3xl font-black text-slate-200 font-display mt-0.5">
                <CountUpNumber target={second.round3Score ?? second.score ?? 0} />
                <span className="text-[10px] sm:text-xs text-bwb-muted font-normal"> pts</span>
              </div>
            </div>

            {/* Pedestal */}
            <div className="w-full h-24 sm:h-44 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-slate-500/30 via-slate-700/20 to-bwb-surface border-t-2 border-x-2 border-slate-400/40 p-1.5 sm:p-3 flex flex-col items-center justify-center shadow-2xl">
              <span className="font-display font-black text-2xl sm:text-6xl text-slate-400/60">2</span>
              <p className="text-[9px] sm:text-xs text-slate-300/90 font-mono font-bold hidden sm:block mt-1">Silver Prize</p>
            </div>
          </motion.div>
        ) : <div className="order-1" />}

        {/* 1ST PLACE (GOLD CHAMPION) */}
        {first ? (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center text-center relative z-20 order-2"
          >
            {/* Victory Aura */}
            <div className="absolute -top-12 sm:-top-16 w-36 sm:w-56 h-36 sm:h-56 rounded-full bg-bwb-gold/25 blur-2xl sm:blur-3xl pointer-events-none animate-pulse" />

            <div className="relative mb-2 sm:mb-3 flex flex-col items-center">
              <div className="relative mb-1">
                <Crown size={22} className="sm:w-9 sm:h-9 text-bwb-gold animate-bounce mb-0.5 mx-auto" />
                <div className="w-14 h-14 sm:w-26 sm:h-26 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400/30 to-amber-600/20 text-bwb-gold border-2 border-bwb-gold flex items-center justify-center shadow-2xl shadow-amber-500/40">
                  <Trophy size={28} className="sm:w-12 sm:h-12 text-bwb-gold" />
                </div>
              </div>

              <span className="mt-0.5 sm:mt-1 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-mono font-black bg-bwb-gold text-bwb-bg shadow-xl tracking-wider">
                🏆 1ST CHAMP
              </span>
              <h2 className="font-display font-black text-xs sm:text-2xl text-bwb-text truncate max-w-[105px] sm:max-w-[260px] mt-1">
                {first.name}
              </h2>
              <div className="text-base sm:text-5xl font-black text-bwb-gold font-display mt-0.5">
                <CountUpNumber target={first.round3Score ?? first.score ?? 0} />
                <span className="text-[10px] sm:text-xs text-bwb-muted font-normal"> pts</span>
              </div>
            </div>

            {/* Pedestal */}
            <div className="w-full h-32 sm:h-60 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-500/40 via-amber-700/20 to-bwb-surface border-t-2 border-x-2 border-bwb-gold/70 p-1.5 sm:p-3 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-bwb-gold/5 animate-pulse" />
              <span className="font-display font-black text-3xl sm:text-7xl text-bwb-gold">1</span>
              <p className="text-[9px] sm:text-xs text-bwb-gold font-bold font-mono hidden sm:block mt-1">Champion</p>
            </div>
          </motion.div>
        ) : <div className="order-2" />}

        {/* 3RD PLACE (DUAL BRONZE JOINT CHAMPIONS) */}
        {thirdA ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 170 }}
            className="flex flex-col items-center text-center order-3"
          >
            {thirdB ? (
              /* DUAL 3RD PLACE TWIN SQUADS SIDE-BY-SIDE ON BRONZE PODIUM */
              <div className="relative mb-2 sm:mb-3 flex items-start justify-center gap-1.5 sm:gap-3 w-full">
                {/* 3rd Team A */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-800/20 text-amber-500 border-2 border-amber-600/40 flex items-center justify-center text-sm sm:text-xl shadow-xl">
                    <Medal size={18} className="sm:w-7 sm:h-7 text-amber-500" />
                  </div>
                  <span className="mt-1 text-[8px] sm:text-[11px] font-mono font-black text-amber-400 bg-amber-950/60 px-1 sm:px-2 py-0.5 rounded-full border border-amber-600/30 whitespace-nowrap">
                    🥉 3RD #1
                  </span>
                  <h3 className="font-display font-bold text-[11px] sm:text-sm text-bwb-text truncate w-full mt-0.5" title={thirdA.name}>
                    {thirdA.name}
                  </h3>
                  <div className="text-xs sm:text-xl font-black text-amber-400 font-display">
                    <CountUpNumber target={thirdA.round3Score ?? thirdA.score ?? 0} />
                    <span className="text-[9px] sm:text-xs text-bwb-muted font-normal"> pts</span>
                  </div>
                </div>

                {/* 3rd Team B */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-800/20 text-amber-500 border-2 border-amber-600/40 flex items-center justify-center text-sm sm:text-xl shadow-xl">
                    <Medal size={18} className="sm:w-7 sm:h-7 text-amber-500" />
                  </div>
                  <span className="mt-1 text-[8px] sm:text-[11px] font-mono font-black text-amber-400 bg-amber-950/60 px-1 sm:px-2 py-0.5 rounded-full border border-amber-600/30 whitespace-nowrap">
                    🥉 3RD #2
                  </span>
                  <h3 className="font-display font-bold text-[11px] sm:text-sm text-bwb-text truncate w-full mt-0.5" title={thirdB.name}>
                    {thirdB.name}
                  </h3>
                  <div className="text-xs sm:text-xl font-black text-amber-400 font-display">
                    <CountUpNumber target={thirdB.round3Score ?? thirdB.score ?? 0} />
                    <span className="text-[9px] sm:text-xs text-bwb-muted font-normal"> pts</span>
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE 3RD PLACE TEAM */
              <div className="relative mb-2 sm:mb-3 flex flex-col items-center">
                <div className="w-11 h-11 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-800/20 text-amber-500 border-2 border-amber-600/40 flex items-center justify-center text-lg sm:text-2xl shadow-xl">
                  <Medal size={22} className="sm:w-8 sm:h-8 text-amber-500" />
                </div>
                <span className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-amber-600/30">
                  🥉 3RD
                </span>
                <h3 className="font-display font-bold text-xs sm:text-lg text-bwb-text truncate max-w-[95px] sm:max-w-[220px] mt-1">
                  {thirdA.name}
                </h3>
                <div className="text-sm sm:text-3xl font-black text-amber-400 font-display mt-0.5">
                  <CountUpNumber target={thirdA.round3Score ?? thirdA.score ?? 0} />
                  <span className="text-[10px] sm:text-xs text-bwb-muted font-normal"> pts</span>
                </div>
              </div>
            )}

            {/* Pedestal */}
            <div className="w-full h-20 sm:h-36 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-900/30 via-amber-950/20 to-bwb-surface border-t-2 border-x-2 border-amber-600/40 p-1.5 sm:p-3 flex flex-col items-center justify-center shadow-2xl">
              <span className="font-display font-black text-2xl sm:text-5xl text-amber-600/60">3</span>
              <p className="text-[9px] sm:text-xs text-amber-500 font-mono font-bold hidden sm:block mt-1">
                {thirdB ? 'Dual Bronze' : 'Bronze Prize'}
              </p>
            </div>
          </motion.div>
        ) : <div className="order-3" />}
      </div>
    </div>
  )
}

