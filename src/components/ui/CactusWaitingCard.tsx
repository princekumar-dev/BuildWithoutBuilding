import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Copy, CheckCircle2, UserCheck, Sparkles,
  ShieldCheck, Layers, Crown
} from 'lucide-react'
import { Button } from './Button'
import { toast } from './Toast'
import type { Team } from '../../types'

interface CactusWaitingCardProps {
  scheduledStartTime?: string | null
  currentPasscode?: string
  myTeam?: Team
  gameName: string
  gameCode: string
}

const FUN_QUOTES = [
  '🌵 Hope to see you! Stay hydrated and get your strategy ready!',
  '⚡ Your spot is 100% reserved in the arena! Get ready to build without building!',
  '🃏 3 surprise technologies will drop the moment host starts Round 1!',
  '👑 Teamwork wins tournaments. Review your roles with your squad!',
  '🚀 Ready to pitch your masterpiece? The judges are waiting!',
]

export function CactusWaitingCard({
  scheduledStartTime,
  currentPasscode,
  myTeam,
  gameName,
  gameCode,
}: CactusWaitingCardProps) {
  const [copied, setCopied] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [isWiggling, setIsWiggling] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const [activeTab, setActiveTab] = useState<'passcode' | 'playbook' | 'checklist'>('passcode')

  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isPast: boolean
    hasSchedule: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    hasSchedule: false,
  })

  useEffect(() => {
    if (!scheduledStartTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, hasSchedule: false })
      return
    }

    const calculateTime = () => {
      const target = new Date(scheduledStartTime).getTime()
      const now = Date.now()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, hasSchedule: true })
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / 1000 / 60) % 60)
        const seconds = Math.floor((diff / 1000) % 60)
        setTimeLeft({ days, hours, minutes, seconds, isPast: false, hasSchedule: true })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [scheduledStartTime])

  const handleCactusClick = (e: React.MouseEvent) => {
    setIsWiggling(true)
    setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length)
    setTimeout(() => setIsWiggling(false), 800)

    // Spawn cute heart particle
    const rect = e.currentTarget.getBoundingClientRect()
    const newHeart = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    setHearts((prev) => [...prev, newHeart])
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id))
    }, 1200)
  }

  const copyPasscode = () => {
    if (currentPasscode) {
      navigator.clipboard.writeText(currentPasscode)
      setCopied(true)
      toast.success(`Team Passcode "${currentPasscode}" copied to clipboard!`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl p-4 sm:p-9 text-center mb-8 border border-white/15 shadow-2xl overflow-hidden bg-gradient-to-b from-bwb-surface-2/95 via-bwb-surface/95 to-bwb-bg/95 backdrop-blur-2xl"
    >

      {/* Dynamic Ambient Neon Mesh Glows */}
      <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-teal-500/10 blur-[80px] pointer-events-none" />

      {/* Top Status Radar Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            Live Room Connection Active
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-bwb-muted">
          <span>Room:</span>
          <span className="px-2 py-0.5 rounded-lg bg-bwb-surface border border-white/10 font-bold text-bwb-accent">
            {gameCode}
          </span>
        </div>
      </div>

      {/* CUTE ANIMATED 3D-STYLE CACTUS MASCOT */}
      <div className="relative inline-block my-2">
        {/* Heart Particles */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.6, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, y: -45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-pink-400 pointer-events-none z-30 font-bold text-sm"
              style={{ left: h.x, top: h.y }}
            >
              💖✨
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          onClick={handleCactusClick}
          title="Click the Cactus for happy vibes!"
          animate={
            isWiggling
              ? { scale: [1, 1.25, 0.95, 1.15, 1], rotate: [0, -12, 12, -8, 8, 0] }
              : { y: [0, -8, 0], rotate: [-2, 2, -2] }
          }
          transition={{
            duration: isWiggling ? 0.7 : 3.5,
            repeat: isWiggling ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          className="relative inline-flex flex-col items-center cursor-pointer group select-none"
        >
          {/* Subtle Pedestal Aura */}
          <div className="absolute bottom-2 w-28 h-6 bg-emerald-500/20 rounded-full blur-md group-hover:bg-emerald-400/35 transition-all" />

          {/* Stylized Kawaii SVG Cactus */}
          <div className="w-28 h-32 relative flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <defs>
                <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="cactusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6EE7B7" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Pot Base with 3D bevel */}
              <path d="M28 88 L34 116 Q50 119 66 116 L72 88 Z" fill="url(#potGrad)" />
              <path d="M24 84 Q50 81 76 84 L74 89 Q50 86 26 89 Z" fill="#F59E0B" />
              <ellipse cx="50" cy="85" rx="24" ry="3" fill="#B45309" opacity="0.6" />

              {/* Main Cactus Body */}
              <path
                d="M38 28 Q38 12 50 12 Q62 12 62 28 L62 86 Q50 89 38 86 Z"
                fill="url(#cactusGrad)"
              />
              {/* Highlight Ridge */}
              <path d="M48 14 Q52 14 52 87 L48 87 Z" fill="#A7F3D0" opacity="0.4" />

              {/* Left Cute Arm */}
              <path
                d="M38 48 Q20 48 20 32 Q20 25 26 25 Q32 25 32 32 L32 54 Q32 60 38 60 Z"
                fill="url(#armGrad)"
              />

              {/* Right Waving Arm */}
              <motion.path
                animate={{ rotate: [-8, 14, -8] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{ transformOrigin: '62px 58px' }}
                d="M62 44 Q80 44 80 28 Q80 21 74 21 Q68 21 68 28 L68 50 Q68 56 62 56 Z"
                fill="url(#armGrad)"
              />

              {/* Top Flower with Bloom Glow */}
              <circle cx="50" cy="12" r="6" fill="#F43F5E" />
              <circle cx="45" cy="10" r="4" fill="#FB7185" />
              <circle cx="55" cy="10" r="4" fill="#FB7185" />
              <circle cx="50" cy="7" r="4" fill="#FDA4AF" />
              <circle cx="50" cy="12" r="2.5" fill="#FEF08A" />

              {/* Cute Sparkly Eyes */}
              <circle cx="45" cy="36" r="3" fill="#064E3B" />
              <circle cx="55" cy="36" r="3" fill="#064E3B" />
              <circle cx="44" cy="35" r="1.2" fill="#FFFFFF" />
              <circle cx="54" cy="35" r="1.2" fill="#FFFFFF" />
              <circle cx="46.5" cy="37.5" r="0.5" fill="#FFFFFF" />
              <circle cx="56.5" cy="37.5" r="0.5" fill="#FFFFFF" />

              {/* Blushing Cheeks */}
              <ellipse cx="41" cy="42" rx="3" ry="1.8" fill="#FB7185" opacity="0.75" />
              <ellipse cx="59" cy="42" rx="3" ry="1.8" fill="#FB7185" opacity="0.75" />

              {/* Kawaii Open Smile */}
              <path
                d="M47 41 Q50 46 53 41"
                stroke="#064E3B"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Needles & Spines */}
              <circle cx="36" cy="70" r="0.9" fill="#D1FAE5" />
              <circle cx="64" cy="70" r="0.9" fill="#D1FAE5" />
              <circle cx="50" cy="62" r="0.9" fill="#D1FAE5" />
              <circle cx="26" cy="38" r="0.9" fill="#D1FAE5" />
              <circle cx="74" cy="36" r="0.9" fill="#D1FAE5" />
            </svg>
          </div>

          {/* Click Me Badge */}
          <span className="text-[10px] font-mono text-emerald-400/80 group-hover:text-emerald-300 transition-colors mt-0.5">
            ✨ Click me for tips!
          </span>
        </motion.div>

        {/* Dynamic Cute Speech Bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="mt-2.5 max-w-sm mx-auto px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-xs font-semibold shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2"
          >
            <span>{FUN_QUOTES[quoteIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Title & Description */}
      <h2 className="font-display text-2xl sm:text-4xl font-black mb-2 text-bwb-text tracking-tight mt-1 sm:mt-2">
        The Event Has Not Started Yet
      </h2>
      <p className="text-bwb-muted text-xs sm:text-sm mb-5 sm:mb-6 max-w-xl mx-auto leading-relaxed">
        Your squad is securely registered and connected! When the host launches the tournament, this room will instantly and automatically begin for your entire team.
      </p>

      {/* COUNTDOWN TIMER / STANDBY BOX */}
      {timeLeft.hasSchedule && !timeLeft.isPast ? (
        <div className="w-full max-w-xl mx-auto mb-6 p-3.5 sm:p-5 rounded-2xl bg-bwb-bg/90 border border-bwb-accent/30 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-bwb-accent/5 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-3 text-xs font-mono font-bold text-bwb-accent uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="animate-spin text-bwb-accent" />
              <span>Tournament Starts In</span>
            </div>
            {scheduledStartTime && (
              <span className="text-[11px] text-bwb-muted font-normal">
                {new Date(scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 text-center font-mono">
            <div className="p-2 sm:p-3 rounded-xl bg-bwb-surface border border-white/5 shadow-md">
              <span className="block text-xl sm:text-3xl font-black text-bwb-text">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-bwb-muted uppercase font-bold tracking-widest">Days</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-bwb-surface border border-white/5 shadow-md">
              <span className="block text-xl sm:text-3xl font-black text-bwb-text">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-bwb-muted uppercase font-bold tracking-widest">Hours</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-bwb-surface border border-white/5 shadow-md">
              <span className="block text-xl sm:text-3xl font-black text-bwb-text">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-bwb-muted uppercase font-bold tracking-widest">Mins</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-bwb-surface border border-bwb-accent/30 shadow-md">
              <span className="block text-xl sm:text-3xl font-black text-bwb-accent">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-bwb-accent uppercase font-bold tracking-widest">Secs</span>
            </div>
          </div>

          {scheduledStartTime && (
            <p className="text-[11px] text-bwb-muted mt-3 flex items-center justify-center gap-1.5 font-mono">
              <Calendar size={13} className="text-amber-400" />
              <span>
                Scheduled Date:{' '}
                <strong className="text-bwb-text">
                  {new Date(scheduledStartTime).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            </p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto mb-6 p-3.5 sm:p-4 rounded-2xl bg-bwb-bg/80 border border-emerald-500/30 shadow-inner flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-300">
            Awaiting Host Launch · Auto-starts immediately when Round 1 begins
          </span>
        </div>
      )}

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="w-full max-w-xl mx-auto mb-4 flex rounded-xl bg-bwb-bg p-1 border border-white/5 text-xs font-mono font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('passcode')}
          className={`flex-1 py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'passcode'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
              : 'text-bwb-muted hover:text-bwb-text'
          }`}
        >
          <Sparkles size={13} />
          <span>Team Passcode</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('playbook')}
          className={`flex-1 py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'playbook'
              ? 'bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/40 shadow-sm'
              : 'text-bwb-muted hover:text-bwb-text'
          }`}
        >
          <Layers size={13} />
          <span>Tournament Playbook</span>
        </button>
      </div>

      {/* TAB 1: PASSCODE & ROSTER VAULT */}
      {activeTab === 'passcode' && currentPasscode && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-bwb-bg via-bwb-bg to-bwb-surface border border-amber-400/35 mb-6 shadow-xl text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> YOUR TEAM ENTRY PASSCODE
                </span>
              </div>
              <p className="font-mono text-2xl sm:text-3xl font-black text-bwb-text tracking-wider text-shadow">
                {currentPasscode}
              </p>
            </div>
            <Button
              size="md"
              variant="secondary"
              onClick={copyPasscode}
              className="border-amber-400/40 hover:bg-amber-400/20 text-amber-300 font-bold text-xs shrink-0 shadow-sm"
            >
              {copied ? <CheckCircle2 size={15} className="text-bwb-success" /> : <Copy size={15} />}
              <span>{copied ? 'Passcode Copied!' : 'Copy Code'}</span>
            </Button>
          </div>

          {/* Roster members */}
          {myTeam && myTeam.members.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-white/10">
              <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold mb-2 flex items-center gap-1.5">
                <span>Registered Roster ({myTeam.members.length} Players):</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {myTeam.members.map((member, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                      idx === 0
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    }`}
                  >
                    {idx === 0 ? <Crown size={12} className="text-amber-400" /> : <UserCheck size={12} />}
                    <span>{member}</span>
                    {idx === 0 && <span className="text-[9px] uppercase font-bold opacity-80">(Lead)</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 2: TOURNAMENT PLAYBOOK (3-ROUND TOURNAMENT & 7-STAGE PIPELINE) */}
      {activeTab === 'playbook' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-bwb-bg border border-white/10 mb-6 text-left space-y-3"
        >
          {/* Round 1 */}
          <div className="p-3 rounded-xl bg-bwb-surface border border-purple-500/20 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0">
              R1
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-bwb-text">Round 1: Open Qualifier</p>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  No Elimination
                </span>
              </div>
              <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                Choose from 8 problem statements, draft 3 surprise tech cards, and formulate a 15-minute system architecture. All registered squads advance to Round 2!
              </p>
            </div>
          </div>

          {/* Round 2 */}
          <div className="p-3 rounded-xl bg-bwb-surface border border-bwb-accent/20 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/40 flex items-center justify-center text-xs font-mono font-bold shrink-0">
              R2
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-bwb-text">Round 2: Problem Showdown</p>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30">
                  Top 8 Qualify
                </span>
              </div>
              <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                8 distinct challenge tracks with strictly max 2 teams per problem statement. The Top 8 squads advance to the Grand Finals.
              </p>
            </div>
          </div>

          {/* Round 3 */}
          <div className="p-3 rounded-xl bg-bwb-surface border border-amber-500/20 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0">
              R3
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-bwb-text">Round 3: Grand Finals & Prize Podium</p>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Top 4 Prized
                </span>
              </div>
              <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                Top 8 Finalists defend live on stage. Top 4 teams receive championship prizes: 🥇 1st Place (Champion), 🥈 2nd Place (Runner-Up), and 🥉 3rd Place (Dual Bronze Winners).
              </p>
            </div>
          </div>

          {/* 7-Stage Flow */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] font-mono uppercase text-bwb-muted font-bold mb-1.5">
              ⚡ 7-Stage Live Event Pipeline:
            </p>
            <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-bwb-text">
              <span className="px-1.5 py-0.5 rounded bg-white/5">1. Lobby</span>
              <span>➔</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5">2. Problem Reveal</span>
              <span>➔</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5">3. Card Draft</span>
              <span>➔</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5">4. Build</span>
              <span>➔</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5">5. Pitch</span>
              <span>➔</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-purple-300">6. Judging</span>
              <span>➔</span>
              <span className="px-1.5 py-0.5 rounded bg-bwb-gold/20 text-bwb-gold">7. Podium</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Meta */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-bwb-muted font-mono pt-2">
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <ShieldCheck size={14} /> Pre-Registration Confirmed
        </span>
        <span>·</span>
        <span>Event: <strong className="text-bwb-text">{gameName}</strong></span>
      </div>

    </motion.div>
  )
}
