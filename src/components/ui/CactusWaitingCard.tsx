import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Copy, CheckCircle2, UserCheck, Sparkles,
  ShieldCheck, Layers, Crown, ChevronLeft, ChevronRight, BookOpen,
  Music, X
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
  { icon: '🌵', tag: 'MASCOT HYPE', text: "Spike the Cactus says: You're 100% ready to build without building! Own that stage and shock the judges!" },
  { icon: '🧠', tag: 'PITCH TIMING', text: "Pitch Blueprint (60s): 15s Problem Hook ➔ 30s Architecture & Tech Synergy ➔ 15s Real-World Impact!" },
  { icon: '⚡', tag: 'TECH SYNERGY', text: "Drawing IoT + Edge AI? Emphasize on-device inferencing to eliminate cloud round-trip latency & cut costs!" },
  { icon: '🛡️', tag: 'JUDGE DEFENSE', text: "Judges love attacking offline edge failure. Always explain local cache fallback & offline sync protocols!" },
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
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1)
  const [isWiggling, setIsWiggling] = useState(false)
  const [isDancing, setIsDancing] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [petCount, setPetCount] = useState(0)
  const [flowerSpin, setFlowerSpin] = useState(false)
  const [isBlushing, setIsBlushing] = useState(false)
  const [showAllTips, setShowAllTips] = useState(false)
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

  // Natural mascot eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 220)
    }, 3800)
    return () => clearInterval(blinkInterval)
  }, [])

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

      const pitches = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]
      const note = pitches[petCount % pitches.length]

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note, now)
      osc.frequency.exponentialRampToValueAtTime(note * 1.6, now + 0.12)

      gain.gain.setValueAtTime(0.14, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.28)
    } catch {}
  }

  const spawnParticlesAt = (x: number, y: number) => {
    const emojiList = ['💖', '✨', '⚡', '🌟', '🎉', '🌸', '🌵', '🚀', '🔥', '👑', '💫', '🎶']
    const newBurst = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 20 - 10),
      vx: (Math.random() - 0.5) * 80,
      vy: -45 - Math.random() * 55,
      rot: (Math.random() - 0.5) * 70,
    }))

    setParticles((prev) => [...prev, ...newBurst])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newBurst.some((nb) => nb.id === p.id)))
    }, 1200)
  }

  const handleCactusClick = (e: React.MouseEvent) => {
    setIsWiggling(true)
    setFlowerSpin(true)
    setIsBlushing(true)
    setPetCount((prev) => prev + 1)
    setSlideDirection(1)
    setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length)
    playCuteChime()

    setTimeout(() => setIsWiggling(false), 900)
    setTimeout(() => setFlowerSpin(false), 850)
    setTimeout(() => setIsBlushing(false), 1400)

    const rect = e.currentTarget.getBoundingClientRect()
    spawnParticlesAt(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleNextTip = () => {
    setSlideDirection(1)
    setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length)
    playCuteChime()
  }

  const handlePrevTip = () => {
    setSlideDirection(-1)
    setQuoteIndex((prev) => (prev - 1 + FUN_QUOTES.length) % FUN_QUOTES.length)
    playCuteChime()
  }

  const toggleDance = () => {
    setIsDancing((prev) => !prev)
    setIsWiggling(true)
    setFlowerSpin(true)
    playCuteChime()
    setTimeout(() => setIsWiggling(false), 1200)
  }

  // Mascot Tamagotchi Evolution System
  const getEvolutionInfo = () => {
    if (petCount < 5) return { level: 1, name: 'Baby Sprout 🌱', desc: 'Warming up strategy vibes', next: 5, progress: (petCount / 5) * 100 }
    if (petCount < 15) return { level: 2, name: 'Energetic Spike 🌵', desc: 'Hype building for Round 1!', next: 15, progress: ((petCount - 5) / 10) * 100 }
    if (petCount < 30) return { level: 3, name: 'Strategy Maestro 🧠', desc: 'Architecting 1st place solutions!', next: 30, progress: ((petCount - 15) / 15) * 100 }
    if (petCount < 50) return { level: 4, name: 'Golden Champion 👑', desc: 'Grand Finals ready!', next: 50, progress: ((petCount - 30) / 20) * 100 }
    return { level: 5, name: 'SQUAD DEITY 🔥⚡', desc: 'Unstoppable championship energy!', next: 100, progress: 100 }
  }

  const evo = getEvolutionInfo()
  const currentTip = FUN_QUOTES[quoteIndex]

  const copyTipToClipboard = () => {
    navigator.clipboard.writeText(`${currentTip.tag}: ${currentTip.text}`)
    toast.success(`Strategy Tip "${currentTip.tag}" copied to clipboard!`)
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
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
      <div className="relative inline-block my-1">
        {/* Floating Multi-Particle Bursts */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0.5, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: 0,
                scale: [0.6, 1.5, 1.2],
                x: p.vx,
                y: p.vy,
                rotate: p.rot,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30 font-bold text-lg select-none drop-shadow-md"
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
            isWiggling || isDancing
              ? {
                  scale: [1, 1.32, 0.86, 1.22, 0.95, 1],
                  y: [0, -32, 5, -16, 2, 0],
                  rotate: isDancing ? [-18, 18, -18, 18, 0] : [0, -15, 15, -8, 8, 0],
                }
              : {
                  y: [0, -8, 0],
                  rotate: [-1.5, 1.5, -1.5],
                }
          }
          transition={{
            duration: isDancing ? 0.9 : isWiggling ? 0.85 : 3.5,
            repeat: isDancing ? Infinity : isWiggling ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          className="relative inline-flex flex-col items-center cursor-pointer group select-none touch-manipulation active:scale-95"
        >
          {/* Pulsing Mascot Aura Pedestal */}
          <div className="absolute bottom-1 w-36 h-8 bg-emerald-500/25 rounded-full blur-lg group-hover:bg-emerald-400/45 transition-all animate-pulse" />

          {/* Stylized Ultra-Kawaii 3D SVG Cactus (Spike 2.0) */}
          <div className="w-36 h-40 relative flex items-center justify-center filter drop-shadow-[0_14px_32px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <defs>
                <linearGradient id="potGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="cactusGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6EE7B7" />
                  <stop offset="35%" stopColor="#10B981" />
                  <stop offset="85%" stopColor="#047857" />
                  <stop offset="100%" stopColor="#064E3B" />
                </linearGradient>
                <linearGradient id="armGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="100%" stopColor="#EAB308" />
                </linearGradient>
              </defs>

              {/* Pot Base with 3D Bevel & Shadow */}
              <path d="M26 88 L33 116 Q50 120 67 116 L74 88 Z" fill="url(#potGrad2)" />
              <path d="M22 84 Q50 80 78 84 L76 89 Q50 86 24 89 Z" fill="#F59E0B" />
              <ellipse cx="50" cy="85" rx="26" ry="3.5" fill="#78350F" opacity="0.6" />

              {/* Chubby Round Cactus Body */}
              <path
                d="M36 28 Q36 10 50 10 Q64 10 64 28 L64 86 Q50 90 36 86 Z"
                fill="url(#cactusGrad2)"
              />
              {/* Highlight Ridge with Mint Glow */}
              <path d="M47 12 Q53 12 53 88 L47 88 Z" fill="#D1FAE5" opacity="0.45" />

              {/* Left Bouncy Arm */}
              <motion.path
                animate={isWiggling || isDancing ? { rotate: [-24, 28, -24] } : { rotate: [0, -8, 0] }}
                transition={{ repeat: isWiggling || isDancing ? Infinity : Infinity, duration: isWiggling || isDancing ? 0.35 : 2.5, ease: 'easeInOut' }}
                style={{ transformOrigin: '36px 56px' }}
                d="M36 48 Q18 48 18 30 Q18 22 24 22 Q30 22 30 30 L30 54 Q30 60 36 60 Z"
                fill="url(#armGrad2)"
              />

              {/* Right Excited Waving Arm */}
              <motion.path
                animate={isWiggling || isDancing ? { rotate: [30, -25, 30] } : { rotate: [-12, 18, -12] }}
                transition={{ repeat: isWiggling || isDancing ? Infinity : Infinity, duration: isWiggling || isDancing ? 0.3 : 2 }}
                style={{ transformOrigin: '64px 56px' }}
                d="M64 44 Q82 44 82 26 Q82 18 76 18 Q70 18 70 26 L70 50 Q70 56 64 56 Z"
                fill="url(#armGrad2)"
              />

              {/* Golden Crown Accessory on High Level */}
              {evo.level >= 2 && (
                <motion.g
                  animate={{ y: [0, -3, 0], rotate: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  style={{ transformOrigin: '50px 4px' }}
                >
                  <path d="M42 6 L44 0 L50 4 L56 0 L58 6 Z" fill="url(#crownGrad)" stroke="#CA8A04" strokeWidth="0.8" />
                  <circle cx="44" cy="0" r="1" fill="#EF4444" />
                  <circle cx="50" cy="4" r="1" fill="#3B82F6" />
                  <circle cx="56" cy="0" r="1" fill="#10B981" />
                </motion.g>
              )}

              {/* Top Spinning Kawaii Cherry Blossoms */}
              <motion.g
                animate={flowerSpin ? { rotate: 360, scale: [1, 1.4, 1] } : { scale: [1, 1.1, 1] }}
                transition={{ duration: flowerSpin ? 0.75 : 2.5, repeat: flowerSpin ? 0 : Infinity }}
                style={{ transformOrigin: '50px 10px' }}
              >
                <circle cx="50" cy="10" r="7" fill="#F43F5E" />
                <circle cx="43" cy="7" r="5" fill="#FB7185" />
                <circle cx="57" cy="7" r="5" fill="#FB7185" />
                <circle cx="50" cy="3" r="5" fill="#FDA4AF" />
                <circle cx="44" cy="14" r="4.5" fill="#FDA4AF" />
                <circle cx="56" cy="14" r="4.5" fill="#FDA4AF" />
                <circle cx="50" cy="10" r="3.5" fill="#FEF08A" />
              </motion.g>

              {/* Cute Sparkly Blinking Anime Eyes */}
              {isWiggling || isDancing ? (
                // Happy Arc Squint Eyes (^ ◡ ^)
                <g>
                  <path d="M41 36 Q45 30 49 36" stroke="#064E3B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M51 36 Q55 30 59 36" stroke="#064E3B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </g>
              ) : isBlinking ? (
                // Closed Blinking Eyes
                <g>
                  <line x1="41" y1="36" x2="49" y2="36" stroke="#064E3B" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="51" y1="36" x2="59" y2="36" stroke="#064E3B" strokeWidth="2.2" strokeLinecap="round" />
                </g>
              ) : (
                // Giant Kawaii Anime Eyes with Dual Catchlights
                <g>
                  <ellipse cx="45" cy="35" rx="3.8" ry="4.2" fill="#064E3B" />
                  <ellipse cx="55" cy="35" rx="3.8" ry="4.2" fill="#064E3B" />
                  {/* Primary Large Highlight */}
                  <circle cx="43.8" cy="33.5" r="1.6" fill="#FFFFFF" />
                  <circle cx="53.8" cy="33.5" r="1.6" fill="#FFFFFF" />
                  {/* Secondary Sparkle Catchlight */}
                  <circle cx="46.5" cy="37" r="0.8" fill="#FFFFFF" />
                  <circle cx="56.5" cy="37" r="0.8" fill="#FFFFFF" />
                </g>
              )}

              {/* Glowing Rosy Cheeks */}
              <ellipse
                cx="40"
                cy="42"
                rx={isBlushing ? 4.2 : 3.4}
                ry={isBlushing ? 2.6 : 2}
                fill={isBlushing ? '#F43F5E' : '#FB7185'}
                opacity={isBlushing ? 0.95 : 0.75}
              />
              <ellipse
                cx="60"
                cy="42"
                rx={isBlushing ? 4.2 : 3.4}
                ry={isBlushing ? 2.6 : 2}
                fill={isBlushing ? '#F43F5E' : '#FB7185'}
                opacity={isBlushing ? 0.95 : 0.75}
              />

              {/* Kawaii Happy Open Mouth */}
              <path
                d={isWiggling || isDancing ? 'M44 40 Q50 49 56 40 Z' : 'M45 41 Q50 47 55 41'}
                stroke="#064E3B"
                strokeWidth={isWiggling || isDancing ? '1.5' : '1.8'}
                strokeLinecap="round"
                fill={isWiggling || isDancing ? '#F43F5E' : 'none'}
              />

              {/* Cute Little Needles & Spines */}
              <circle cx="34" cy="70" r="1" fill="#D1FAE5" />
              <circle cx="66" cy="70" r="1" fill="#D1FAE5" />
              <circle cx="50" cy="62" r="1" fill="#D1FAE5" />
              <circle cx="24" cy="38" r="1" fill="#D1FAE5" />
              <circle cx="76" cy="36" r="1" fill="#D1FAE5" />
            </svg>
          </div>

          {/* Interactive Mascot Tap Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider mt-1.5 shadow-lg group-hover:scale-105 group-hover:bg-emerald-500/30 transition-all">
            <Sparkles size={12} className="animate-spin text-emerald-400" />
            <span>Tap Spike for Tips! {petCount > 0 && `(x${petCount})`}</span>
          </div>
        </motion.div>

        {/* Mascot Tamagotchi Evolution Progress Bar */}
        <div className="max-w-xs mx-auto mt-2 px-3 py-1.5 rounded-xl bg-bwb-surface/90 border border-white/10 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="font-bold text-amber-300">{evo.name}</span>
            <span className="text-bwb-muted font-semibold">{petCount} Pets</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${evo.progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* INTERACTIVE SLIDING STRATEGY TIP CAROUSEL */}
        <div className="relative mt-4 max-w-lg mx-auto">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={quoteIndex}
              custom={slideDirection}
              initial={{ opacity: 0, x: slideDirection * 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -slideDirection * 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-bwb-surface-2 to-emerald-950/30 border border-emerald-500/40 text-emerald-200 shadow-xl shadow-emerald-500/10 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentTip.icon}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                    {currentTip.tag}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/80">
                  <span>Tip {quoteIndex + 1} of {FUN_QUOTES.length}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-bwb-text font-medium leading-relaxed mb-3">
                {currentTip.text}
              </p>

              {/* Card Bottom Navigation Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevTip}
                    className="p-1.5 rounded-lg bg-bwb-surface hover:bg-emerald-500/20 text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-colors"
                    title="Previous Tip"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNextTip}
                    className="p-1.5 rounded-lg bg-bwb-surface hover:bg-emerald-500/20 text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-colors"
                    title="Next Tip"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyTipToClipboard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bwb-surface hover:bg-emerald-500/20 text-emerald-300 border border-white/10 text-[10px] font-bold transition-colors"
                  >
                    <Copy size={11} /> Copy Tip
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mascot Quick Action Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 max-w-md mx-auto">
          <button
            onClick={handleNextTip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bwb-surface-2 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-bwb-text text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Sparkles size={13} className="text-emerald-400" /> Next Tip
          </button>
          <button
            onClick={toggleDance}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 ${
              isDancing
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-bwb-surface-2 hover:bg-amber-500/20 border-white/10 hover:border-amber-400/40 text-bwb-text'
            }`}
          >
            <Music size={13} className="text-amber-400" /> {isDancing ? 'Stop Dance' : 'Dance Mode'}
          </button>
          <button
            onClick={() => setShowAllTips(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bwb-surface-2 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-bwb-text text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <BookOpen size={13} className="text-cyan-400" /> All Tips ({FUN_QUOTES.length})
          </button>
        </div>
      </div>

      {/* ALL TIPS POPUP MODAL */}
      <AnimatePresence>
        {showAllTips && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-bwb-surface-2 border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col text-left"
            >
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-bwb-surface">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌵</span>
                  <div>
                    <h3 className="font-display font-black text-lg text-bwb-text">Spike&apos;s Strategy Arsenal</h3>
                    <p className="text-xs text-bwb-muted">20 Pro Tournament Tips & Pitch Defense Tactics</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllTips(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-bwb-muted hover:text-bwb-text transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-white/5">
                {FUN_QUOTES.map((q, idx) => (
                  <div key={idx} className="pt-3 first:pt-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{q.icon}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {q.tag}
                      </span>
                      <span className="text-[10px] font-mono text-bwb-muted ml-auto">#{idx + 1}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-bwb-text/90 leading-relaxed pl-6">
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 bg-bwb-surface text-center">
                <Button size="sm" fullWidth onClick={() => setShowAllTips(false)}>
                  Close Arsenal & Return to Lobby
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



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
