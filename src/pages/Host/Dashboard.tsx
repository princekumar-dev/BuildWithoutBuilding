import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, Play, Users, Layers, LogOut, Trash2, Copy, CheckCircle2, Sliders, Tv, Clock } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import { PageTransition, StaggerChildren, StaggerItem } from '../../components/ui/PageTransition'
import { useCountUp } from '../../hooks/useCountUp'
import { api } from '../../lib/api'
import type { Game } from '../../types'

function StatCard({ icon: Icon, label, value }: { icon: typeof Play; label: string; value: number }) {
  const count = useCountUp(value)
  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-bwb-surface border border-white/10 hover:border-bwb-accent/30 transition-all flex flex-col justify-between shadow-md">
      <div className="flex items-center justify-between mb-1.5">
        <Icon className="text-bwb-accent" size={18} />
        <span className="text-[9px] sm:text-[10px] font-mono text-bwb-muted uppercase tracking-wider font-bold">
          Live
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-display font-black text-bwb-text">{count}</p>
      <p className="text-[10px] sm:text-xs text-bwb-muted font-mono mt-0.5 truncate">{label}</p>
    </div>
  )
}

export default function HostDashboardPage() {
  const navigate = useNavigate()
  const [games, setGames] = useState<Game[]>([])
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGameName, setNewGameName] = useState('')
  const [newGameSchedule, setNewGameSchedule] = useState('')
  const [newGameMaxTeams, setNewGameMaxTeams] = useState<number>(32)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)

  useEffect(() => {
    api.listGames().then(setGames).catch(() => setError('API server is unavailable. Start it with npm run server.'))
  }, [])

  const createGame = async () => {
    if (!newGameName.trim()) { toast.warning('Enter a game name.'); return }
    setCreating(true)
    try {
      const scheduleIso = newGameSchedule ? new Date(newGameSchedule).toISOString() : null
      const game = await api.createGame(newGameName.trim(), scheduleIso, Number(newGameMaxTeams) || 32)
      toast.success(`Game "${game.name}" created with max ${game.maxTeams || 32} teams!`)
      setShowCreateModal(false)
      setNewGameName('')
      setNewGameSchedule('')
      setNewGameMaxTeams(32)
      navigate(`/host/game/${game.id}`)
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to create game.')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('host_token')
    toast.info('Logged out.')
    navigate('/host/login')
  }

  const copyGameCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    toast.success(`PIN "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const deleteGame = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.deleteGame(deleteTarget.id)
      setGames((prev) => prev.filter((g) => g.id !== deleteTarget.id))
      toast.success(`Game "${deleteTarget.name}" deleted.`)
      setDeleteTarget(null)
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to delete game.')
    } finally {
      setDeleting(false)
    }
  }

  const activeGames = games.filter((g) => g.phase !== 'RESULTS').length
  const totalTeams = games.reduce((total, g) => total + g.teams.length, 0)

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-28 sm:pb-12">
        <PageTransition>
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="accent">Tournament Host</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Server
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-black text-gradient">
                Host Arena Dashboard
              </h1>
              <p className="text-bwb-muted text-xs sm:text-sm mt-0.5">
                Manage your championship games, participant rosters & live controls
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="md"
                onClick={() => setShowCreateModal(true)}
                className="glow-accent shadow-md justify-center font-bold text-xs sm:text-sm"
              >
                <Plus size={16} className="mr-1" /> Create Game
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleLogout}
                className="justify-center border-white/10 text-xs sm:text-sm"
              >
                <LogOut size={15} className="mr-1 text-bwb-muted" /> Logout
              </Button>
            </div>
          </div>
        </PageTransition>

        {/* Stats Grid */}
        <StaggerChildren className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          <StaggerItem><StatCard icon={Play} label="Active Rooms" value={activeGames} /></StaggerItem>
          <StaggerItem><StatCard icon={Users} label="Total Teams" value={totalTeams} /></StaggerItem>
          <StaggerItem><StatCard icon={Layers} label="Total Events" value={games.length} /></StaggerItem>
        </StaggerChildren>

        {/* Your Games Section */}
        <PageTransition delay={0.2}>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-display text-base sm:text-lg font-bold text-bwb-text flex items-center gap-2">
              <Layers size={18} className="text-bwb-accent" />
              <span>Your Tournament Games ({games.length})</span>
            </h2>
            <span className="text-[11px] font-mono text-bwb-muted">
              Auto-saved locally
            </span>
          </div>

          {games.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-bwb-surface border border-dashed border-white/10 text-center space-y-4 shadow-inner">
              <div className="w-14 h-14 rounded-2xl bg-bwb-accent/10 border border-bwb-accent/20 flex items-center justify-center mx-auto text-bwb-accent">
                <Play size={28} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-bwb-text">No Tournament Games Found</h3>
                <p className="text-xs text-bwb-muted mt-1 max-w-md mx-auto">
                  Create your first tournament room to generate a PIN code for participants and start hosting!
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="glow-accent mx-auto font-bold text-xs">
                <Plus size={15} className="mr-1" /> Create Your First Game
              </Button>
            </div>
          ) : (
            <StaggerChildren className="space-y-3.5">
              {games.map((game) => {
                const isLobby = game.phase === 'LOBBY'
                const roundNum = game.currentRound || 1
                const maxQuota = game.maxTeams || 32
                const isFull = game.teams.length >= maxQuota
                const isCopied = copiedCodeId === game.id

                return (
                  <StaggerItem key={game.id}>
                    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-bwb-surface via-bwb-surface-2/95 to-bwb-surface border border-white/10 hover:border-bwb-accent/40 transition-all shadow-lg flex flex-col justify-between gap-4">
                      {/* Top Header: Title & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-display font-black text-base sm:text-lg text-bwb-text truncate">
                            {game.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Round {roundNum}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                            isLobby
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {game.phase ? game.phase.replace('_', ' ') : 'LOBBY'}
                          </span>
                        </div>
                      </div>

                      {/* Info & Meta Pill Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs font-mono">
                        {/* PIN Code Pill with Tap-To-Copy */}
                        <button
                          type="button"
                          onClick={() => copyGameCode(game.code, game.id)}
                          className="px-2.5 py-1 rounded-xl bg-bwb-bg border border-white/10 hover:border-bwb-accent/40 text-bwb-text flex items-center gap-1.5 transition-all text-xs font-bold active:scale-95"
                          title="Click to copy PIN"
                        >
                          <span className="text-bwb-muted font-normal text-[10px]">PIN:</span>
                          <span className="text-bwb-accent font-black tracking-wider">{game.code}</span>
                          {isCopied ? <CheckCircle2 size={12} className="text-emerald-400 ml-0.5" /> : <Copy size={12} className="text-bwb-muted ml-0.5" />}
                        </button>

                        {/* Teams Count Pill */}
                        <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs ${
                          isFull
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold'
                            : 'bg-bwb-bg/60 text-bwb-text border-white/5'
                        }`}>
                          <Users size={12} className={isFull ? 'text-amber-400' : 'text-bwb-accent'} />
                          <span>
                            <strong>{game.teams.length}</strong>/{maxQuota} Squads
                          </span>
                        </div>

                        {/* Scheduled time if present */}
                        {game.scheduledStartTime && (
                          <div className="px-2.5 py-1 rounded-xl bg-bwb-bg/60 border border-white/5 text-bwb-muted flex items-center gap-1.5 text-[11px]">
                            <Clock size={11} className="text-amber-400" />
                            <span>{new Date(game.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Bar (Mobile-first grid & flex) */}
                      <div className="grid grid-cols-1 sm:flex sm:items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-2 sm:flex items-center gap-2">
                          <Link to={`/host/game/${game.id}`} className="w-full sm:w-auto">
                            <Button
                              size="sm"
                              className="w-full sm:w-auto glow-accent shadow-sm font-bold text-xs justify-center"
                            >
                              <Sliders size={13} className="mr-1.5" />
                              {isLobby ? 'Control Room' : 'Live Game Control'}
                            </Button>
                          </Link>

                          <Link to="/projector" className="w-full sm:w-auto">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full sm:w-auto border-white/10 hover:border-white/20 text-xs justify-center"
                            >
                              <Tv size={13} className="mr-1.5 text-purple-400" />
                              Projector
                            </Button>
                          </Link>
                        </div>

                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(game)}
                            className="text-bwb-muted hover:text-red-400 hover:bg-red-500/10 text-xs px-2.5 py-1.5"
                            title="Delete tournament game"
                          >
                            <Trash2 size={14} className="mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerChildren>
          )}

          {error && <p className="text-sm text-bwb-danger mt-4">{error}</p>}
        </PageTransition>
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Game">
        <div className="space-y-4">
          <Input
            label="Game Name *"
            placeholder="e.g. Hackathon Finals 2026"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createGame() }}
          />

          <div>
            <label className="text-xs font-mono uppercase text-bwb-muted font-bold block mb-1.5">
              Scheduled Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={newGameSchedule}
              onChange={(e) => setNewGameSchedule(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-sm font-mono focus:border-bwb-accent outline-none"
            />
            <p className="text-[11px] text-bwb-muted mt-1">
              Teams entering with Passcodes will see a live countdown clock until this time!
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase text-bwb-muted font-bold">
                Max Team Capacity Limit *
              </label>
              <span className="text-xs font-mono font-bold text-bwb-accent bg-bwb-accent/15 px-2 py-0.5 rounded-full border border-bwb-accent/30">
                {newGameMaxTeams} Teams Max
              </span>
            </div>
            
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {[8, 16, 24, 32, 48, 64].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNewGameMaxTeams(count)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    newGameMaxTeams === count
                      ? 'bg-bwb-accent text-bwb-bg border-bwb-accent shadow-sm scale-[1.02]'
                      : 'bg-bwb-surface border-white/10 text-bwb-muted hover:text-bwb-text hover:border-white/20'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            <input
              type="number"
              min={2}
              max={128}
              value={newGameMaxTeams}
              onChange={(e) => setNewGameMaxTeams(Math.max(2, Math.min(128, Number(e.target.value) || 32)))}
              className="w-full px-3.5 py-2 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-mono focus:border-bwb-accent outline-none"
              placeholder="Or enter custom team count (e.g. 20)"
            />
            <p className="text-[11px] text-bwb-muted mt-1">
              Once reached, registration closes and newly arriving teams see a friendly apology card.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={createGame} disabled={creating}>
              {creating ? 'Creating...' : 'Create Game'}
            </Button>
          </div>

        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Game">
        <div className="space-y-4">
          <p className="text-sm text-bwb-muted">
            Are you sure you want to delete <span className="text-bwb-text font-semibold">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={deleteGame} disabled={deleting}>
              <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete Game'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
