import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Download, ExternalLink, Users } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { useGameStore } from '../../store/gameStore'
import { useRealtimeGame } from '../../hooks/useRealtimeGame'

export default function HostRoundPage() {
  useRealtimeGame()
  const { game } = useGameStore()
  const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1)

  const participants = useMemo(() => game.teams.map((team, index) => ({
    number: index + 1,
    team: team.name,
    leader: team.leaderName || team.members[0] || '—',
    members: team.members.slice(1).join(', ') || '—',
    email: team.email || '—',
    phone: team.phone || '—',
    department: team.department || '—',
    status: team.isOnline ? 'Online' : 'Offline',
  })), [game.teams])

  const downloadParticipants = () => {
    if (!participants.length) {
      toast.error('There are no participants to download yet.')
      return
    }
    const rows = [
      ['No.', 'Team', 'Team Leader', 'Other Members', 'Email', 'Phone', 'Department', 'Status'],
      ...participants.map((participant) => [
        participant.number,
        participant.team,
        participant.leader,
        participant.members,
        participant.email,
        participant.phone,
        participant.department,
        participant.status,
      ]),
    ]
    const csv = '\uFEFF' + rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `BWB_Round_${currentRound}_Participants_${game.code || 'room'}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    toast.success(`${participants.length} participants downloaded as CSV.`)
  }

  return (
    <PageLayout fullWidth>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-mono text-bwb-muted">ROOM PIN: <span className="text-bwb-accent font-bold">{game.code || '—'}</span></p>
            <h1 className="font-display text-2xl sm:text-3xl font-black">Participants</h1>
          </div>
          <Link to={`/host/game/${game.id}`}>
            <Button size="sm" variant="secondary"><ExternalLink size={14} className="mr-1.5" />Control Room</Button>
          </Link>
        </div>

        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><Users size={19} className="text-bwb-accent" />Participants <Badge variant="default">{participants.length}</Badge></h2>
              <p className="text-sm text-bwb-muted mt-1">Registered participant and team details for this room.</p>
            </div>
            <Button onClick={downloadParticipants} disabled={!participants.length} className="bg-emerald-500 hover:bg-emerald-600 text-bwb-bg font-bold"><Download size={15} className="mr-1.5" />Download CSV</Button>
          </div>

          {participants.length ? (
            <div className="overflow-x-auto rounded-xl border border-bwb-border">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-bwb-surface-2 text-bwb-muted text-xs font-mono uppercase">
                  <tr>{['#', 'Team', 'Leader', 'Members', 'Email', 'Phone', 'Department', 'Status'].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {participants.map((participant) => (
                    <tr key={`${participant.number}-${participant.team}`} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3 text-bwb-muted">{participant.number}</td>
                      <td className="px-3 py-3 font-semibold">{participant.team}</td>
                      <td className="px-3 py-3">{participant.leader}</td>
                      <td className="px-3 py-3 text-bwb-muted">{participant.members}</td>
                      <td className="px-3 py-3">{participant.email}</td>
                      <td className="px-3 py-3">{participant.phone}</td>
                      <td className="px-3 py-3">{participant.department}</td>
                      <td className={`px-3 py-3 font-medium ${participant.status === 'Online' ? 'text-bwb-success' : 'text-bwb-muted'}`}>{participant.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="rounded-xl border border-dashed border-bwb-border p-8 text-center text-bwb-muted">No participants have registered yet.</p>}
        </Card>
      </div>
    </PageLayout>
  )
}
