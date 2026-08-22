import { useEffect } from 'react'
import { api } from '../lib/api'
import { useGameStore } from '../store/gameStore'

/** Keeps the currently open game synchronized across Host, Player, and Projector. */
export function useRealtimeGame() {
  const gameId = useGameStore((state) => state.game.id)
  const session = useGameStore((state) => state.session)
  const setGame = useGameStore((state) => state.setGame)

  useEffect(() => {
    let active = true

    const syncGame = async () => {
      if (!active) return
      try {
        if (gameId) {
          const updated = await api.getGame(gameId)
          if (active && updated && updated.id) {
            setGame(updated)
          }
        } else if (session?.teamId) {
          const allGames = await api.listGames()
          const matched = allGames.find((g) => g.teams.some((t) => t.id === session.teamId)) || allGames[allGames.length - 1]
          if (active && matched) {
            setGame(matched)
          }
        }
      } catch {}
    }

    // Initial instant sync
    syncGame()

    // Real-time SSE Stream
    const streamUrl = session?.teamId ? `/api/events?teamId=${encodeURIComponent(session.teamId)}` : '/api/events'
    let stream: EventSource | null = null

    try {
      stream = new EventSource(streamUrl)
      stream.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data)
          if (data.game && data.game.id && (data.game.id === gameId || !gameId)) {
            setGame(data.game)
            return
          }
        } catch {}
        syncGame()
      }
      stream.onerror = () => {
        // Fallback polling will handle updates
      }
    } catch {}

    // Polling fallback every 1500ms to guarantee zero dropped phase changes
    const pollInterval = setInterval(syncGame, 1500)

    return () => {
      active = false
      if (stream) stream.close()
      clearInterval(pollInterval)
    }
  }, [gameId, session?.teamId, setGame])
}

