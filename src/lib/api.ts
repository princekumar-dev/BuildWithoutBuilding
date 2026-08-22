import type { Game, GamePhase, ParticipantSession, Problem, Submission, ScoreBreakdown, Technology } from '../types'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

function getToken(): string | null { return localStorage.getItem('host_token') }

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

export const api = {
  login: (email: string, password: string) => request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  listGames: () => request<Game[]>('/games', undefined, true),
  getGame: (idOrCode: string) => request<Game>(`/games/${encodeURIComponent(idOrCode)}`),
  createGame: (name: string, scheduledStartTime?: string | null, maxTeams?: number) => request<Game>('/games', { method: 'POST', body: JSON.stringify({ name, scheduledStartTime, maxTeams }) }, true),
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
  setPhase: (gameId: string, phase: GamePhase, problemId?: string) => request<Game>(`/games/${gameId}/phase`, { method: 'PATCH', body: JSON.stringify({ phase, problemId }) }, true),
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
  updateConfig: (gameId: string, config: { maxTeams?: number; scheduledStartTime?: string | null; name?: string }) => request<Game>(`/games/${gameId}/config`, { method: 'PATCH', body: JSON.stringify(config) }, true),
}


