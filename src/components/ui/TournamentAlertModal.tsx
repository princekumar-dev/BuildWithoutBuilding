import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, Sparkles, X, Eye } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Button } from './Button'
import { ConfettiCanvas } from './ConfettiCanvas'
import { SoundFX } from '../../lib/soundEffects'

export function TournamentAlertModal() {
  const { game, session } = useGameStore()
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const currentRound = game.currentRound ?? 1
  const isResultsPhase = game.phase === 'RESULTS'
  const isFinalRound = currentRound === 3 || game.phase === 'FINAL_ROUND'

  // Trigger when entering Round 3 or when Results phase is published
  const triggerKey = myTeam && (isFinalRound || isResultsPhase) ? `${myTeam.id}-r${currentRound}-${game.phase}` : null
  const isOpen = !!triggerKey && dismissedKey !== triggerKey && !!myTeam

  const isFinalist = (game.finalistTeamIds && myTeam)
    ? game.finalistTeamIds.includes(myTeam.id)
    : (myTeam?.isFinalist ?? ((myTeam?.rank ?? 99) <= 8))

  // Isolated scores
  const round2Score = myTeam?.round2Score ?? 0
  const round3Score = myTeam?.round3Score ?? myTeam?.score ?? 0

  // Podiums only apply during the official RESULTS ceremony
  const isChampion = isResultsPhase && myTeam?.rank === 1
  const isRunnerUp = isResultsPhase && myTeam?.rank === 2
  const isBronze = isResultsPhase && (myTeam?.rank === 3 || myTeam?.rank === 4)

  useEffect(() => {
    if (isOpen) {
      if (isChampion || isRunnerUp || isBronze || isFinalist) {
        SoundFX.playVictoryFanfare()
      } else {
        SoundFX.playEliminationAlert()
      }
    }
  }, [isOpen, isChampion, isRunnerUp, isBronze, isFinalist])

  if (!isOpen || !myTeam) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bwb-bg/85 backdrop-blur-xl">
        {(isFinalist || isChampion || isRunnerUp || isBronze) && <ConfettiCanvas active durationMs={4500} />}

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 shadow-2xl text-center overflow-hidden backdrop-blur-2xl ${
            isChampion
              ? 'bg-gradient-to-b from-amber-950/60 via-bwb-surface-2 to-bwb-surface border-bwb-gold shadow-amber-500/20'
              : isRunnerUp
              ? 'bg-gradient-to-b from-slate-900/80 via-bwb-surface-2 to-bwb-surface border-slate-300 shadow-slate-400/20'
              : isBronze
              ? 'bg-gradient-to-b from-amber-950/40 via-bwb-surface-2 to-bwb-surface border-amber-600 shadow-amber-600/20'
              : isFinalist
              ? 'bg-gradient-to-b from-emerald-950/60 via-bwb-surface-2 to-bwb-surface border-emerald-500 shadow-emerald-500/20'
              : 'bg-gradient-to-b from-red-950/30 via-bwb-surface-2 to-bwb-surface border-bwb-border shadow-2xl'
          }`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setDismissedKey(triggerKey)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-bwb-muted hover:text-bwb-text hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>

          {/* Icon Badge */}
          <div className="mx-auto w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-xl">
            {isChampion ? (
              <Trophy size={42} className="text-bwb-gold animate-bounce" />
            ) : isRunnerUp ? (
              <Award size={42} className="text-slate-200" />
            ) : isBronze ? (
              <Award size={42} className="text-amber-400" />
            ) : isFinalist ? (
              <Sparkles size={40} className="text-emerald-400 animate-spin" />
            ) : (
              <Trophy size={40} className="text-purple-400" />
            )}
          </div>

          {/* Badge */}
          <div className="inline-block mb-2">
            <span className={`px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider ${
              isChampion
                ? 'bg-bwb-gold text-bwb-bg shadow-lg'
                : isRunnerUp
                ? 'bg-slate-300 text-slate-900 shadow-lg'
                : isBronze
                ? 'bg-amber-500 text-amber-950 shadow-lg'
                : isFinalist
                ? 'bg-emerald-500 text-emerald-950 shadow-lg animate-pulse'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
            }`}>
              {isChampion
                ? '🏆 1ST PLACE · GRAND CHAMPION'
                : isRunnerUp
                ? '🥈 2ND PLACE · RUNNER-UP'
                : isBronze
                ? '🥉 3RD PLACE · DUAL BRONZE'
                : isFinalist
                ? '⚡ QUALIFIED FOR GRAND FINALS (ROUND 3)'
                : '🎖️ ROUND 2 COMPLETED'}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-bwb-text mt-1 mb-2">
            {myTeam.name}
          </h2>

          <p className="text-sm text-bwb-muted leading-relaxed mb-6">
            {isChampion
              ? `Outstanding innovation! Your squad secured 1st Place with an exceptional score of ${round3Score} points.`
              : isRunnerUp
              ? `Tremendous performance! You secured 2nd Place Runner-Up with ${round3Score} points.`
              : isBronze
              ? `Fantastic architecture! You earned an official 3rd Place Bronze Award with ${round3Score} points.`
              : isFinalist
              ? `Outstanding victory! You won your Round 2 Problem Duel with ${round2Score > 0 ? round2Score : 100} points and earned a ticket to the Grand Finals (Round 3)!`
              : `Your squad completed Round 2 with ${round2Score} points. While only the top Problem Track Champions advance to Round 3, you can cheer and spectate the live championship arena!`}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setDismissedKey(triggerKey)}
              className={isChampion || isFinalist ? 'bg-bwb-gold text-bwb-bg font-black' : 'bg-bwb-accent text-bwb-bg font-bold'}
            >
              {isFinalist ? 'Enter Round 3 Finals' : 'View Tournament Leaderboard'}
            </Button>

            {!isFinalist && (
              <a href="/projector" target="_blank" rel="noreferrer">
                <Button variant="secondary" size="lg">
                  <Eye size={16} className="mr-1.5" /> Spectate Arena Live
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
