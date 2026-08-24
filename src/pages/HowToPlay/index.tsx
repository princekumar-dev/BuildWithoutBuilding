import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Award, Sparkles, User, ArrowLeft } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { getScoringCriteriaForRound } from '../../data/mockData'
import { useGameStore } from '../../store/gameStore'

const tournamentRounds = [
  {
    num: 'ROUND 01 · 100 PTS',
    title: 'Problem & Existing Landscape',
    badge: 'Zero Elimination · 45m Build',
    desc: 'Select 1 of 8 problems, draft 3 frontier tech cards, and pitch how deeply your team understands the problem root causes and limitations of existing alternatives. 45-minute build sprint. Evaluated for 100 pts. All squads advance to Round 2!',
    icon: '🚀',
  },
  {
    num: 'ROUND 02 · 100 PTS',
    title: 'Solution & Tech Architecture',
    badge: 'Top 8 Qualify · 30m Build',
    desc: 'Teams present how they enhance their solution, integrate all 3 surprise frontier tech cards, and deliver novel ideation and system flow. 30-minute build sprint. Evaluated for 100 pts. The Top 8 squads advance to the Grand Finals.',
    icon: '⚡',
  },
  {
    num: 'ROUND 03 · GRAND FINALS',
    title: 'Master Pitch & Stage Defense',
    badge: 'Top 4 Crowned · 30m Polish',
    desc: 'The Top 8 Finalists polish their master blueprints (30m) and defend live on stage against rigorous judge cross-examination. Top 4 positions receive Championship Honors: 🥇 1st Champion, 🥈 2nd Runner-Up, 🥉 Dual 3rd Bronze Winners.',
    icon: '🏆',
  },
]

const eventTimeline = [
  { phase: 'Registration & Kickoff', estTime: '20 Mins', desc: 'Squad roster check-in, room PIN entry, and opening tournament briefing.' },
  { phase: 'Round 1: Open Qualifier', estTime: '~1h 45m', desc: 'Problem & Card Reveal (10m) ➔ 45m Build Sprint ➔ Live Pitches (16 teams × ~2.5m) ➔ 100-Pt Deliberation & Leaderboard.' },
  { phase: 'Round 2: Solution Showdown', estTime: '~1h 30m', desc: 'Round 2 Briefing (10m) ➔ 30m Build Sprint ➔ Live Enhancement Pitches (16 teams) ➔ Top 8 Finalist Announcement.' },
  { phase: 'Finals Intermission', estTime: '15 Mins', desc: 'Stage transition, Top 8 Finalist briefing, and strategy prep.' },
  { phase: 'Round 3: Grand Finals', estTime: '~1h 15m', desc: '30m Master Blueprint Polish ➔ Live Stage Defense (8 Finalists) ➔ Final Deliberation & Championship Podium Ceremony.' },
]

const steps = [
  { num: '01', title: 'Join & Roster Entry (Manual Host Start)', desc: 'Enter the Room PIN provided by your host. Register your squad of 2–3 members and receive your unique Team Passcode.' },
  { num: '02', title: 'Problem Selection (8 Challenge Tracks)', desc: 'Select 1 of 8 Problem Statements (strictly max 2 teams per problem statement capacity in Round 2).' },
  { num: '03', title: 'Draft 3 Frontier Tech Cards', desc: 'Each team drafts 3 surprise frontier tech cards that must be incorporated into the architecture.' },
  { num: '04', title: 'Architecture Sprint (45m in R1 · 30m in R2/R3)', desc: 'Design your telemetry pipeline, system architecture, and solution proposal. Timer auto-advances to pitch when time expires.' },
  { num: '05', title: 'Live Pitch & Stage Defense', desc: 'Present your solution verbally on stage. Judges cross-examine your technical feasibility and system constraints.' },
  { num: '06', title: 'Jury Deliberation (100 Pts Rubric)', desc: 'The jury panel scores teams across the official 100-point rubric during live deliberation.' },
  { num: '07', title: 'Official Host Leaderboard Reveal', desc: 'Standings revealed on projector and player screens only when the Host triggers the official reveal!' },
]

const buildStrategies = [
  {
    round: 'How to Build in Round 1 (Problem Understanding)',
    focus: 'Problem Depth & Existing Landscape Critique',
    points: [
      'Deconstruct the root causes and specific user pain points rather than jumping straight to generic solutions.',
      'Critique existing market solutions and explain clearly why current alternatives fail or cannot scale.',
      'State your initial technical direction incorporating your 3 drafted frontier tech cards.',
    ],
  },
  {
    round: 'How to Build in Round 2 (Solution Enhancement)',
    focus: 'Architecture Novelty & 3-Card Tech Integration',
    points: [
      'Detail your enhanced solution architecture, system block diagram, and data telemetry flow.',
      'Demonstrate deep, seamless synergy of all 3 surprise frontier tech cards (not just surface-level buzzwords).',
      'Address scale, cost efficiency, and edge failover reliability to secure a spot in the Top 8 cut-off.',
    ],
  },
  {
    round: 'How to Build in Round 3 (Grand Finals)',
    focus: 'Master Blueprint & Live Defense Resilience',
    points: [
      'Refine your master end-to-end blueprint incorporating all feedback from Round 1 and Round 2.',
      'Prepare for adversarial judge questions on hardware BOM cost, offline sync, security, and edge latency.',
      'Deliver a concise, punchy championship pitch worthy of 1st, 2nd, or 3rd place podium honors.',
    ],
  },
]

const rubricRounds = [
  { id: 1 as const, name: 'Round 1', subtitle: 'Problem Understanding', icon: '🚀', badge: '100 Pts' },
  { id: 2 as const, name: 'Round 2', subtitle: 'Solution Architecture', icon: '⚡', badge: '100 Pts' },
  { id: 3 as const, name: 'Round 3', subtitle: 'Grand Finals Defense', icon: '🏆', badge: '100 Pts' },
]

export default function HowToPlayPage() {
  const [activeRubricRound, setActiveRubricRound] = useState<1 | 2 | 3>(1)
  const { session, game } = useGameStore()
  const hasActiveSession = !!session?.teamId

  const phaseRoutes: Record<string, string> = {
    LOBBY: '/lobby',
    PROBLEM_REVEAL: '/problem-select',
    CARD_REVEAL: '/card-reveal',
    BUILDING: '/game',
    SUBMISSION_LOCKED: '/game',
    PITCHING: '/pitch',
    JUDGE_ATTACK: '/pitch',
    JUDGING: '/judging',
    LEADERBOARD: '/leaderboard',
    RESULTS: '/leaderboard',
  }

  const activeGameRoute = (game?.phase && phaseRoutes[game.phase]) || '/lobby'
  const activePhaseName = game?.phase ? game.phase.replace('_', ' ') : 'LOBBY'

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-1 sm:px-4 pb-12">
        {/* Active Session Notification Header */}
        {hasActiveSession && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-bwb-accent/15 via-purple-500/10 to-bwb-surface border border-bwb-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bwb-accent/20 border border-bwb-accent/40 flex items-center justify-center text-bwb-accent font-bold shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-bwb-text flex items-center gap-2">
                  Signed in with Squad: <span className="text-bwb-accent">{session?.teamName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    {activePhaseName}
                  </span>
                </p>
                <p className="text-[11px] text-bwb-muted">
                  Your tournament session is active. You can review the rules and jump straight back to your squad anytime.
                </p>
              </div>
            </div>
            <Link to={activeGameRoute}>
              <Button size="sm" className="glow-accent text-xs font-bold shrink-0 shadow-md">
                <ArrowLeft size={14} className="mr-1" />
                Return to {game?.phase === 'LOBBY' ? 'Lobby' : 'Active Game'}
              </Button>
            </Link>
          </div>
        )}

        <Badge variant="accent" className="mb-4">Official Tournament Rules</Badge>
        <h1 className="font-display text-3xl sm:text-5xl font-black mb-3 text-gradient">
          3-Round Tournament System
        </h1>
        <p className="text-bwb-muted mb-8 sm:mb-10 leading-relaxed text-xs sm:text-base">
          BUILD WITHOUT BUILDING is a competitive architecture and technical innovation tournament. You don&apos;t write code — you design, architect, and defend real engineering solutions under strict constraints.
        </p>

        {/* 3-Round Tournament Progression */}
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-bwb-gold" size={22} />
          Tournament Progression Format
        </h2>
        <div className="grid md:grid-cols-3 gap-3.5 sm:gap-4 mb-10 sm:mb-12">
          {tournamentRounds.map((r) => (
            <Card key={r.num} padding="md" className="stereo-card border border-white/10 hover:border-purple-400/50 flex flex-col justify-between transition-all duration-300 group shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{r.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {r.badge}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
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


        {/* Tournament Schedule & Estimated Runtime */}
        <Card padding="lg" className="mb-12 border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-bwb-surface-2 to-bwb-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                ESTIMATED EVENT SCHEDULE
              </span>
              <h2 className="font-display text-xl font-black text-bwb-text flex items-center gap-2">
                ⏱️ Full Tournament Timeline (~4.5 to 5 Hours Total)
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 w-fit">
              16 Teams · 3 Rounds
            </span>
          </div>

          <div className="space-y-3">
            {eventTimeline.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-bwb-bg/70 border border-white/5 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <h4 className="font-display font-bold text-sm text-bwb-text">{item.phase}</h4>
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-mono font-bold bg-bwb-surface-2 text-cyan-300 border border-cyan-500/20 shrink-0">
                      {item.estTime}
                    </span>
                  </div>
                  <p className="text-xs text-bwb-muted mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* How to Build Without Building Strategy Guide */}
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-amber-400" size={22} />
          How to &quot;Build Without Building&quot; Across Rounds
        </h2>
        <div className="space-y-4 mb-12">
          {buildStrategies.map((strat, sIdx) => (
            <Card key={sIdx} padding="md" className="border-purple-500/20 bg-bwb-surface">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5">
                <h3 className="font-display font-bold text-sm sm:text-base text-bwb-text">
                  {strat.round}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
                  Focus: {strat.focus}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-bwb-muted">
                {strat.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="text-bwb-accent font-bold mt-0.5">▸</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
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
        <Card padding="lg" className="mb-10 border-bwb-accent/30 bg-gradient-to-b from-bwb-surface-2/80 to-bwb-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-bwb-accent font-bold">
                EVALUATION CRITERIA
              </span>
              <h2 className="font-display text-xl font-bold text-bwb-text">
                Official Scoring Rubric (100 Points Total)
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-bwb-accent/20 text-bwb-accent border border-bwb-accent/30 w-fit">
              100 Pts per Round
            </span>
          </div>

          {/* Round Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {rubricRounds.map((r) => {
              const active = activeRubricRound === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRubricRound(r.id)}
                  className={`p-2 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    active
                      ? 'bg-bwb-accent/20 border-bwb-accent text-white shadow-lg shadow-bwb-accent/10'
                      : 'bg-bwb-bg/50 border-white/5 text-bwb-muted hover:border-white/20 hover:text-bwb-text'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base sm:text-lg">{r.icon}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      active ? 'bg-bwb-accent/30 text-white' : 'bg-white/5 text-bwb-muted'
                    }`}>
                      {r.badge}
                    </span>
                  </div>
                  <div>
                    <p className={`font-display font-bold text-xs sm:text-sm leading-tight ${active ? 'text-white' : 'text-bwb-text'}`}>
                      {r.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-bwb-muted truncate hidden sm:block mt-0.5">
                      {r.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Criteria Cards */}
          <div className="space-y-2.5">
            {getScoringCriteriaForRound(activeRubricRound).map((item) => (
              <div
                key={item.key}
                className="p-3 sm:p-3.5 rounded-xl bg-bwb-bg/70 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-bwb-text">
                      {item.label}
                    </h4>
                    {item.desc && (
                      <p className="text-[11px] sm:text-xs text-bwb-muted mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/30 font-mono text-xs font-bold shrink-0 whitespace-nowrap">
                    {item.max} Pts
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-bwb-accent to-purple-400 h-full rounded-full"
                    style={{ width: `${item.max}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-bwb-muted">Total Evaluation Weight</span>
            <span className="font-bold text-bwb-accent text-sm">100 / 100 Points</span>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3 items-center">
          {hasActiveSession ? (
            <>
              <Link to={activeGameRoute}>
                <Button size="lg" className="glow-accent font-bold">
                  <ArrowLeft size={16} className="mr-2" />
                  Return to {game?.phase === 'LOBBY' ? 'Lobby' : 'Live Game'}
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="lg">Home</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/join"><Button size="lg">Join Tournament</Button></Link>
              <Link to="/"><Button variant="ghost" size="lg">Back Home</Button></Link>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

