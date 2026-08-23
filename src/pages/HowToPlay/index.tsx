import { Link } from 'react-router-dom'
import { Trophy, Award, Sparkles } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const tournamentRounds = [
  {
    num: 'ROUND 01 · 100 MARKS',
    title: 'Problem & Existing Landscape',
    badge: 'Zero Elimination',
    desc: 'Select 1 of 8 problems, draft 3 frontier tech cards, and pitch how deeply your team understands the problem statement, root causes, and limitations of existing solutions. Evaluated for 100 marks. Zero elimination — all teams advance!',
    icon: '🚀',
  },
  {
    num: 'ROUND 02 · 100 MARKS',
    title: 'Solution & Tech Architecture',
    badge: 'Top 8 Qualify for Finals',
    desc: 'Teams present how they enhance their solution, integrate all 3 surprise frontier tech cards, and deliver novel ideation and system architecture. Evaluated for 100 marks. The Top 8 squads advance to the Grand Finals.',
    icon: '⚡',
  },
  {
    num: 'ROUND 03 · GRAND FINALS',
    title: 'Master Pitch & Stage Defense',
    badge: 'Top 4 Crowned on Podium',
    desc: 'The Top 8 Finalists defend their master architectures live on stage against rigorous judge Q&A. The top 4 positions receive Championship Honors: 🥇 1st Place (1 Champion), 🥈 2nd Place (1 Runner-Up), and 🥉 3rd Place (2 Joint Bronze Winners).',
    icon: '🏆',
  },
]

const steps = [
  { num: '01', title: 'Join & Roster Entry', desc: 'Enter the Room PIN provided by your host. Register your squad of 2–3 members and receive your unique Team Passcode.' },
  { num: '02', title: 'Pick Your Challenge', desc: 'Select 1 of 8 Problem Statements (strictly max 2 teams per problem statement capacity).' },
  { num: '03', title: 'Draft 3 Tech Cards', desc: 'Each team drafts 3 surprise frontier tech cards that must be incorporated into the architecture.' },
  { num: '04', title: '15m Build Architecture Sprint', desc: 'Round 1 focuses on problem understanding and existing solution landscape; Round 2 focuses on enhanced solution architecture and 3-card tech integration.' },
  { num: '05', title: '60s Live Pitch & 20s Defense', desc: 'Present your solution verbally on stage. When the timer ends, defend against targeted technical judge attacks.' },
  { num: '06', title: 'Judging Deliberation (100 Marks)', desc: 'The jury panel scores teams across the official 100-mark rubric during live deliberation.' },
  { num: '07', title: 'Rankings & Championship Podium', desc: 'Standings revealed! Round 1 (Zero elimination), Round 2 (Top 8 qualify), Round 3 (Top 4 awarded 1st, 2nd, and dual 3rd prizes).' },
]

const rubric = [
  { label: 'Problem Understanding & Landscape (Round 1 Focus)', pts: 30 },
  { label: 'Novelty & Architecture Ideation (Round 2 Focus)', pts: 20 },
  { label: '3-Card Frontier Tech Integration', pts: 20 },
  { label: 'Technical Feasibility & Edge Flow', pts: 15 },
  { label: 'Pitch Presentation Clarity', pts: 10 },
  { label: 'Judge Q&A Defense', pts: 5 },
]

export default function HowToPlayPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-1 sm:px-4 pb-12">
        <Badge variant="accent" className="mb-4">Official Tournament Rules</Badge>
        <h1 className="font-display text-3xl sm:text-5xl font-black mb-3 text-gradient">
          3-Round Tournament System
        </h1>
        <p className="text-bwb-muted mb-8 sm:mb-10 leading-relaxed text-xs sm:text-base">
          BUILD WITHOUT BUILDING is a competitive architecture and technical innovation tournament. You don&apos;t write code — you design, architect, and defend real engineering solutions under strict constraints.
        </p>

        {/* 3-Round Tournament Overview */}
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-bwb-gold" size={22} />
          Tournament Progression Format
        </h2>
        <div className="grid md:grid-cols-3 gap-3.5 sm:gap-4 mb-10 sm:mb-12">
          {tournamentRounds.map((r) => (
            <Card key={r.num} padding="md" className="border-purple-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {r.badge}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold block mb-1">
                  {r.num}
                </span>
                <h3 className="font-display font-bold text-base text-bwb-text mb-2">
                  {r.title}
                </h3>
                <p className="text-xs text-bwb-muted leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>


        {/* Prize Distribution Card */}
        <Card padding="lg" className="mb-12 border-bwb-gold/30 bg-gradient-to-r from-amber-950/20 via-bwb-surface-2 to-bwb-surface">
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-bwb-gold">
            <Award size={20} />
            Final Prize Distribution (Top 4 Awarded)
          </h2>
          <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-bwb-gold/60 text-bwb-gold">
              <p className="font-black text-sm mb-1">🥇 1st Place (1 Team)</p>
              <p className="text-bwb-text text-[11px] font-sans font-medium">Grand Tournament Champion</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-500/15 border border-slate-400/60 text-slate-200">
              <p className="font-black text-sm mb-1">🥈 2nd Place (1 Team)</p>
              <p className="text-bwb-text text-[11px] font-sans font-medium">Official Runner-Up</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-800/20 border border-amber-600/60 text-amber-400">
              <p className="font-black text-sm mb-1">🥉 3rd Place (2 Teams)</p>
              <p className="text-bwb-text text-[11px] font-sans font-medium">Two Joint Bronze Winners</p>
            </div>
          </div>
        </Card>

        {/* Step-by-Step Flow */}
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-bwb-accent" size={18} />
          Match Flow (How Each Round Works)
        </h2>
        <div className="space-y-3 mb-12">
          {steps.map((step) => (
            <Card key={step.num} padding="md" className="flex items-start gap-4">
              <span className="font-display text-xl font-bold text-bwb-accent/50 shrink-0 mt-0.5">{step.num}</span>
              <div>
                <h3 className="font-display font-semibold text-sm text-bwb-text mb-0.5">{step.title}</h3>
                <p className="text-xs text-bwb-muted leading-relaxed">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Rubric */}
        <Card padding="lg" className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4">Official Scoring Rubric (100 Points Total)</h2>
          <div className="space-y-2">
            {rubric.map((r) => (
              <div key={r.label} className="flex justify-between text-xs sm:text-sm py-1.5 border-b border-bwb-border last:border-0">
                <span className="text-bwb-muted font-medium">{r.label}</span>
                <span className="font-display font-bold text-bwb-accent">{r.pts} pts</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Link to="/join"><Button size="lg">Join Tournament</Button></Link>
          <Link to="/"><Button variant="ghost" size="lg">Back Home</Button></Link>
        </div>
      </div>
    </PageLayout>
  )
}

