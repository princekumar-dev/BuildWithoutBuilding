import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { api } from '../../lib/api'

export default function HostLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Enter email and password.'); return }
    setLoading(true)
    setError('')
    try {
      const { token } = await api.login(email, password)
      localStorage.setItem('host_token', token)
      navigate('/host/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-bwb-accent/10 border border-bwb-accent/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-bwb-accent" size={28} />
          </div>
          <Badge variant="accent" className="mb-3">Host Portal</Badge>
          <h1 className="font-display text-3xl font-bold">Host Login</h1>
          <p className="text-bwb-muted mt-2 text-sm">Manage games, rounds, and event flow</p>
        </div>

        <Card glow padding="lg">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="host@event.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
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
