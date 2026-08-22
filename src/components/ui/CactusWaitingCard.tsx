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
  { icon: '🌵', tag: 'MASCOT HYPE', text: "Spike the Cactus says: You're 100% ready to build without building! Own that stage!" },
  { icon: '🧠', tag: 'PITCH TIMING', text: "Pitch Blueprint (60s): 15s Problem Hook ➔ 30s Architecture & Tech Synergy ➔ 15s Real-World Impact!" },
  { icon: '⚡', tag: 'TECH SYNERGY', text: "Drawing IoT + Edge AI? Emphasize on-device inferencing to eliminate cloud round-trip latency!" },
  { icon: '🛡️', tag: 'JUDGE DEFENSE', text: "Judges love attacking offline edge failure. Always explain local cache fallback & offline sync!" },
  { icon: '👑', tag: '1ST PLACE HACK', text: "Grand Champions don't just solve the problem — they quantify cost reduction and scale to 1M users!" },
  { icon: '🃏', tag: 'CARD STRATEGY', text: "Never fight your 3 surprise constraint cards — turn them into unique architectural superpowers!" },
  { icon: '🚀', tag: 'ROUND 1 RULES', text: "Round 1 has ZERO elimination! Use it to test your pitch chemistry and calibrate judge feedback!" },
  { icon: '⏱️', tag: 'SPRINT PROTOCOL', text: "Spend the first 3 minutes aligning on system flow before writing a single line of solution text!" },
  { icon: '💡', tag: 'DATA FLOW', text: "A crystal-clear telemetry data pipeline diagram beats 500 lines of complex technical jargon every time!" },
  { icon: '🔥', tag: 'STAGE PRESENCE', text: "Confidence is infectious! Speak clearly, maintain eye contact, and let your team chemistry shine!" },
  { icon: '🎯', tag: 'RUBRIC MASTERY', text: "Technology Integration is worth 20 points! Make sure all 3 cards are cohesively integrated!" },
  { icon: '🤖', tag: 'EDGE COMPUTE', text: "Explain edge-to-cloud handshakes: sensor ingest ➔ local filtering ➔ cloud aggregation ➔ real-time alert!" },
  { icon: '💎', tag: 'FEASIBILITY TIP', text: "Technical Feasibility is worth 20 points — mention existing open standards and realistic hardware BOM!" },
  { icon: '🏆', tag: 'GRAND FINALS', text: "Round 2 sends only the Top 8 squads to Round 3 — every rubric point matters for cut-off qualification!" },
  { icon: '🥉', tag: 'PRIZE PODIUM', text: "Top 4 teams win prizes in the Grand Finals: 1st Champion, 2nd Runner-Up, and Dual 3rd Bronze Winners!" },
  { icon: '✨', tag: 'TEAM ROLES', text: "Divide and conquer: 1 squad member leads architecture, 1 handles presentation, 1 leads Q&A defense!" },
  { icon: '🎪', tag: 'DEFENSE HACK', text: "When asked a tough judge question, pause for 2 seconds, acknowledge the constraint, and give a structured answer!" },
  { icon: '🔒', tag: 'SECURITY & PRIVACY', text: "Security bonus: Mention end-to-end payload encryption (TLS 1.3) and anonymized edge telemetry!" },
  { icon: '🌊', tag: 'ADAPTABILITY', text: "The greatest engineers adapt to surprise constraints under time pressure — stay calm and innovate!" },
  { icon: '💖', tag: 'MASCOT LOVE', text: "Spike loves your team spirit! Click me again for more secret tournament wisdom!" },
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
  const [petCount, setPetCount] = useState(0)
  const [flowerSpin, setFlowerSpin] = useState(false)
  const [isBlushing, setIsBlushing] = useState(false)
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number; vx: number; vy: number; rot: number }[]>([])
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

  // Play a soft cute synthesized chime pop on interaction
  const playCuteChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      const pitches = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
      const note = pitches[petCount % pitches.length]

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note, now)
      osc.frequency.exponentialRampToValueAtTime(note * 1.5, now + 0.12)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)
    } catch {}
  }

  const handleCactusClick = (e: React.MouseEvent) => {
    setIsWiggling(true)
    setFlowerSpin(true)
    setIsBlushing(true)
    setPetCount((prev) => prev + 1)
    setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length)
    playCuteChime()

    setTimeout(() => setIsWiggling(false), 900)
    setTimeout(() => setFlowerSpin(false), 800)
    setTimeout(() => setIsBlushing(false), 1400)

    // Spawn 4-5 colorful burst particles
    const rect = e.currentTarget.getBoundingClientRect()
    const emojiList = ['💖', '✨', '⚡', '🌟', '🎉', '🌸', '🌵', '🚀', '🔥', '🏆', '💫', '🎶']
    const newBurst = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
      x: e.clientX - rect.left + (Math.random() * 40 - 20),
      y: e.clientY - rect.top + (Math.random() * 20 - 10),
      vx: (Math.random() - 0.5) * 70,
      vy: -40 - Math.random() * 50,
      rot: (Math.random() - 0.5) * 60,
    }))

    setParticles((prev) => [...prev, ...newBurst])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newBurst.some((nb) => nb.id === p.id)))
    }, 1200)
  }

  const currentTip = FUN_QUOTES[quoteIndex]

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

      {/* CUTE ANIMATED 3D-STYLE KAWAII CACTUS MASCOT */}
      <div className="relative inline-block my-2">
        {/* Floating Multi-Particle Bursts */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0.5, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: 0,
                scale: [0.6, 1.4, 1.1],
                x: p.vx,
                y: p.vy,
                rotate: p.rot,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30 font-bold text-base sm:text-lg select-none drop-shadow-md"
              style={{ left: p.x, top: p.y }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          onClick={handleCactusClick}
          title="Tap Spike for happy energy and pro tournament tips!"
          animate={
            isWiggling
              ? {
                  scale: [1, 1.3, 0.88, 1.18, 0.96, 1],
                  y: [0, -28, 4, -14, 2, 0],
                  rotate: [0, -14, 14, -8, 8, 0],
                }
              : {
                  y: [0, -7, 0],
                  rotate: [-1.5, 1.5, -1.5],
                }
          }
          transition={{
            duration: isWiggling ? 0.85 : 3.5,
            repeat: isWiggling ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          className="relative inline-flex flex-col items-center cursor-pointer group select-none touch-manipulation active:scale-95"
        >
          {/* Pulsing Mascot Aura Pedestal */}
          <div className="absolute bottom-1 w-32 h-7 bg-emerald-500/25 rounded-full blur-lg group-hover:bg-emerald-400/40 transition-all animate-pulse" />

          {/* Stylized Ultra-Kawaii SVG Cactus */}
          <div className="w-32 h-36 relative flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(16,185,129,0.45)] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <defs>
                <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="cactusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="45%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
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
              <path d="M48 14 Q52 14 52 87 L48 87 Z" fill="#A7F3D0" opacity="0.45" />

              {/* Left Cute Arm (Bouncing) */}
              <motion.path
                animate={isWiggling ? { rotate: [-18, 22, -18] } : { rotate: [0, -6, 0] }}
                transition={{ repeat: isWiggling ? 2 : Infinity, duration: isWiggling ? 0.35 : 2.5, ease: 'easeInOut' }}
                style={{ transformOrigin: '38px 56px' }}
                d="M38 48 Q20 48 20 32 Q20 25 26 25 Q32 25 32 32 L32 54 Q32 60 38 60 Z"
                fill="url(#armGrad)"
              />

              {/* Right Waving Arm (Excited Wave) */}
              <motion.path
                animate={isWiggling ? { rotate: [25, -20, 25] } : { rotate: [-10, 16, -10] }}
                transition={{ repeat: isWiggling ? 3 : Infinity, duration: isWiggling ? 0.3 : 2 }}
                style={{ transformOrigin: '62px 56px' }}
                d="M62 44 Q80 44 80 28 Q80 21 74 21 Q68 21 68 28 L68 50 Q68 56 62 56 Z"
                fill="url(#armGrad)"
              />

              {/* Top Spinning Kawaii Flower */}
              <motion.g
                animate={flowerSpin ? { rotate: 360, scale: [1, 1.35, 1] } : { scale: [1, 1.08, 1] }}
                transition={{ duration: flowerSpin ? 0.75 : 2.5, repeat: flowerSpin ? 0 : Infinity }}
                style={{ transformOrigin: '50px 12px' }}
              >
                <circle cx="50" cy="12" r="6.5" fill="#F43F5E" />
                <circle cx="44" cy="9" r="4.5" fill="#FB7185" />
                <circle cx="56" cy="9" r="4.5" fill="#FB7185" />
                <circle cx="50" cy="6" r="4.5" fill="#FDA4AF" />
                <circle cx="45" cy="15" r="4" fill="#FDA4AF" />
                <circle cx="55" cy="15" r="4" fill="#FDA4AF" />
                <circle cx="50" cy="12" r="3" fill="#FEF08A" />
              </motion.g>

              {/* Cute Sparkly Blinking Eyes */}
              {isWiggling ? (
                // Happy Arc Eyes (^ ◡ ^)
                <g>
                  <path d="M42 37 Q45 32 48 37" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M52 37 Q55 32 58 37" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                // Twinkling Kawaii Eyes
                <g>
                  <circle cx="45" cy="36" r="3.2" fill="#064E3B" />
                  <circle cx="55" cy="36" r="3.2" fill="#064E3B" />
                  <circle cx="44" cy="35" r="1.3" fill="#FFFFFF" />
                  <circle cx="54" cy="35" r="1.3" fill="#FFFFFF" />
                  <circle cx="46.5" cy="37.5" r="0.6" fill="#FFFFFF" />
                  <circle cx="56.5" cy="37.5" r="0.6" fill="#FFFFFF" />
                </g>
              )}

              {/* Animated Blushing Cheeks */}
              <ellipse
                cx="41"
                cy="42"
                rx={isBlushing ? 3.8 : 3}
                ry={isBlushing ? 2.4 : 1.8}
                fill={isBlushing ? '#F43F5E' : '#FB7185'}
                opacity={isBlushing ? 0.95 : 0.75}
              />
              <ellipse
                cx="59"
                cy="42"
                rx={isBlushing ? 3.8 : 3}
                ry={isBlushing ? 2.4 : 1.8}
                fill={isBlushing ? '#F43F5E' : '#FB7185'}
                opacity={isBlushing ? 0.95 : 0.75}
              />

              {/* Kawaii Open Happy Smile */}
              <path
                d={isWiggling ? 'M45 40 Q50 48 55 40 Z' : 'M46 41 Q50 46 54 41'}
                stroke="#064E3B"
                strokeWidth={isWiggling ? '1.5' : '1.8'}
                strokeLinecap="round"
                fill={isWiggling ? '#F43F5E' : 'none'}
              />

              {/* Needles & Spines */}
              <circle cx="36" cy="70" r="0.9" fill="#D1FAE5" />
              <circle cx="64" cy="70" r="0.9" fill="#D1FAE5" />
              <circle cx="50" cy="62" r="0.9" fill="#D1FAE5" />
              <circle cx="26" cy="38" r="0.9" fill="#D1FAE5" />
              <circle cx="74" cy="36" r="0.9" fill="#D1FAE5" />
            </svg>
          </div>

          {/* Interactive Mascot Tap Badge */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-black uppercase tracking-wider mt-1.5 shadow-lg group-hover:scale-105 group-hover:bg-emerald-500/30 transition-all">
            <Sparkles size={11} className="animate-spin text-emerald-400" />
            <span>Tap Spike for Tips! {petCount > 0 && `(x${petCount})`}</span>
          </div>
        </motion.div>

        {/* Dynamic Cute Speech Bubble with Tag Badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-3.5 w-full max-w-lg mx-auto p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-bwb-surface-2 to-emerald-950/40 border border-emerald-500/40 text-emerald-200 font-mono text-xs font-semibold shadow-xl shadow-emerald-500/10 flex flex-col sm:flex-row items-center gap-2.5 text-left"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">{currentTip.icon}</span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentTip.tag}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-bwb-text font-medium leading-relaxed">
              {currentTip.text}
            </p>
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
