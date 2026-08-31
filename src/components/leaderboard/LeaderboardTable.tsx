import React, { useState } from 'react'
import { Swords, Layers, ChevronDown, ChevronUp, BarChart3, Sparkles, Target } from 'lucide-react'
import type { Team } from '../../types'
import { getScoringCriteriaForRound } from '../../data/mockData'

interface LeaderboardTableProps {
  teams: Team[]
  highlightTeamId?: string
  compact?: boolean
  showMovement?: boolean
  round?: number
  isFinalResults?: boolean
}

const PROBLEM_NAMES: Record<string, { title: string; category: string; icon: string }> = {
  p1: { title: 'Emergency Response Without Internet', category: 'Disaster Response', icon: '🚨' },
  p2: { title: "The City That Can't Predict Traffic", category: 'Urban Mobility', icon: '🚦' },
  p3: { title: 'Find the Water Before It Runs Out', category: 'Water Management', icon: '💧' },
  p4: { title: 'The Hospital Waiting Room', category: 'Healthcare', icon: '🏥' },
  p5: { title: 'The Waste Nobody Wants to Pick Up', category: 'Waste Management', icon: '♻️' },
  p6: { title: "The Farmer Who Doesn't Know What's Coming", category: 'Agriculture', icon: '🌾' },
  p7: { title: 'Where Did the Bus Go?', category: 'Public Transport', icon: '🚌' },
  p8: { title: "The City That Doesn't Notice Its Problems", category: 'Civic Infrastructure', icon: '🏙️' },
}

export function LeaderboardTable({
  teams,
  highlightTeamId,
  compact,
  showMovement = true,
  round = 1,
  isFinalResults = false,
}: LeaderboardTableProps) {
  const [viewMode, setViewMode] = useState<'ranks' | 'duels'>(round === 2 ? 'duels' : 'ranks')
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(highlightTeamId || null)
  const sorted = [...teams].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
  const criteria = getScoringCriteriaForRound(round)

  // Group teams by problem statement for Round 2 Duels View
  const problemKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId))
  }

  return (
    <div className="space-y-4">
      {/* View Switcher for Round 2 */}
      {round === 2 && !compact && (
        <div className="flex items-center justify-between bg-bwb-surface-2/80 p-1.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('duels')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'duels'
                  ? 'bg-bwb-accent text-bwb-bg shadow-sm'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-white/5'
              }`}
            >
              <Swords size={14} />
              <span>8 Problem Showdown Duels (1v1)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ranks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'ranks'
                  ? 'bg-bwb-accent text-bwb-bg shadow-sm'
                  : 'text-bwb-muted hover:text-bwb-text hover:bg-white/5'
              }`}
            >
              <Layers size={14} />
              <span>All Teams Standings</span>
            </button>
          </div>
          <span className="text-[11px] font-mono text-bwb-accent font-bold px-2.5 hidden sm:inline">
            1 Winner Per Problem Advances to Grand Finals
          </span>
        </div>
      )}

      {/* ROUND 2 1V1 DUELS VIEW */}
      {round === 2 && viewMode === 'duels' && !compact ? (
        <div className="grid md:grid-cols-2 gap-4">
          {problemKeys.map((pKey, idx) => {
            const pMeta = PROBLEM_NAMES[pKey] || { title: `Problem Track ${idx + 1}`, category: 'Challenge', icon: '⚡' }
            const teamsInProblem = teams.filter((t) => t.selectedProblemId === pKey)
            const sortedProblemTeams = [...teamsInProblem].sort((a, b) => {
              const scoreA = a.round2Score ?? a.score ?? 0
              const scoreB = b.round2Score ?? b.score ?? 0
              return scoreB - scoreA
            })

            const leader = sortedProblemTeams[0] || null
            const challenger = sortedProblemTeams[1] || null
            const leaderScore = leader?.round2Score ?? leader?.score ?? 0
            const challengerScore = challenger?.round2Score ?? challenger?.score ?? 0

            return (
              <div
                key={pKey}
                className={`p-4 sm:p-5 rounded-2xl stereo-card border transition-all ${
                  leader && (leader.id === highlightTeamId || challenger?.id === highlightTeamId)
                    ? 'border-bwb-accent ring-1 ring-bwb-accent/30 bg-bwb-surface-2'
                    : 'border-white/10 bg-bwb-surface'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pMeta.icon}</span>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-bwb-accent uppercase">
                        Track 0{idx + 1} · {pMeta.category}
                      </span>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate max-w-[240px]">
                        {pMeta.title}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/5 text-bwb-muted border border-white/10">
                    {teamsInProblem.length}/2 Teams
                  </span>
                </div>

                {/* 1v1 Matchup Arena */}
                <div className="space-y-2.5">
                  {/* Leader / Finalist */}
                  {leader ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-bwb-bg text-[10px] font-black flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate flex items-center gap-1.5">
                            <span>{leader.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                              FINALS SPOT
                            </span>
                          </p>
                          <p className="text-[10px] text-bwb-muted font-mono">{leader.department || 'Squad'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-display font-black text-sm sm:text-base text-emerald-400">
                          {leaderScore}
                        </span>
                        <span className="text-[9px] text-bwb-muted font-mono block">pts</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-bwb-muted font-mono">
                      No team assigned
                    </div>
                  )}

                  {/* VS Divider */}
                  <div className="flex items-center justify-center gap-2 my-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[9px] font-mono font-black text-bwb-muted uppercase tracking-widest px-1">
                      VS
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {/* Challenger */}
                  {challenger ? (
                    <div className="p-3 rounded-xl bg-bwb-surface-2/60 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-bwb-muted text-[10px] font-black flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate">
                            {challenger.name}
                          </p>
                          <p className="text-[10px] text-bwb-muted font-mono">{challenger.department || 'Squad'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-display font-black text-sm sm:text-base text-bwb-muted">
                          {challengerScore}
                        </span>
                        <span className="text-[9px] text-bwb-muted font-mono block">pts</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-bwb-muted font-mono">
                      Waiting for 2nd squad...
                    </div>
                  )}
                </div>

                {/* Match Outcome Subtext */}
                <div className="mt-3 pt-2 text-[10px] font-mono text-bwb-muted flex items-center justify-between border-t border-white/5">
                  <span>Winner advances to Grand Finals (R3)</span>
                  {leader && challenger && (
                    <span className="text-amber-400 font-bold">
                      Diff: {Math.abs(leaderScore - challengerScore)} pts
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* STANDARD / OVERALL RANKS TABLE */
        <div className="rounded-2xl border border-bwb-border bg-bwb-surface shadow-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bwb-surface-2 text-left">
                <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted w-[60px]">Rank</th>
                <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted">Team</th>

                {!compact && (
                  <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted hidden md:table-cell">Challenge Track</th>
                )}
                <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted text-center whitespace-nowrap">Tournament Status</th>
                <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted text-right w-[100px]">Total Score</th>
                {!compact && (
                  <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted text-center w-[70px]">Metrics</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, i) => {
                const rank = team.rank ?? i + 1
                const isHighlighted = team.id === highlightTeamId
                const isFirst = rank === 1
                const isSecond = rank === 2
                const isThirdOrFourth = rank === 3 || rank === 4
                const isTop8 = rank <= 8
                const problemMeta = team.selectedProblemId ? PROBLEM_NAMES[team.selectedProblemId] : null
                const isExpanded = expandedTeamId === team.id
                
                const teamScore = round === 1
                  ? (team.round1Score ?? team.score ?? 0)
                  : round === 2
                  ? (team.round2Score ?? team.score ?? 0)
                  : (team.round3Score ?? team.score ?? 0)

                const breakdown = (team.scoreBreakdown || {}) as Record<string, number | undefined>

                return (
                  <React.Fragment key={team.id}>
                    <tr
                      onClick={() => !compact && toggleExpand(team.id)}
                      className={`border-t border-bwb-border transition-colors duration-150 ${
                        isHighlighted
                          ? 'bg-bwb-accent/10 ring-1 ring-bwb-accent/30'
                          : isFirst && (round === 3 || isFinalResults)
                          ? 'bg-amber-500/10'
                          : 'bg-bwb-surface hover:bg-bwb-surface-2/50'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="px-2 sm:px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className={`font-display font-black text-xs sm:text-sm ${
                            isFirst ? 'text-bwb-gold' : isSecond ? 'text-slate-300' : isThirdOrFourth ? 'text-amber-500' : isTop8 ? 'text-bwb-accent' : 'text-bwb-muted'
                          }`}>
                            #{rank}
                          </span>
                          {showMovement && team.rankChange !== undefined && team.rankChange !== 0 && (
                            <span className={`text-[9px] font-mono font-bold ${team.rankChange > 0 ? 'text-bwb-success' : 'text-bwb-danger'}`}>
                              {team.rankChange > 0 ? '▲' : '▼'}{Math.abs(team.rankChange)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Name Column */}
                      <td className="px-2 sm:px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate">{team.name}</span>
                          {team.department && (
                            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/5 text-bwb-muted hidden lg:inline">
                              {team.department}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Problem Track Column */}
                      {!compact && (
                        <td className="px-2 sm:px-3 py-3 text-[11px] text-bwb-muted hidden md:table-cell">
                          {problemMeta ? (
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <span>{problemMeta.icon}</span>
                              <span className="truncate max-w-[160px]">{problemMeta.category}</span>
                            </span>
                          ) : (
                            <span className="text-bwb-muted/50">—</span>
                          )}
                        </td>
                      )}

                      {/* Status / Prize Column */}
                      <td className="px-2 sm:px-3 py-3 text-center">
                        {round === 3 || isFinalResults ? (
                          isFirst ? (
                            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-black bg-bwb-gold text-bwb-bg shadow-sm whitespace-nowrap">
                              🏆 1ST CHAMPION
                            </span>
                          ) : isSecond ? (
                            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-slate-400/20 text-slate-200 border border-slate-400/30 whitespace-nowrap">
                              🥈 2ND RUNNER-UP
                            </span>
                          ) : isThirdOrFourth ? (
                            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                              🥉 3RD PLACE ({rank === 3 ? 'A' : 'B'})
                            </span>
                          ) : (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono text-bwb-muted bg-white/5 border border-white/10">
                              🎖️ Finalist #{rank}
                            </span>
                          )
                        ) : round === 2 ? (
                          team.isProblemTrackLeader || team.isFinalist ? (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                              👑 Track Leader
                            </span>
                          ) : (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono text-rose-300/80 bg-rose-500/10 border border-rose-500/20 whitespace-nowrap">
                              ⚔️ 1v1 Opponent
                            </span>
                          )
                        ) : (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-semibold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/20 whitespace-nowrap">
                            ✓ Open Qualifier
                          </span>
                        )}
                      </td>

                      {/* Score Column */}
                      <td className="px-2 sm:px-3 py-3 text-right font-display font-black text-xs sm:text-sm text-bwb-accent">
                        {teamScore > 0 ? (
                          <>
                            {teamScore}
                            <span className="text-[9px] text-bwb-muted font-mono font-normal"> /100</span>
                          </>
                        ) : (
                          <span className="text-bwb-muted/50 font-mono text-xs">0 pts</span>
                        )}
                      </td>

                      {/* Expand / View Metrics Toggle */}
                      {!compact && (
                        <td className="px-2 sm:px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpand(team.id)
                            }}
                            className={`p-1.5 rounded-lg border transition-all text-xs font-mono flex items-center justify-center mx-auto ${
                              isExpanded
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-white/5 text-bwb-muted border-white/10 hover:bg-white/10 hover:text-bwb-text'
                            }`}
                            title="View evaluation rubric score breakdown"
                          >
                            <BarChart3 size={13} className="mr-0.5" />
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                      )}
                    </tr>

                    {/* EXPANDABLE DETAILED RUBRIC METRIC BREAKDOWN ROW */}
                    {!compact && isExpanded && (
                      <tr className="bg-gradient-to-b from-bwb-surface-2/90 to-bwb-surface border-t border-purple-500/20">
                        <td colSpan={6} className="p-4 sm:p-5">
                          <div className="rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-purple-950/20 shadow-inner space-y-4">
                            {/* Rubric Header Banner */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  <Sparkles size={16} />
                                </div>
                                <div>
                                  <h4 className="font-display font-bold text-sm text-bwb-text flex items-center gap-2">
                                    <span>{team.name} — Round {round} Pitching Evaluation Split</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/30 text-purple-200">
                                      {teamScore}/100 Pts
                                    </span>
                                  </h4>
                                  <p className="text-[11px] text-bwb-muted">
                                    Official judge scoring criteria & dimension breakdown.
                                  </p>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono text-purple-300 font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                🎯 Growth Analysis for Round {Math.min(3, round + 1)}
                              </span>
                            </div>

                            {/* Rubric Criteria Metrics Grid */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {criteria.map((crit) => {
                                const val = Number(breakdown[crit.key] ?? 0)
                                const max = crit.max
                                const pct = max > 0 ? Math.round((val / max) * 100) : 0
                                const isHigh = pct >= 85
                                const isMid = pct >= 65 && pct < 85

                                return (
                                  <div
                                    key={crit.key}
                                    className="p-3 rounded-xl bg-bwb-surface border border-white/5 flex flex-col justify-between space-y-2"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between text-xs font-bold text-bwb-text mb-0.5">
                                        <span className="truncate pr-2">{crit.label}</span>
                                        <span className={`font-mono text-xs shrink-0 ${
                                          isHigh ? 'text-emerald-400' : isMid ? 'text-purple-300' : 'text-amber-400'
                                        }`}>
                                          {val} / {max} Pts
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-bwb-muted leading-tight line-clamp-2">
                                        {crit.desc}
                                      </p>
                                    </div>

                                    {/* Dimension Progress Bar */}
                                    <div className="w-full bg-bwb-bg rounded-full h-2 overflow-hidden border border-white/5">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ${
                                          isHigh
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                            : isMid
                                            ? 'bg-gradient-to-r from-purple-500 to-bwb-accent'
                                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Tactical Advice for Next Round */}
                            <div className="p-3 rounded-xl bg-bwb-surface-2/80 border border-white/5 flex items-start gap-2.5 text-xs text-bwb-muted">
                              <Target size={16} className="text-bwb-accent shrink-0 mt-0.5" />
                              <p className="leading-relaxed">
                                <strong className="text-bwb-text">Tactical Strategy: </strong>
                                {round === 1
                                  ? 'In Round 2, incorporate all 3 surprise frontier tech constraint cards seamlessly into your architecture and fortify your system against edge failure modes.'
                                  : round === 2
                                  ? 'In Round 3 Grand Finals, deliver your master blueprints and defend live on stage against aggressive judge cross-examination.'
                                  : 'Tournament completed! Top squads honored on the Championship Podium.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
