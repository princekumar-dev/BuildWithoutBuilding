import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Game, GamePhase, ParticipantSession, Problem, Submission } from '../types'

const EMPTY_GAME: Game = { id: '', code: '', name: '', phase: 'LOBBY', currentRound: 1, teams: [], buildDurationMinutes: 15, isFinalRound: false }

interface GameStore {
  game: Game
  session: ParticipantSession | null
  submission: Submission | null
  selectedProblem: Problem | null
  setGame: (game: Game) => void
  demoPhase: GamePhase
  setDemoPhase: (phase: GamePhase) => void
  setSession: (session: ParticipantSession | null) => void
  setSubmission: (submission: Submission | null) => void
  setSelectedProblem: (problem: Problem | null) => void
  getMyTeam: () => Game['teams'][number] | undefined
  clearSession: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: EMPTY_GAME,
      session: null,
      submission: null,
      selectedProblem: null,
      setGame: (game) => {
        if (!game || !game.id) return
        const current = get().game
        if (
          current.id === game.id &&
          current.phase === game.phase &&
          current.currentRound === game.currentRound &&
          current.currentPitchTeamId === game.currentPitchTeamId &&
          current.currentSlideIndex === game.currentSlideIndex &&
          current.phaseExpiresAt === game.phaseExpiresAt &&
          current.pitchExpiresAt === game.pitchExpiresAt &&
          current.isRegistrationOpen === game.isRegistrationOpen &&
          current.teams?.length === game.teams?.length &&
          current.teams?.every((t, i) => {
            const gt = game.teams[i]
            return (
              gt &&
              t.id === gt.id &&
              t.score === gt.score &&
              t.rank === gt.rank &&
              t.isOnline === gt.isOnline &&
              t.selectedProblemId === gt.selectedProblemId &&
              t.currentSlideIndex === gt.currentSlideIndex &&
              t.submission?.submittedAt === gt.submission?.submittedAt
            )
          })
        ) {
          return
        }
        set({ game, demoPhase: game.phase })
      },
      demoPhase: 'LOBBY',
      setDemoPhase: (phase) => set((state) => ({ demoPhase: phase, game: { ...state.game, phase } })),
      setSession: (session) => set({ session }),
      setSubmission: (submission) => set({ submission }),
      setSelectedProblem: (problem) => set({ selectedProblem: problem }),
      getMyTeam: () => {
        const { game, session } = get()
        if (!session) return undefined
        return game.teams.find((t) => t.id === session.teamId)
      },
      clearSession: () => set({ session: null, submission: null, selectedProblem: null }),
    }),
    {
      name: 'bwb_game_storage',
      partialize: (state) => ({
        session: state.session,
        submission: state.submission,
        game: state.game,
      }),
    }
  )
)

