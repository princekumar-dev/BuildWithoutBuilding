import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Copy, CheckCircle2, UserCheck, Sparkles,
  ShieldCheck, Layers, Crown, ChevronLeft, ChevronRight, BookOpen,
  Moon, Sun, X
} from 'lucide-react'

import { Button } from './Button'
import { toast } from './Toast'
import { SoundFX } from '../../lib/soundEffects'
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
  const [isSleeping, setIsSleeping] = useState(false)
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [flowerSpin, setFlowerSpin] = useState(false)
  const [isBlushing, setIsBlushing] = useState(false)


  const [showAllTips, setShowAllTips] = useState(false)
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number; vx: number; vy: number; rot: number }[]>([])
  const [activeTab, setActiveTab] = useState<'passcode' | 'playbook' | 'checklist'>(currentPasscode ? 'passcode' : 'playbook')


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

  const spawnParticlesAt = (x: number, y: number) => {
    const emojiList = isSleeping ? ['💤', '✨', '🌙', '⭐', '💫', '🌸'] : ['💖', '✨', '⚡', '🌟', '🎉', '🌸', '🌵', '🚀', '🔥', '👑', '💫', '🎶']
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
    if (isSleeping) {
      setIsSleeping(false)
      setIsWakingUp(true)
      setIsWiggling(true)
      setIsBlushing(true)
      setFlowerSpin(true)
      SoundFX.playCutePop()
      toast.success("Spike woke up full of strategy energy! ☀️")
      setTimeout(() => setIsWiggling(false), 900)
      setTimeout(() => setFlowerSpin(false), 850)
      setTimeout(() => setIsBlushing(false), 1200)
      setTimeout(() => setIsWakingUp(false), 1400)
    } else {
      setIsWiggling(true)
      setFlowerSpin(true)
      setIsBlushing(true)
      setSlideDirection(1)
      setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length)
      SoundFX.playCutePop()

      setTimeout(() => setIsWiggling(false), 600)
      setTimeout(() => setFlowerSpin(false), 750)
      setTimeout(() => setIsBlushing(false), 900)
    }

    const rect = e.currentTarget.getBoundingClientRect()
    spawnParticlesAt(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleNextTip = () => {
    setSlideDirection(1)
    setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length)
    SoundFX.playCutePop()
  }

  const handlePrevTip = () => {
    setSlideDirection(-1)
    setQuoteIndex((prev) => (prev - 1 + FUN_QUOTES.length) % FUN_QUOTES.length)
    SoundFX.playCutePop()
  }

  const toggleSleep = () => {
    SoundFX.playCutePop()
    if (!isSleeping) {
      setIsSleeping(true)
      setIsWakingUp(false)
      toast.info("Spike is taking a cozy power nap... 💤")
    } else {
      setIsSleeping(false)
      setIsWakingUp(true)
      setIsWiggling(true)
      setIsBlushing(true)
      setFlowerSpin(true)
      toast.success("Spike woke up! ☀️")
      setTimeout(() => setIsWiggling(false), 900)
      setTimeout(() => setFlowerSpin(false), 850)
      setTimeout(() => setIsBlushing(false), 1200)
      setTimeout(() => setIsWakingUp(false), 1400)
    }
  }




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
          title={isSleeping ? 'Tap to wake Spike up!' : 'Tap Spike for happy vibes and tournament tips!'}
          animate={
            isSleeping
              ? {
                  y: [0, 4, 0],
                  scaleY: [1, 0.98, 1],
                }
              : isWiggling
              ? {
                  scale: isWakingUp ? [1, 1.14, 0.94, 1.06, 1] : [1, 1.08, 0.96, 1.04, 1],
                  rotate: [0, -6, 6, -3, 3, 0],
                }
              : undefined
          }
          transition={{
            duration: isSleeping ? 2.8 : isWakingUp ? 0.85 : 0.6,
            repeat: isSleeping ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="relative inline-flex flex-col items-center cursor-pointer group select-none touch-manipulation active:scale-95 transition-transform will-change-transform"
        >
          {/* Pulsing Mascot Aura Pedestal */}
          <div className={`absolute bottom-1 w-36 h-8 rounded-full blur-lg transition-all ${
            isSleeping ? 'bg-indigo-500/20 group-hover:bg-indigo-400/35' : 'bg-emerald-500/25 group-hover:bg-emerald-400/45'
          }`} />

          {/* Stylized Ultra-Kawaii 3D SVG Cactus (Spike 2.0) */}
          <div className="w-36 h-40 relative flex items-center justify-center filter drop-shadow-[0_14px_32px_rgba(16,185,129,0.45)] group-hover:scale-105 transition-transform will-change-transform">
            {/* Floating Animated Zzz Sleep Bubbles directly attached to Cactus Head */}
            {isSleeping && (
              <div className="absolute top-1 right-2 pointer-events-none z-30 select-none flex flex-col items-center">
                <motion.span
                  animate={{ y: [0, -18, -32], x: [0, 6, 14], opacity: [0, 1, 0], scale: [0.6, 1.1, 1.3] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0 }}
                  className="text-cyan-300 font-display font-black text-base drop-shadow-[0_2px_8px_rgba(6,182,212,0.8)]"
                >
                  Z
                </motion.span>
                <motion.span
                  animate={{ y: [0, -14, -25], x: [0, 4, 10], opacity: [0, 1, 0], scale: [0.6, 0.9, 1.1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                  className="text-teal-300 font-display font-bold text-xs -mt-1 drop-shadow-[0_2px_6px_rgba(20,184,166,0.8)]"
                >
                  z
                </motion.span>
                <motion.span
                  animate={{ y: [0, -10, -18], x: [0, 3, 6], opacity: [0, 1, 0], scale: [0.5, 0.8, 0.95] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.4 }}
                  className="text-emerald-300 font-display font-semibold text-[10px] -mt-1 drop-shadow-[0_2px_4px_rgba(16,185,129,0.8)]"
                >
                  z
                </motion.span>
              </div>
            )}

            <svg viewBox="0 0 100 134" className="w-full h-full overflow-visible">

              <defs>
                <linearGradient id="potGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDBA74" />
                  <stop offset="50%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient id="cactusGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6EE7B7" />
                  <stop offset="30%" stopColor="#34D399" />
                  <stop offset="75%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Pot Base with 3D Bevel & Shadow */}
              <path d="M22 92 L29 122 Q50 126 71 122 L78 92 Z" fill="url(#potGrad2)" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
              <path d="M18 87 Q50 82 82 87 L80 93 Q50 88 20 93 Z" fill="#FB923C" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
              <ellipse cx="50" cy="88" rx="28" ry="3.5" fill="#7C2D12" opacity="0.7" />

              {/* Left Cute Stubby Arm (Chubby Branch) */}
              <motion.g
                animate={isWiggling ? { rotate: [-12, 14, -12] } : isSleeping ? { rotate: -4 } : undefined}
                transition={{ repeat: 1, duration: 0.35, ease: 'easeInOut' }}
                style={{ transformOrigin: '32px 64px' }}
              >
                <path
                  d="M32 66 C18 66 10 66 10 50 L10 38 C10 28 20 28 20 38 L20 48 C20 54 26 54 32 54 Z"
                  fill="url(#cactusGrad2)"
                  stroke="#064E3B"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path d="M15 38 L15 48 C15 51 18 52 24 52" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
                <circle cx="8" cy="46" r="1.2" fill="#D1FAE5" />
              </motion.g>

              {/* Right Cute Stubby Arm (Waving Branch) */}
              <motion.g
                animate={isWiggling ? { rotate: [14, -12, 14] } : isSleeping ? { rotate: 4 } : undefined}
                transition={{ repeat: 2, duration: 0.3 }}
                style={{ transformOrigin: '68px 60px' }}
              >
                <path
                  d="M68 54 C74 54 80 54 80 48 L80 32 C80 22 90 22 90 32 L90 46 C90 62 82 62 68 62 Z"
                  fill="url(#cactusGrad2)"
                  stroke="#064E3B"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path d="M85 32 L85 46 C85 52 80 54 74 54" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
                <circle cx="92" cy="40" r="1.2" fill="#D1FAE5" />
              </motion.g>

              {/* Chubby Round Cactus Body (Plump Capsule with Outlines) */}
              <path
                d="M28 36 C28 14 72 14 72 36 L72 89 Q50 93 28 89 Z"
                fill="url(#cactusGrad2)"
                stroke="#064E3B"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Highlight Curved Ridges */}
              <path d="M42 20 Q48 18 48 90" stroke="#A7F3D0" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.45" />
              <path d="M58 20 Q52 18 52 90" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

              {/* Top Spinning Kawaii Cherry Blossom Cluster */}
              <motion.g
                animate={flowerSpin ? { rotate: 360, scale: [1, 1.25, 1] } : undefined}
                transition={{ duration: 0.75, repeat: 0 }}
                style={{ transformOrigin: '50px 14px' }}
              >
                <circle cx="50" cy="14" r="7.5" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
                <circle cx="42" cy="11" r="5.5" fill="#FB7185" />
                <circle cx="58" cy="11" r="5.5" fill="#FB7185" />
                <circle cx="50" cy="6" r="5.5" fill="#FDA4AF" />
                <circle cx="43" cy="19" r="5" fill="#FDA4AF" />
                <circle cx="57" cy="19" r="5" fill="#FDA4AF" />
                <circle cx="50" cy="14" r="4" fill="#FEF08A" stroke="#EAB308" strokeWidth="0.8" />
              </motion.g>

              {/* Big Expressive Anime Eyes with Catchlights / Sleeping Eyes */}
              {isSleeping ? (
                // Peaceful Slumber Eyes (∪ ∪)
                <g>
                  <path d="M39 44 Q43 50 47 44" stroke="#064E3B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <path d="M53 44 Q57 50 61 44" stroke="#064E3B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                </g>
              ) : isWiggling || isWakingUp ? (
                // Happy Squint Eyes (^ ◡ ^)
                <g>
                  <path d="M38 42 Q43 35 48 42" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M52 42 Q57 35 62 42" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                // Giant Glossy Anime Eyes
                <g>
                  <ellipse cx="43" cy="41" rx="4.5" ry="5.2" fill="#064E3B" />
                  <ellipse cx="57" cy="41" rx="4.5" ry="5.2" fill="#064E3B" />
                  {/* Primary Large Highlight */}
                  <circle cx="41.5" cy="39" r="2" fill="#FFFFFF" />
                  <circle cx="55.5" cy="39" r="2" fill="#FFFFFF" />
                  {/* Secondary Sparkle Catchlight */}
                  <circle cx="44.8" cy="43.5" r="1" fill="#FFFFFF" />
                  <circle cx="58.8" cy="43.5" r="1" fill="#FFFFFF" />
                </g>
              )}



              {/* Soft Blushing Rosy Cheeks */}
              <ellipse
                cx="36"
                cy="49"
                rx={isBlushing ? 5 : 4}
                ry={isBlushing ? 3.2 : 2.5}
                fill={isBlushing ? '#F43F5E' : '#FB7185'}
                opacity={isBlushing ? 0.95 : 0.75}
              />
              <ellipse
                cx="64"
                cy="49"
                rx={isBlushing ? 5 : 4}
                ry={isBlushing ? 3.2 : 2.5}
                fill={isBlushing ? '#F43F5E' : '#FB7185'}
                opacity={isBlushing ? 0.95 : 0.75}
              />

              {/* Sweet Kawaii Smile / Sleeping Mouth */}
              <path
                d={isSleeping ? 'M47 52 Q50 54 53 52' : isWiggling ? 'M44 48 Q50 58 56 48 Z' : 'M45 49 Q50 56 55 49'}
                stroke="#064E3B"
                strokeWidth={isWiggling ? '1.8' : '2.2'}
                strokeLinecap="round"
                fill={isWiggling ? '#F43F5E' : 'none'}
              />


              {/* Cute Spines & Star Freckles */}
              <circle cx="31" cy="74" r="1.3" fill="#D1FAE5" />
              <circle cx="69" cy="74" r="1.3" fill="#D1FAE5" />
              <circle cx="50" cy="68" r="1.3" fill="#D1FAE5" />
              <circle cx="35" cy="30" r="1.2" fill="#D1FAE5" />
              <circle cx="65" cy="30" r="1.2" fill="#D1FAE5" />
            </svg>
          </div>

          {/* Interactive Mascot Tap Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider mt-1.5 shadow-lg group-hover:scale-105 group-hover:bg-emerald-500/30 transition-all">
            {isSleeping ? (
              <>
                <Moon size={12} className="animate-pulse text-cyan-400" />
                <span>Spike is Asleep (Tap to Wake)</span>
              </>
            ) : (
              <>
                <Sparkles size={12} className="animate-spin text-emerald-400" />
                <span>Tap Spike for Tips!</span>
              </>
            )}
          </div>
        </motion.div>

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
                    <Copy size={12} /> Copy Tip
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
            onClick={toggleSleep}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 ${
              isSleeping
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-bwb-surface-2 hover:bg-indigo-500/20 border-white/10 hover:border-indigo-400/40 text-bwb-text'
            }`}
          >
            {isSleeping ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-400" />}
            {isSleeping ? 'Wake Up ☀️' : 'Sleep Mode 💤'}
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

      {/* INTERACTIVE NAVIGATION TABS WITH SMOOTH SLIDING PILL */}
      {currentPasscode ? (
        <div className="w-full max-w-xl mx-auto mb-4 relative flex rounded-xl bg-bwb-bg p-1 border border-white/10 text-xs font-mono font-bold shadow-inner">
          <button
            type="button"
            onClick={() => {
              if (activeTab !== 'passcode') {
                setActiveTab('passcode')
                SoundFX.playCutePop()
              }
            }}
            className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'passcode' ? 'text-amber-300' : 'text-bwb-muted hover:text-bwb-text'
            }`}
          >
            {activeTab === 'passcode' && (
              <motion.div
                layoutId="activeWaitingTabPill"
                className="absolute inset-0 rounded-lg bg-amber-400/20 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <Sparkles size={13} className="relative z-10" />
            <span className="relative z-10">Team Passcode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab !== 'playbook') {
                setActiveTab('playbook')
                SoundFX.playCutePop()
              }
            }}
            className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'playbook' ? 'text-bwb-accent' : 'text-bwb-muted hover:text-bwb-text'
            }`}
          >
            {activeTab === 'playbook' && (
              <motion.div
                layoutId="activeWaitingTabPill"
                className="absolute inset-0 rounded-lg bg-bwb-accent/20 border border-bwb-accent/50 shadow-[0_0_15px_rgba(0,229,199,0.25)]"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <Layers size={13} className="relative z-10" />
            <span className="relative z-10">Tournament Playbook</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-bwb-bg border border-bwb-accent/30 text-bwb-accent font-mono text-xs font-bold shadow-inner">
            <Layers size={14} />
            <span>Tournament Playbook & Rules</span>
          </div>
        </div>
      )}

      {/* GPU ACCELERATED CINEMATIC TAB PANELS WITH SMOOTH LAYOUT EXPANSION */}
      <motion.div layout transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }} className="w-full max-w-xl mx-auto overflow-hidden mb-6">
        <AnimatePresence mode="wait" initial={false}>


          {/* TAB 1: PASSCODE & ROSTER VAULT */}
          {activeTab === 'passcode' && currentPasscode ? (
            <motion.div
              key="tab-passcode"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-bwb-bg via-bwb-bg to-bwb-surface border border-amber-400/35 shadow-xl text-left will-change-transform gpu-layer"
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
          ) : activeTab === 'playbook' ? (
            /* TAB 2: TOURNAMENT PLAYBOOK (3-ROUND TOURNAMENT & 7-STAGE PIPELINE) */
            <motion.div
              key="tab-playbook"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-bwb-bg border border-white/10 text-left space-y-3 will-change-transform gpu-layer"
            >

              {/* Round 1 */}
              <div className="p-3 rounded-xl bg-bwb-surface border border-purple-500/20 flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  R1
                </span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold text-bwb-text">Round 1: Problem & Existing Landscape (100 Marks)</p>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Zero Elimination
                    </span>
                  </div>
                  <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                    Select 1 of 8 problems, draft 3 frontier tech cards, and pitch your deep problem understanding, root causes, and critique of existing solutions. Evaluated for 100 marks.
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
                    <p className="text-xs font-bold text-bwb-text">Round 2: Solution & Tech Architecture (100 Marks)</p>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30">
                      Top 8 Advance
                    </span>
                  </div>
                  <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                    Present your enhanced solution, novelty, and deep 3-card frontier tech integration. Evaluated for 100 marks. Top 8 squads advance to Grand Finals!
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
                    <p className="text-xs font-bold text-bwb-text">Round 3: Grand Finals & Championship Defense</p>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Top 4 Podium
                    </span>
                  </div>
                  <p className="text-[11px] text-bwb-muted mt-0.5 leading-relaxed">
                    Top 8 Finalists defend refined master architectures live on stage against judge Q&A. Top 4 teams win honors: 🥇 1st Place Champion, 🥈 2nd Place Runner-Up, and 🥉 Dual 3rd Place Bronze Winners.
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
          ) : null}
        </AnimatePresence>
      </motion.div>

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
