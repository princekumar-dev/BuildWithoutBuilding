import type { Game, GamePhase, ParticipantSession, Problem, Submission, ScoreBreakdown, Technology } from '../types'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

function getToken(): string | null {
  return localStorage.getItem('host_token') || localStorage.getItem('judge_token')
}

async function request<T>(path: string, options?: RequestInit, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  let response: Response
  try {
    response = await fetch(`${API_BASE}/api${path}`, { headers, ...options })
  } catch {
    throw new Error('Cannot connect to backend server. Please check your network connection.')
  }

  let data: any = {}
  try {
    const text = await response.text()
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { error: `Server error (${response.status})` }
  }
  if (!response.ok) throw new Error(data.error ?? `Request failed with status ${response.status}`)
  return data
}

const CACHE_KEY = 'bwb_cached_games'

export function getCachedGames(): Game[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function setCachedGames(games: Game[]) {
  try {
    if (Array.isArray(games) && games.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(games))
    }
  } catch {}
}

export const api = {
  login: (email: string, password: string) => request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  judgeLogin: (pin: string) => request<{ token: string }>('/auth/judge/login', { method: 'POST', body: JSON.stringify({ pin }) }),
  listGames: async () => {
    try {
      const games = await request<Game[]>('/games', undefined, true)
      setCachedGames(games)
      return games
    } catch (err) {
      const cached = getCachedGames()
      if (cached.length > 0) return cached
      throw err
    }
  },
  getGame: (idOrCode: string) => request<Game>(`/games/${encodeURIComponent(idOrCode)}`),
  createGame: (name: string, scheduledStartTime?: string | null, maxTeams?: number, whatsappGroupUrl?: string | null, isRegistrationOpen?: boolean) => request<Game>('/games', { method: 'POST', body: JSON.stringify({ name, scheduledStartTime, maxTeams, whatsappGroupUrl, isRegistrationOpen }) }, true),
  deleteGame: (gameId: string) => request<{ ok: boolean }>(`/games/${gameId}`, { method: 'DELETE' }, true),
  getCatalog: () => request<{ technologies: Technology[]; problems: Problem[] }>('/catalog'),
  joinGame: (code: string, input: {
    name?: string
    teamName?: string
    teamId?: string
    passcode?: string
    members?: string[]
    email?: string
    phone?: string
    department?: string
    year?: string
    section?: string
  }) => request<{ session: ParticipantSession; game: Game }>(`/games/${encodeURIComponent(code)}/join`, { method: 'POST', body: JSON.stringify(input) }),
  setPhase: (gameId: string, phase: GamePhase, problemId?: string, durationMinutes?: number, durationSeconds?: number) => request<Game>(`/games/${gameId}/phase`, { method: 'PATCH', body: JSON.stringify({ phase, problemId, durationMinutes, durationSeconds }) }, true),
  assignCards: (gameId: string) => request<Game>(`/games/${gameId}/assign-cards`, { method: 'POST' }, true),
  selectProblem: (gameId: string, teamId: string, problemId: string) => request<Game>(`/games/${gameId}/select-problem`, { method: 'POST', body: JSON.stringify({ teamId, problemId }) }),
  revealCard: (gameId: string, teamId: string, slotIndex: number) => request<Game>(`/games/${gameId}/reveal-card`, { method: 'POST', body: JSON.stringify({ teamId, slotIndex }) }),
  submit: (gameId: string, teamId: string, submission: Submission) => request<Game>(`/games/${gameId}/submissions`, { method: 'POST', body: JSON.stringify({ teamId, submission }) }),
  score: (gameId: string, teamId: string, score: ScoreBreakdown) => request<Game>(`/games/${gameId}/scores`, { method: 'POST', body: JSON.stringify({ teamId, score }) }),
  deleteTeam: (gameId: string, teamId: string) => request<Game>(`/games/${gameId}/teams/${teamId}`, { method: 'DELETE' }, true),
  ping: (gameId: string, teamId: string) => request<{ ok: boolean }>(`/games/${gameId}/ping`, { method: 'POST', body: JSON.stringify({ teamId }) }),
  setRound: (gameId: string, round: number, phase?: GamePhase) => request<Game>(`/games/${gameId}/round`, { method: 'PATCH', body: JSON.stringify({ round, phase }) }, true),
  setFinalists: (gameId: string, teamIds: string[]) => request<Game>(`/games/${gameId}/finalists`, { method: 'POST', body: JSON.stringify({ teamIds }) }, true),
  updateSchedule: (gameId: string, scheduledStartTime: string | null) => request<Game>(`/games/${gameId}/schedule`, { method: 'PATCH', body: JSON.stringify({ scheduledStartTime }) }, true),
  updateConfig: (gameId: string, config: { maxTeams?: number; scheduledStartTime?: string | null; name?: string; whatsappGroupUrl?: string | null; isRegistrationOpen?: boolean }) => request<Game>(`/games/${gameId}/config`, { method: 'PATCH', body: JSON.stringify(config) }, true),
  toggleRegistration: (gameId: string, isRegistrationOpen: boolean) => request<Game>(`/games/${gameId}/config`, { method: 'PATCH', body: JSON.stringify({ isRegistrationOpen }) }, true),
  setCurrentPitchTeam: (gameId: string, teamId: string | null) => request<Game>(`/games/${gameId}/pitch-team`, { method: 'PATCH', body: JSON.stringify({ teamId }) }, true),
  markTeamPitched: (gameId: string, teamId: string) => request<Game>(`/games/${gameId}/mark-pitched`, { method: 'POST', body: JSON.stringify({ teamId }) }, true),
  updatePhaseTimer: (gameId: string, durationSeconds: number, phase?: GamePhase) => request<Game>(`/games/${gameId}/timer`, { method: 'PATCH', body: JSON.stringify({ durationSeconds, phase }) }, true),
  updatePitchSlide: (gameId: string, teamId: string, slideIndex: number) => request<Game>(`/games/${gameId}/slide`, { method: 'POST', body: JSON.stringify({ teamId, slideIndex }) }),
  listArchivedGames: () => request<Game[]>('/games/archived', undefined, true),
  restoreGame: (gameId: string) => request<Game>(`/games/${gameId}/restore`, { method: 'POST' }, true),
  permanentDeleteGame: (gameId: string) => request<{ ok: boolean }>(`/games/${gameId}/permanent`, { method: 'DELETE' }, true),
}


