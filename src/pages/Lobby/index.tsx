import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckCircle2, Mic } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Badge } from '../../components/ui/Badge'
import { PhaseIndicator } from '../../components/ui/PhaseIndicator'
import { useGameStore } from '../../store/gameStore'
import { usePhaseNavigation } from '../../hooks/usePhaseNavigation'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'
import { api } from '../../lib/api'
import { CactusWaitingCard } from '../../components/ui/CactusWaitingCard'

export default function LobbyPage() {
  usePhaseNavigation()
  useRealtimeGame()
  const { game, session } = useGameStore()

  // Presence Heartbeat
  useEffect(() => {
    if (!game?.id || !session?.teamId) return
    api.ping(game.id, session.teamId).catch(() => {})
    const interval = setInterval(() => {
      api.ping(game.id, session.teamId).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [game?.id, session?.teamId])

  const myTeam = game.teams.find((t) => t.id === session?.teamId)
  const currentPasscode = myTeam?.passcode || session?.passcode || myTeam?.id
  const lobbyTeams = game.currentRound === 3 && (game.finalistTeamIds?.length ?? 0) > 0
    ? game.teams.filter((team) => game.finalistTeamIds?.includes(team.id))
    : game.teams

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-1 sm:px-4">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="accent" className="mb-2">{game.code}</Badge>
            <h1 className="font-display text-3xl font-bold">{game.name}</h1>
            <p className="text-bwb-muted text-sm mt-1">
              {session?.teamName ?? 'Your Team'} · {session?.name ?? 'Participant'}
            </p>
          </div>
          <PhaseIndicator phase={game.phase} />
        </div>

        {/* CUTE CACTUS WAITING & COUNTDOWN CARD WITH WHATSAPP COMMUNITY */}
        <CactusWaitingCard
          scheduledStartTime={game.scheduledStartTime}
          currentPasscode={currentPasscode}
          myTeam={myTeam}
          gameName={game.name}
          gameCode={game.code}
          whatsappGroupUrl={game.whatsappGroupUrl}
        />

        {/* PITCH CALL ALERT */}
        <AnimatePresence>
          {game.currentPitchTeamId && game.currentPitchTeamId === session?.teamId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="mb-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-bwb-accent/15 to-bwb-surface border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-400/5 animate-pulse" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4">
                  <Mic size={32} className="text-amber-400 animate-bounce" />
                </div>
                <Badge variant="accent" className="mb-3 text-sm">YOU&apos;RE UP!</Badge>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-bwb-text mb-2">
                  Time to Pitch!
                </h2>
                <p className="text-sm text-bwb-muted max-w-md mx-auto">
                  You&apos;ve been called to the stage. Head to the presentation area now!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-bwb-muted flex items-center gap-2">
            <Users size={16} /> Teams in Lobby
          </h3>
          {lobbyTeams.length === 0 ? (
            <p className="text-center text-bwb-muted text-sm py-8">No teams have joined yet. You&apos;re first!</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {lobbyTeams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl glass-card ${
                    team.id === session?.teamId ? 'border-bwb-accent/40 ring-1 ring-bwb-accent/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-bwb-success shrink-0" />
                    <div>
                      <span className="text-sm font-semibold">{team.name}</span>
                      {team.id === session?.teamId && (
                        <span className="ml-2 text-[10px] text-bwb-accent uppercase font-bold">You</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-bwb-muted">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  )
}
