import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, Play, Settings, Users, Layers, LogOut, Trash2 } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
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
    <Card padding="md" className="hover:border-bwb-accent/30 transition-colors">
      <Icon className="text-bwb-accent mb-2" size={20} />
      <p className="text-2xl font-display font-bold">{count}</p>
      <p className="text-xs text-bwb-muted">{label}</p>
    </Card>
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

  useEffect(() => { api.listGames().then(setGames).catch(() => setError('API server is unavailable. Start it with npm run server.')) }, [])

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


  const handleLogout = () => { localStorage.removeItem('host_token'); toast.info('Logged out.'); navigate('/host/login') }

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
      <PageTransition>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="accent" className="mb-2">Host</Badge>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-bwb-muted text-sm mt-1">Manage your events and games</p>
          </div>
          <div className="flex gap-2">
            <Button size="lg" onClick={() => setShowCreateModal(true)}><Plus size={18} /> Create Game</Button>
            <Button variant="ghost" size="lg" onClick={handleLogout}><LogOut size={18} /> Logout</Button>
          </div>
        </div>
      </PageTransition>

      <StaggerChildren className="grid sm:grid-cols-3 gap-4 mb-10">
        <StaggerItem><StatCard icon={Play} label="Active Games" value={activeGames} /></StaggerItem>
        <StaggerItem><StatCard icon={Users} label="Total Teams" value={totalTeams} /></StaggerItem>
        <StaggerItem><StatCard icon={Layers} label="Games" value={games.length} /></StaggerItem>
      </StaggerChildren>

      <PageTransition delay={0.25}>
        <h2 className="font-display text-lg font-semibold mb-4">Your Games</h2>
        <StaggerChildren className="space-y-3 mb-10">
          {games.map((game) => (
            <StaggerItem key={game.id}>
              <Card padding="md" className="flex flex-wrap items-center justify-between gap-4 hover:border-bwb-accent/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold">{game.name}</span>
                    <Badge variant={game.phase === 'LOBBY' ? 'default' : 'success'}>
                      {game.phase === 'LOBBY' ? 'Lobby' : 'Live'}
                    </Badge>
                  </div>
                  <p className="text-sm text-bwb-muted">
                    Code: <span className="text-bwb-accent font-mono">{game.code}</span> · {game.teams.length} teams
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/host/game/${game.id}`}>
                    <Button size="sm">{game.phase === 'LOBBY' ? 'Setup' : 'Control'}</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(game)}><Settings size={16} /></Button>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>
        {error && <p className="text-sm text-bwb-danger">{error}</p>}
      </PageTransition>

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
