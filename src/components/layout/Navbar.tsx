import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, ExternalLink, Shield, Sparkles, User, Tv, HelpCircle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useGameStore } from '../../store/gameStore'
import { PHASE_LABELS } from '../../data/mockData'

import { BulbCodeLogo } from '../ui/BulbCodeLogo'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { game, session, setSession } = useGameStore()

  const isHost =
    location.pathname.startsWith('/host') &&
    location.pathname !== '/host/login' &&
    !!localStorage.getItem('host_token')
  const isJudge =
    location.pathname.startsWith('/judge') &&
    location.pathname !== '/judge/login'
  const isParticipant =
    !isHost &&
    !isJudge &&
    (!!session?.teamId ||
      ['/lobby', '/problem-select', '/card-reveal', '/game', '/pitch'].some((p) =>
        location.pathname.startsWith(p)
      ))

  const handleHostLogout = () => {
    localStorage.removeItem('host_token')
    navigate('/')
  }

  const handleJudgeLogout = () => {
    localStorage.removeItem('judge_token')
    navigate('/')
  }

  const handleParticipantLeave = () => {
    setSession(null as any)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-bwb-border/60 bg-bwb-bg/90 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* BRAND / LOGO SECTION */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <BulbCodeLogo size={28} className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform" />
            <div className="flex items-center">
              <span className="font-display font-black text-xs sm:text-base tracking-tight text-bwb-text">
                BUILD WITHOUT
              </span>
              <span className="font-display font-black text-xs sm:text-base tracking-tight text-bwb-accent ml-1">
                BUILDING
              </span>
            </div>
          </Link>

          {/* Role Badges */}
          {isHost && (
            <span className="hidden sm:flex px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 items-center gap-1 shrink-0">
              <Shield size={11} /> HOST OPS
            </span>
          )}
          {isJudge && (
            <span className="hidden sm:flex px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 items-center gap-1 shrink-0">
              <Sparkles size={11} /> JUDGE PANEL
            </span>
          )}
          {isParticipant && game.code && (
            <Badge variant="accent" className="font-mono text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 shrink-0">
              {game.code}
            </Badge>
          )}
        </div>


        {/* HOST NAVIGATION */}
        {isHost && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/host/dashboard"
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                location.pathname === '/host/dashboard'
                  ? 'text-bwb-accent bg-bwb-accent/10 border border-bwb-accent/30'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
              }`}
            >
              Dashboard
            </Link>

            {game.id && (
              <Link
                to={`/host/game/${game.id}`}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  location.pathname.startsWith('/host/game')
                    ? 'text-bwb-accent bg-bwb-accent/10 border border-bwb-accent/30'
                    : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
                }`}
              >
                Control Room
              </Link>
            )}

            <Link
              to="/host/round"
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                location.pathname === '/host/round'
                  ? 'text-bwb-accent bg-bwb-accent/10 border border-bwb-accent/30'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
              }`}
            >
              Participants
            </Link>

            <Link
              to="/host/leaderboard"
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                location.pathname === '/host/leaderboard'
                  ? 'text-bwb-accent bg-bwb-accent/10 border border-bwb-accent/30'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
              }`}
            >
              Leaderboard
            </Link>

            <Link
              to="/projector"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-bwb-muted hover:text-bwb-accent hover:bg-bwb-surface-2 flex items-center gap-1 transition-all"
            >
              <Tv size={13} /> Projector
              <ExternalLink size={11} className="opacity-60" />
            </Link>
          </div>
        )}

        {/* JUDGE NAVIGATION */}
        {isJudge && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/judge/dashboard"
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                location.pathname === '/judge/dashboard'
                  ? 'text-bwb-accent bg-bwb-accent/10 border border-bwb-accent/30'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
              }`}
            >
              Scoring Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2 transition-all"
            >
              Standings
            </Link>
          </div>
        )}

        {/* PARTICIPANT IN-GAME STATUS */}
        {isParticipant && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-bwb-surface-2 border border-white/5 text-xs">
              <User size={13} className="text-bwb-accent" />
              <span className="text-bwb-muted">Team:</span>
              <span className="text-bwb-text font-bold">{session?.teamName ?? 'Participant'}</span>
            </div>

            {game.phase && (
              <span className="text-xs font-semibold text-bwb-muted bg-bwb-bg px-2.5 py-1 rounded-lg border border-bwb-border">
                {PHASE_LABELS[game.phase] ?? game.phase}
              </span>
            )}
          </div>
        )}

        {/* PUBLIC NAVIGATION */}
        {!isHost && !isJudge && !isParticipant && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/how-to-play"
              className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                location.pathname === '/how-to-play'
                  ? 'text-bwb-accent bg-bwb-accent/10 font-semibold'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
              }`}
            >
              How to Play
            </Link>
            <Link
              to="/join"
              className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                location.pathname === '/join'
                  ? 'text-bwb-accent bg-bwb-accent/10 font-semibold'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2'
              }`}
            >
              Join Game
            </Link>
            <Link
              to="/host/login"
              className="px-3 py-1.5 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2 transition-colors"
            >
              Host
            </Link>
            <Link
              to="/judge/login"
              className="px-3 py-1.5 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2 transition-colors"
            >
              Judge
            </Link>
          </div>
        )}

        {/* RIGHT SIDE ACTIONS */}
        <div className="hidden md:flex items-center gap-2">
          {isHost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHostLogout}
              className="text-bwb-muted hover:text-bwb-danger hover:bg-bwb-danger/10"
            >
              <LogOut size={14} className="mr-1" /> Exit Host
            </Button>
          )}

          {isJudge && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleJudgeLogout}
              className="text-bwb-muted hover:text-bwb-text"
            >
              <ArrowLeft size={14} className="mr-1" /> Exit Judge
            </Button>
          )}

          {isParticipant && (
            <div className="flex items-center gap-2">
              <Link to="/how-to-play" target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" className="text-bwb-muted hover:text-bwb-text">
                  <HelpCircle size={14} className="mr-1" /> Rules
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleParticipantLeave}
                className="text-bwb-muted hover:text-bwb-danger hover:bg-bwb-danger/10 text-xs"
              >
                <LogOut size={13} className="mr-1" /> Leave
              </Button>
            </div>
          )}

          {!isHost && !isJudge && !isParticipant && location.pathname !== '/join' && (
            <Link to="/join">
              <Button size="sm" className="shadow-lg shadow-bwb-accent/15">
                Join Event
              </Button>
            </Link>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          type="button"
          className="md:hidden p-2 rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden border-t border-bwb-border bg-bwb-surface/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {isHost ? (
            <>
              <Link
                to="/host/dashboard"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Host Dashboard
              </Link>
              {game.id && (
                <Link
                  to={`/host/game/${game.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
                >
                  Control Room ({game.name || 'Active Game'})
                </Link>
              )}
              <Link
                to="/host/round"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Participants
              </Link>
              <Link
                to="/host/leaderboard"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Leaderboard
              </Link>
              <Link
                to="/projector"
                target="_blank"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-accent hover:bg-bwb-surface-2"
              >
                📺 Open Projector Screen
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  handleHostLogout()
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-xl text-bwb-danger hover:bg-bwb-danger/10"
              >
                Exit Host Mode
              </button>
            </>
          ) : isJudge ? (
            <>
              <Link
                to="/judge/dashboard"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Scoring Dashboard
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Leaderboard
              </Link>
            </>
          ) : isParticipant ? (
            <>
              <div className="px-3 py-2 text-xs text-bwb-muted">
                Signed in as: <strong className="text-bwb-accent">{session?.teamName}</strong>
              </div>
              <Link
                to="/how-to-play"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Rules & How to Play
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  handleParticipantLeave()
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-xl text-bwb-danger hover:bg-bwb-danger/10"
              >
                Leave Game
              </button>
            </>
          ) : (
            <>
              <Link
                to="/how-to-play"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                How to Play
              </Link>
              <Link
                to="/join"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Join Game
              </Link>
              <Link
                to="/host/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Host Portal
              </Link>
              <Link
                to="/judge/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-bwb-surface-2"
              >
                Judge Portal
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
