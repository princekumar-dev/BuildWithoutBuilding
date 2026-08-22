import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import LandingPage from './pages/Landing'
import HowToPlayPage from './pages/HowToPlay'
import JoinPage from './pages/Join'
import LobbyPage from './pages/Lobby'
import ProblemSelectPage from './pages/ProblemSelect'
import CardRevealPage from './pages/CardReveal'
import GamePage from './pages/Game'
import PitchPage from './pages/Pitch'
import JudgingPage from './pages/Judging'
import LeaderboardPage from './pages/Leaderboard'
import ProjectorPage from './pages/Projector'


import HostLoginPage from './pages/Host/Login'
import HostDashboardPage from './pages/Host/Dashboard'
import HostGameControlPage from './pages/Host/GameControl'
import HostRoundPage from './pages/Host/Round'
import HostLeaderboardPage from './pages/Host/Leaderboard'

import JudgeLoginPage from './pages/Judge/Login'
import JudgeDashboardPage from './pages/Judge/Dashboard'
import JudgeScorePage from './pages/Judge/Score'
import { useRealtimeGame } from './hooks/useRealtimeGame'
import { usePhaseNavigation } from './hooks/usePhaseNavigation'
import { ToastContainer } from './components/ui/Toast'
import { PhaseTransitionOverlay } from './components/ui/PhaseTransitionOverlay'
import { TournamentAlertModal } from './components/ui/TournamentAlertModal'
import { SoundToggle } from './components/ui/SoundToggle'

function ProtectedHost({ children }: { children: React.ReactNode }) {
  if (!localStorage.getItem('host_token')) return <Navigate to="/host/login" replace />
  return <>{children}</>
}

function GlobalGamifiedSync() {
  usePhaseNavigation()
  const location = useLocation()
  const path = location.pathname
  const isPublicPage = path === '/' || path === '/join' || path === '/how-to-play' || path === '/host/login' || path === '/judge/login'

  if (isPublicPage) return null

  return (
    <>
      <PhaseTransitionOverlay />
      <TournamentAlertModal />
      <SoundToggle />
    </>
  )
}

export default function App() {
  useRealtimeGame()
  return (
    <BrowserRouter>
      <ToastContainer />
      <GlobalGamifiedSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/problem-select" element={<ProblemSelectPage />} />
        <Route path="/card-reveal" element={<CardRevealPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/pitch" element={<PitchPage />} />
        <Route path="/judging" element={<JudgingPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        <Route path="/projector" element={<ProjectorPage />} />

        <Route path="/host/login" element={<HostLoginPage />} />
        <Route path="/host/dashboard" element={<ProtectedHost><HostDashboardPage /></ProtectedHost>} />
        <Route path="/host/game/:gameId" element={<ProtectedHost><HostGameControlPage /></ProtectedHost>} />
        <Route path="/host/round" element={<ProtectedHost><HostRoundPage /></ProtectedHost>} />
        <Route path="/host/leaderboard" element={<ProtectedHost><HostLeaderboardPage /></ProtectedHost>} />

        <Route path="/judge/login" element={<JudgeLoginPage />} />
        <Route path="/judge/dashboard" element={<JudgeDashboardPage />} />
        <Route path="/judge/score/:teamId" element={<JudgeScorePage />} />
      </Routes>
    </BrowserRouter>
  )
}

