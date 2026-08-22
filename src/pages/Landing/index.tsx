import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Lightbulb, PenTool, Cpu,
  Presentation, Calendar, Clock, MapPin,
  Play, Shield, Users, Radio, Globe, Trophy
} from 'lucide-react'

import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

const pillars = [
  {
    icon: Lightbulb,
    title: 'IDEATE',
    desc: 'Identify critical real-world problems across disaster, healthcare, and urban domains.',
    color: 'from-amber-500/20 to-amber-950/40',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    step: '01',
  },
  {
    icon: PenTool,
    title: 'DESIGN',
    desc: 'Select and integrate 3 randomized bleeding-edge technological constraints.',
    color: 'from-cyan-500/20 to-cyan-950/40',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
    step: '02',
  },
  {
    icon: Cpu,
    title: 'INNOVATE',
    desc: 'Engineer smart, resilient, and feasible system architectures without writing code.',
    color: 'from-purple-500/20 to-purple-950/40',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
    step: '03',
  },
  {
    icon: Presentation,
    title: 'PITCH',
    desc: 'Present your blueprint on stage, defend against judge attacks, and inspire the world.',
    color: 'from-emerald-500/20 to-emerald-950/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    step: '04',
  },
]

export default function LandingPage() {
  return (
    <PageLayout fullWidth className="overflow-x-hidden">
      {/* HERO SECTION WITH DEPARTMENT & MICROSOFT AI CLUB BRANDING */}
      <section className="relative pt-6 sm:pt-14 pb-8 sm:pb-14 px-4 sm:px-6 overflow-hidden">
        {/* Background Atmospheric Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-bwb-accent/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Department Title Header (Directly above Presenter Badge) */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-7">
              <div className="h-px w-10 sm:w-28 bg-gradient-to-r from-transparent via-amber-400/50 to-amber-400/80" />
              <span className="font-display font-black text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase text-amber-400/90 drop-shadow-md text-center">
                DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
              </span>
              <div className="h-px w-10 sm:w-28 bg-gradient-to-l from-transparent via-amber-400/50 to-amber-400/80" />
            </div>

            {/* Microsoft AI Club Emblem Badge */}
            <div className="inline-flex items-center gap-3.5 p-2 pr-6 rounded-full bg-bwb-surface-2/90 border border-amber-400/30 shadow-2xl backdrop-blur-xl mb-8 group hover:border-amber-400/60 transition-colors">
              <img
                src="/images/microsoft_ai_club_logo.jpg"
                alt="Microsoft AI Club"
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/60 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
              <div className="text-left">
                <p className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-black">
                  MICROSOFT AI CLUB
                </p>
                <p className="text-xs font-bold text-bwb-text tracking-wider">
                  PROUDLY PRESENTS
                </p>
              </div>
            </div>

            {/* Main Event Title */}
            <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none mb-6 text-center">
              BUILD <span className="text-gradient">WITHOUT</span>
              <br />
              <span className="text-bwb-text drop-shadow-2xl">BUILDING</span>
            </h1>

            {/* Official Tagline Pills */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-5 py-2 rounded-2xl bg-bwb-surface/80 border border-amber-400/30 text-amber-300 font-mono text-xs sm:text-sm font-black tracking-widest uppercase mb-8 shadow-lg">
              <span>THINK</span>
              <span className="text-bwb-muted">·</span>
              <span>DESIGN</span>
              <span className="text-bwb-muted">·</span>
              <span>SOLVE</span>
              <span className="text-bwb-muted">·</span>
              <span>IMPACT</span>
            </div>

            {/* Event Motto Quote Box */}
            <div className="max-w-2xl mx-auto mb-10 p-5 sm:p-6 rounded-3xl stereo-card border border-bwb-accent/30 bg-gradient-to-r from-cyan-950/30 via-bwb-surface to-purple-950/30 shadow-2xl relative text-center">
              <p className="font-display font-black text-base sm:text-xl text-bwb-text uppercase tracking-wide leading-relaxed">
                &ldquo;You don&apos;t need to build it to solve it.
                <br />
                <span className="text-gradient">All you need is an idea that can.</span>&rdquo;
              </p>
            </div>

            {/* Primary Calls to Action */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6 sm:mb-8">
              <Link to="/join" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:min-w-[200px] shadow-xl shadow-bwb-accent/25 hover:scale-105 transition-transform text-sm font-bold">
                  <Users size={18} className="mr-2" /> Enter Live Event <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center">
                <Link to="/projector" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:min-w-[180px] text-xs sm:text-sm font-bold border-bwb-accent/40 bg-bwb-surface-2/90 shadow-md">
                    <Radio size={16} className="mr-1.5 sm:mr-2 text-bwb-accent animate-pulse" /> Live Projector
                  </Button>
                </Link>

                <Link to="/how-to-play" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:min-w-[150px] text-xs sm:text-sm font-bold border-white/10 hover:border-white/25 bg-bwb-surface-2/90 shadow-md">
                    <Globe size={16} className="mr-1.5 sm:mr-2 text-amber-400" /> How to Play
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. EVENT LOGISTICS & SCHEDULE CARD */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 mb-12 sm:mb-20 mt-4 sm:mt-8">
        <div className="stereo-card rounded-3xl p-5 sm:p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-bwb-surface-2 to-bwb-surface relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />



          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Date */}
            <div className="flex items-start gap-4 pt-3 md:pt-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Calendar size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-bwb-muted font-bold">EVENT DATE</p>
                <h4 className="font-display font-black text-xl sm:text-2xl text-bwb-text">24th August</h4>
                <p className="text-xs text-bwb-muted mt-0.5">Annual Technical Flagship</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-4 pt-3 md:pt-0 md:pl-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Clock size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-bwb-muted font-bold">TIMINGS</p>
                <h4 className="font-display font-black text-xl sm:text-2xl text-bwb-text">12:00 PM – 4:30 PM</h4>
                <p className="text-xs text-bwb-muted mt-0.5">Lunch: 1:10 PM – 2:00 PM</p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-4 pt-3 md:pt-0 md:pl-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                <MapPin size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-bwb-muted font-bold">VENUE</p>
                <h4 className="font-display font-black text-lg sm:text-xl text-bwb-text">AD 5, 6 LAB</h4>
                <p className="text-xs text-bwb-muted mt-0.5">Main Block · 3rd Floor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 PILLARS OF COMPETITION */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 mb-12 sm:mb-24">
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="purple" className="mb-2 sm:mb-3">Event Architecture</Badge>
          <h2 className="font-display text-2xl sm:text-5xl font-black text-bwb-text">
            Four Stages of Engineering
          </h2>
          <p className="text-xs sm:text-sm text-bwb-muted max-w-xl mx-auto mt-1 sm:mt-2">
            Teams navigate through high-pressure phases designed to test rapid problem solving and system thinking.
          </p>
        </div>


        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ icon: Icon, title, desc, color, border, text, step }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.2 }}
            >
              <div className={`h-full rounded-3xl p-6 border ${border} bg-gradient-to-b ${color} stereo-card flex flex-col justify-between shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-bwb-bg/70 border border-white/10 flex items-center justify-center ${text} shadow-inner`}>
                      <Icon size={24} />
                    </div>
                    <span className="font-mono text-xs font-black text-bwb-muted/60">{step}</span>
                  </div>

                  <h3 className={`font-display font-black text-xl mb-2 ${text}`}>{title}</h3>
                  <p className="text-xs sm:text-sm text-bwb-muted leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4.5 TOURNAMENT MATCH FLOW BREAKDOWN */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="stereo-card rounded-3xl p-6 sm:p-8 border-2 border-bwb-accent/30 bg-gradient-to-br from-purple-950/30 via-bwb-surface-2 to-bwb-surface shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-widest mb-2">
              <Trophy size={14} className="text-amber-400" /> Official Championship Match Flow
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-bwb-text">
              3-Round Tournament Progression
            </h2>
            <p className="text-xs sm:text-sm text-bwb-muted max-w-lg mx-auto mt-1">
              From open qualification to the 8-problem showdown and grand championship podium.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Round 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-bwb-surface border border-purple-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🚀</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    No Elimination
                  </span>
                </div>
                <p className="text-[10px] font-mono text-bwb-muted uppercase font-bold">ROUND 01</p>
                <h3 className="font-display font-bold text-base text-bwb-text mb-1">Open Qualifier</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  All registered squads receive tech cards, formulate system blueprints, and pitch on stage. All squads advance!
                </p>
              </div>
            </div>

            {/* Round 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-bwb-surface border border-bwb-accent/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⚡</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30">
                    Top 8 Qualify
                  </span>
                </div>
                <p className="text-[10px] font-mono text-bwb-muted uppercase font-bold">ROUND 02</p>
                <h3 className="font-display font-bold text-base text-bwb-text mb-1">8 Challenges Showdown</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  8 real-world challenge tracks (strictly max 2 teams per problem). Top 8 ranked squads punch their ticket to the Finals.
                </p>
              </div>
            </div>

            {/* Round 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-bwb-surface border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🏆</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Top 4 Awarded
                  </span>
                </div>
                <p className="text-[10px] font-mono text-bwb-muted uppercase font-bold">ROUND 03</p>
                <h3 className="font-display font-bold text-base text-bwb-text mb-1">Grand Finals & Podium</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  Top 8 battle on stage. Top 4 teams awarded: 🥇 1st Champion, 🥈 2nd Runner-Up, 🥉 3rd Dual Bronze Winners!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROLE PORTALS QUICK ACCESS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <Card glow padding="lg" className="text-center border-bwb-accent/30 bg-gradient-to-br from-bwb-surface-2 to-bwb-surface">

          <h2 className="font-display text-2xl sm:text-4xl font-black mb-3">
            Enter Your Competition Station
          </h2>
          <p className="text-bwb-muted mb-8 max-w-xl mx-auto text-xs sm:text-sm">
            Whether you are competing, hosting the session, scoring as a judge, or projecting to the auditorium screen.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <Link to="/join" className="block">
              <Button fullWidth size="lg" className="font-bold">
                <Users size={16} className="mr-2" /> Participant
              </Button>
            </Link>
            <Link to="/projector" className="block">
              <Button fullWidth size="lg" variant="secondary" className="font-bold">
                <Radio size={16} className="mr-2 text-bwb-accent" /> Projector
              </Button>
            </Link>
            <Link to="/host/login" className="block">
              <Button fullWidth size="lg" variant="secondary" className="font-bold">
                <Play size={16} className="mr-2" /> Host Ops
              </Button>
            </Link>
            <Link to="/judge/login" className="block">
              <Button fullWidth size="lg" variant="secondary" className="font-bold">
                <Shield size={16} className="mr-2 text-purple-400" /> Judge Room
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* 6. SOCIALS & FOOTER */}
      <footer className="border-t border-bwb-border bg-bwb-surface/90 py-12 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/microsoft_ai_club_logo.jpg"
              alt="Microsoft AI Club Logo"
              className="w-9 h-9 rounded-full object-cover border border-amber-400/40"
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
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors font-medium"
            >
              <Globe size={15} /> <span>@microsoftaiclub_msec</span>
            </a>
            <span className="hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-bwb-muted">#BuildWithoutBuilding</span>
              <span className="text-[11px] font-mono text-bwb-muted">#ThinkDesignImpact</span>
              <span className="text-[11px] font-mono text-bwb-muted">#InnovationStartsHere</span>
            </div>
          </div>

          <p className="text-[11px] text-bwb-muted/60 pt-4">
            Department of Artificial Intelligence & Data Science
          </p>
        </div>
      </footer>
    </PageLayout>
  )
}
