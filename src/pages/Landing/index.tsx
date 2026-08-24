import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, Lightbulb, PenTool, Cpu,
  Presentation, Calendar, Clock, MapPin,
  Play, Shield, Users, Globe, Trophy, ChevronDown,
  Sparkles, Layers, Terminal, Tv, Zap, Award
} from 'lucide-react'

import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

const pillars = [
  {
    icon: Lightbulb,
    title: 'IDEATE',
    subtitle: 'Problem Formulation',
    desc: 'Identify critical real-world problems across disaster response, healthcare, infrastructure, and urban sustainability domains.',
    color: 'from-amber-500/20 via-amber-950/30 to-bwb-surface-2',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    glow: 'shadow-[0_12px_36px_rgba(251,191,36,0.12)]',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    step: '01',
  },
  {
    icon: PenTool,
    title: 'DESIGN',
    subtitle: 'Frontier Tech Integration',
    desc: 'Select and integrate 3 randomized bleeding-edge technological constraints into a unified, high-cohesion architecture.',
    color: 'from-cyan-500/20 via-cyan-950/30 to-bwb-surface-2',
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    glow: 'shadow-[0_12px_36px_rgba(0,229,199,0.12)]',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    step: '02',
  },
  {
    icon: Cpu,
    title: 'INNOVATE',
    subtitle: 'System Architecture',
    desc: 'Engineer telemetry data flows, edge-resilient pipelines, failover topologies, and compute blueprints without writing a line of code.',
    color: 'from-purple-500/20 via-purple-950/30 to-bwb-surface-2',
    border: 'border-purple-500/30 hover:border-purple-400/60',
    glow: 'shadow-[0_12px_36px_rgba(167,139,250,0.12)]',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    step: '03',
  },
  {
    icon: Presentation,
    title: 'PITCH',
    subtitle: 'Live Stage Defense',
    desc: 'Present your architectural blueprint verbally on stage, survive adversarial judge cross-examination, and claim championship podium honors.',
    color: 'from-emerald-500/20 via-emerald-950/30 to-bwb-surface-2',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    glow: 'shadow-[0_12px_36px_rgba(34,197,94,0.12)]',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    step: '04',
  },
]

const features = [
  {
    icon: Terminal,
    title: 'Zero Code. 100% Architecture.',
    desc: 'No compilers, IDEs, or syntax traps. Focus 100% on high-level system thinking, distributed schemas, and structural problem solving.',
    tag: 'Pure Engineering',
  },
  {
    icon: Zap,
    title: 'Frontier Tech Constraints',
    desc: 'Teams draft 3 frontier technology cards (Edge AI, Quantum Mesh, Neuromorphic Vision, etc.) that must be organically synthesized.',
    tag: 'Constraint Driven',
  },
  {
    icon: Shield,
    title: 'Adversarial Judge Defense',
    desc: 'Defend your BOM cost, latency limits, offline synchrony, and security posture against demanding live cross-examination.',
    tag: 'Stage Defense',
  },
  {
    icon: Tv,
    title: 'Live Arena Synchronization',
    desc: 'Real-time sync connecting contestant control panels, judge scoring rubrics, host orchestration, and auditorium big-screen projector.',
    tag: 'Auditorium Sync',
  },
]

const tagline = ['THINK', 'DESIGN', 'SOLVE', 'IMPACT'] as const

const particles = [
  { left: '10%', delay: '0s', duration: '8s' },
  { left: '24%', delay: '1.4s', duration: '10s' },
  { left: '42%', delay: '0.6s', duration: '9s' },
  { left: '58%', delay: '2.2s', duration: '11s' },
  { left: '74%', delay: '0.9s', duration: '8.5s' },
  { left: '88%', delay: '1.8s', duration: '12s' },
  { left: '94%', delay: '3.1s', duration: '10.5s' },
]

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return
    const node = heroRef.current
    if (!node) return
    const bounds = node.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    node.style.setProperty('--mx', `${x}%`)
    node.style.setProperty('--my', `${y}%`)
  }

  const ease = [0.22, 1, 0.36, 1] as const
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  }
  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 24, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: reduceMotion ? 0 : 0.65, ease },
    },
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={handlePointerMove}
      className="hero-stage relative pt-8 sm:pt-16 pb-12 sm:pb-20 px-3 sm:px-6 overflow-hidden"
    >
      <div className="hero-grid absolute inset-0 pointer-events-none opacity-85" />
      <div className="hero-spotlight absolute inset-0 pointer-events-none" />
      <div className="hero-orb hero-orb-cyan absolute top-[6%] left-[6%] w-72 h-72 sm:w-[32rem] sm:h-[32rem]" />
      <div className="hero-orb hero-orb-purple absolute top-[16%] right-[4%] w-80 h-80 sm:w-[36rem] sm:h-[36rem]" />
      <div className="hero-orb hero-orb-amber absolute bottom-[6%] left-1/2 -translate-x-1/2 w-64 h-64 sm:w-[28rem] sm:h-[28rem]" />
      <div className="hero-orb hero-orb-emerald absolute bottom-[18%] left-[12%] w-56 h-56 sm:w-[24rem] sm:h-[24rem]" />

      {!reduceMotion && particles.map((particle) => (
        <span
          key={particle.left}
          className="hero-particle hidden sm:block"
          style={{ left: particle.left, bottom: '6%', animationDelay: particle.delay, animationDuration: particle.duration }}
        />
      ))}

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Department Banner Header */}
          <motion.div variants={item} className="flex items-center justify-center gap-2 sm:gap-6 mb-6">
            <div className="hero-rule w-8 sm:w-28" />
            <span className="font-display font-black text-[10px] sm:text-xs md:text-sm tracking-[0.18em] sm:tracking-[0.3em] uppercase text-amber-400/95 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)] text-center">
              DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
            </span>
            <div className="hero-rule w-8 sm:w-28" />
          </motion.div>

          {/* Microsoft AI Club Pill Badge */}
          <motion.div variants={item} className="mb-6 sm:mb-8 flex justify-center">
            <div className="inline-flex items-center gap-3 p-1.5 pr-5 sm:p-2 sm:pr-6 rounded-full bg-bwb-surface-2/85 border border-amber-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(251,191,36,0.15)] backdrop-blur-2xl group hover:border-amber-400/75 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_32px_rgba(251,191,36,0.25)] transition-all duration-300">
              <motion.img
                src="/images/microsoft_ai_club_logo.jpg"
                alt="Microsoft AI Club"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400/70 shadow-md"
                animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
              <div className="text-left">
                <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-amber-400 font-black">
                  MICROSOFT AI CLUB
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-bwb-text tracking-wider">
                  PROUDLY PRESENTS
                </p>
              </div>
            </div>
          </motion.div>

          {/* Monumental Headline */}
          <motion.h1
            variants={item}
            className="font-display font-black text-4xl sm:text-7xl md:text-8xl tracking-tight leading-[0.92] mb-6 text-center"
          >
            <span className="block text-bwb-text drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)]">
              BUILD WITHOUT
            </span>
            <span className="hero-title-shimmer drop-shadow-[0_10px_35px_rgba(0,229,199,0.3)]">BUILDING</span>
          </motion.h1>

          {/* Tagline Pill */}
          <motion.div
            variants={item}
            className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-full bg-bwb-surface-2/80 border border-amber-400/35 text-amber-300 font-mono text-[11px] sm:text-sm font-black tracking-[0.22em] uppercase mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            {tagline.map((word, index) => (
              <span key={word} className="inline-flex items-center gap-2 sm:gap-3">
                <motion.span
                  animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.4, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {word}
                </motion.span>
                {index < tagline.length - 1 && <span className="text-amber-500/70">•</span>}
              </span>
            ))}
          </motion.div>

          {/* Key Metric Highlights Chips */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl mx-auto mb-8 text-xs font-mono"
          >
            <span className="px-3 py-1.5 rounded-xl bg-bwb-surface-2/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-md">
              <Cpu size={14} className="text-cyan-400" /> Zero Code Required
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-bwb-surface-2/90 border border-purple-500/30 text-purple-300 flex items-center gap-1.5 shadow-md">
              <Layers size={14} className="text-purple-400" /> 3 Intense Rounds
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-bwb-surface-2/90 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 shadow-md">
              <Trophy size={14} className="text-amber-400" /> 100 Pts Rubric
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-bwb-surface-2/90 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 shadow-md">
              <Users size={14} className="text-emerald-400" /> 16 Squads Showdown
            </span>
          </motion.div>

          {/* Quote Card with Animated Border */}
          <motion.div
            variants={item}
            className="hero-quote-glow max-w-2xl mx-auto mb-10 p-5 sm:p-7 rounded-3xl stereo-card bg-gradient-to-r from-cyan-950/40 via-bwb-surface/90 to-purple-950/40 shadow-2xl relative text-center overflow-hidden"
          >
            <div className="absolute inset-0 shimmer pointer-events-none opacity-40" />
            <p className="relative font-display font-black text-base sm:text-xl text-bwb-text uppercase tracking-wide leading-relaxed">
              &ldquo;You don&apos;t need to build it to solve it.
              <br />
              <span className="text-gradient">All you need is an idea that can.</span>&rdquo;
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Link to="/join" className="w-full sm:w-auto">
              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="w-full sm:min-w-[230px] hero-cta-glow text-sm font-bold shadow-xl">
                  <span className="relative mr-2 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-bwb-bg/70 animate-ping opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bwb-bg" />
                  </span>
                  <Users size={18} className="mr-2" /> Enter Live Event <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </motion.div>
            </Link>

            <Link to="/how-to-play" className="w-full sm:w-auto">
              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:min-w-[180px] text-xs sm:text-sm font-bold border-amber-400/40 hover:border-amber-300/80 bg-bwb-surface-2/90 shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:bg-amber-400/10"
                >
                  <Globe size={16} className="mr-1.5 sm:mr-2 text-amber-400" /> Tournament Rules
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Scroll Cue */}
          <motion.a
            variants={item}
            href="#event-details"
            className="hero-scroll-cue inline-flex flex-col items-center gap-1 text-[10px] font-mono uppercase tracking-[0.28em] text-bwb-muted hover:text-bwb-accent transition-colors cursor-pointer"
          >
            Explore Event Details
            <ChevronDown size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <PageLayout fullWidth className="overflow-x-hidden">
      <HeroSection />

      {/* 2. EVENT LOGISTICS & SCHEDULE CARD */}
      <section id="event-details" className="max-w-6xl mx-auto px-3 sm:px-6 mb-16 sm:mb-24 mt-2 sm:mt-6 scroll-mt-24">
        <div className="stereo-card rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl bg-gradient-to-br from-bwb-surface-2/95 via-bwb-surface to-bwb-surface-2/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            {/* Date */}
            <div className="flex items-start gap-4 pt-3 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">OFFICIAL DATE</p>
                <h4 className="font-display font-black text-xl sm:text-2xl text-bwb-text">1st September</h4>
                <p className="text-xs text-bwb-muted mt-0.5">First Annual Technical Flagship</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">TIMINGS</p>
                <h4 className="font-display font-black text-xl sm:text-2xl text-bwb-text">11:30 AM – 4:30 PM</h4>
                <p className="text-xs text-bwb-muted mt-0.5">Lunch: 1:10 PM – 2:00 PM</p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">VENUE</p>
                <h4 className="font-display font-black text-lg sm:text-xl text-bwb-text">AD 1, 2 LAB</h4>
                <p className="text-xs text-bwb-muted mt-0.5">Main Block · 2nd Floor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY BUILD WITHOUT BUILDING? (USP / ARCHITECTURE MATRIX) */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 mb-16 sm:mb-24">
        <div className="text-center mb-10 sm:mb-14">
          <Badge variant="accent" className="mb-2 sm:mb-3">Tournament Philosophy</Badge>
          <h2 className="font-display text-2xl sm:text-5xl font-black text-bwb-text">
            Why &ldquo;Build Without Building&rdquo;?
          </h2>
          <p className="text-xs sm:text-sm text-bwb-muted max-w-xl mx-auto mt-2 leading-relaxed">
            The world doesn&apos;t just need programmers — it needs visionary systems architects who can conceptualize solutions under real-world pressure.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: 0.08 * idx }}
              >
                <div className="h-full rounded-3xl p-5 sm:p-6 stereo-card border border-white/10 hover:border-bwb-accent/40 bg-gradient-to-b from-bwb-surface-2 to-bwb-surface flex flex-col justify-between group transition-all duration-300">
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-bwb-accent/15 border border-bwb-accent/30 text-bwb-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-bwb-accent block mb-1">
                      {f.tag}
                    </span>
                    <h3 className="font-display font-bold text-base text-bwb-text mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-bwb-muted leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* 4. THE 4 PILLARS OF COMPETITION */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 mb-16 sm:mb-24">
        <div className="text-center mb-10 sm:mb-14">
          <Badge variant="purple" className="mb-2 sm:mb-3">Event Architecture</Badge>
          <h2 className="font-display text-2xl sm:text-5xl font-black text-bwb-text">
            Four Stages of Engineering
          </h2>
          <p className="text-xs sm:text-sm text-bwb-muted max-w-xl mx-auto mt-2 leading-relaxed">
            Teams navigate through high-pressure phases designed to test rapid problem solving and system thinking.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ icon: Icon, title, subtitle, desc, color, border, text, badge, glow, step }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
            >
              <div className={`h-full rounded-3xl p-6 border ${border} bg-gradient-to-b ${color} stereo-card flex flex-col justify-between ${glow} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-bwb-bg/80 border border-white/10 flex items-center justify-center ${text} shadow-inner`}>
                      <Icon size={24} />
                    </div>
                    <span className="font-mono text-xs font-black text-bwb-muted/60">{step}</span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badge} inline-block mb-2`}>
                    {subtitle}
                  </span>
                  <h3 className={`font-display font-black text-xl mb-2 ${text}`}>{title}</h3>
                  <p className="text-xs sm:text-sm text-bwb-muted leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. TOURNAMENT MATCH FLOW BREAKDOWN */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 mb-16 sm:mb-24">
        <div className="stereo-card rounded-3xl p-6 sm:p-10 border-2 border-bwb-accent/30 bg-gradient-to-br from-purple-950/30 via-bwb-surface-2 to-bwb-surface shadow-2xl">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-widest mb-2.5">
              <Trophy size={14} className="text-amber-400" /> Official Championship Match Flow
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-bwb-text">
              3-Round Tournament Progression
            </h2>
            <p className="text-xs sm:text-sm text-bwb-muted max-w-lg mx-auto mt-2 leading-relaxed">
              From open qualification to the 8-problem showdown and grand championship podium.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Round 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-bwb-surface border border-purple-500/30 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🚀</span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Zero Elimination · 45m Build
                  </span>
                </div>
                <p className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider mb-1">ROUND 01 · OPEN QUALIFIER</p>
                <h3 className="font-display font-bold text-lg text-bwb-text mb-2">Problem Depth & Landscape</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  All 16 squads draft surprise frontier tech cards, formulate system blueprints, and pitch. Zero elimination — all squads advance to Round 2!
                </p>
              </div>
            </div>

            {/* Round 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-bwb-surface border border-bwb-accent/40 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">⚡</span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30">
                    8 Problem Champions Qualify
                  </span>
                </div>
                <p className="text-[10px] font-mono text-bwb-accent uppercase font-bold tracking-wider mb-1">ROUND 02 · 1v1 SHOWDOWN</p>
                <h3 className="font-display font-bold text-lg text-bwb-text mb-2">Head-to-Head Track Battle</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  Direct 1v1 duel against the rival squad on your Problem Statement. The winner of each problem track advances to the Finals (8 Champions).
                </p>
              </div>
            </div>

            {/* Round 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-bwb-surface border border-amber-500/40 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🏆</span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Top 4 Awarded · 30m Polish
                  </span>
                </div>
                <p className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider mb-1">ROUND 03 · GRAND FINALS</p>
                <h3 className="font-display font-bold text-lg text-bwb-text mb-2">Grand Finals & Podium</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  The 8 Problem Champions defend live on stage against jury attacks. Top 4 squads crowned: 🥇 1st Champion, 🥈 Runner-Up, 🥉 Dual 3rd Place!
                </p>
              </div>
            </div>
          </div>

          {/* Podium Honors Showcase */}
          <div className="p-4 sm:p-5 rounded-2xl bg-bwb-bg/80 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <Award size={22} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-bwb-text">Tournament Podium Honors</h4>
                <p className="text-xs text-bwb-muted">1st Place Champion · 2nd Place Runner-Up · Dual 3rd Place Bronze Winners</p>
              </div>
            </div>
            <Link to="/how-to-play">
              <Button size="sm" variant="secondary" className="border-amber-400/40 text-xs font-bold shrink-0">
                View 100-Point Scoring Rubric <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ROLE PORTALS QUICK ACCESS */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 mb-16 sm:mb-24">
        <Card glow padding="lg" className="border-bwb-accent/30 bg-gradient-to-br from-bwb-surface-2 via-bwb-surface to-bwb-surface-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bwb-accent/15 border border-bwb-accent/30 text-bwb-accent text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} /> Multi-Role Hub
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black mb-3 text-bwb-text">
            Enter Your Competition Station
          </h2>
          <p className="text-bwb-muted mb-8 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Whether you are competing, hosting the session, scoring as a judge, or projecting to the auditorium screen.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
            <Link to="/join" className="block">
              <Button fullWidth size="lg" className="font-bold shadow-lg shadow-bwb-accent/20">
                <Users size={16} className="mr-2" /> Participant Entry
              </Button>
            </Link>
            <Link to="/host/login" className="block">
              <Button fullWidth size="lg" variant="secondary" className="font-bold border-amber-400/30 hover:border-amber-400/60">
                <Play size={16} className="mr-2 text-amber-400" /> Host Ops
              </Button>
            </Link>
            <Link to="/judge/login" className="block">
              <Button fullWidth size="lg" variant="secondary" className="font-bold border-purple-400/30 hover:border-purple-400/60">
                <Shield size={16} className="mr-2 text-purple-400" /> Judge Room
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* 7. SOCIALS & FOOTER */}
      <footer className="border-t border-white/10 bg-bwb-surface/95 backdrop-blur-xl py-12 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/microsoft_ai_club_logo.jpg"
              alt="Microsoft AI Club Logo"
              className="w-10 h-10 rounded-full object-cover border border-amber-400/50 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <span className="font-display font-black text-base tracking-wider text-bwb-text uppercase">
              Microsoft AI Club
            </span>
          </div>

          <p className="text-xs font-mono font-bold text-amber-400 tracking-wider">
            LET&apos;S BUILD THE FUTURE TOGETHER!
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-bwb-muted text-xs sm:text-sm pt-2">
            <a
              href="https://instagram.com/microsoftaiclub_msec"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors font-medium px-3 py-1 rounded-xl bg-bwb-surface-2 border border-white/5 hover:border-amber-400/30"
            >
              <Globe size={15} /> <span>@microsoftaiclub_msec</span>
            </a>
            <span className="hidden sm:inline">·</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-mono text-bwb-muted/80">#BuildWithoutBuilding</span>
              <span className="text-[11px] font-mono text-bwb-muted/80">#ThinkDesignImpact</span>
              <span className="text-[11px] font-mono text-bwb-muted/80">#InnovationStartsHere</span>
            </div>
          </div>

          <p className="text-[11px] text-bwb-muted/60 pt-4 font-mono">
            Department of Artificial Intelligence & Data Science · Meenakshi Sundararajan Engineering College
          </p>
        </div>
      </footer>
    </PageLayout>
  )
}
