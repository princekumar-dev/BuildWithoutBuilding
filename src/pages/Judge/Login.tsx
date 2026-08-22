import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { api } from '../../lib/api'

export default function JudgeLoginPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('Please enter the game code.')
      return
    }
    if (!pin.trim()) {
      toast.error('Please enter the judge PIN.')
      return
    }
    setLoading(true)
    try {
      const { token } = await api.judgeLogin(pin)
      localStorage.setItem('judge_token', token)
      navigate('/judge/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid judge PIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-bwb-purple/10 border border-bwb-purple/30 flex items-center justify-center mx-auto mb-4">
            <Scale className="text-bwb-purple" size={28} />
          </div>
          <Badge variant="purple" className="mb-3">Judge Portal</Badge>
          <h1 className="font-display text-3xl font-bold">Judge Login</h1>
          <p className="text-bwb-muted mt-2 text-sm">Access scoring and evaluation tools</p>
        </div>

        <Card glow padding="lg">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Game Code"
              placeholder="BWB-472"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Input
              label="Judge PIN"
              type="password"
              placeholder="••••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              hint="Contact the event host for the PIN"
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Authenticating...' : 'Enter'}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-sm text-bwb-muted">
          <Link to="/" className="hover:text-bwb-accent transition-colors">← Back to home</Link>
        </p>
      </div>
    </PageLayout>
  )
}
