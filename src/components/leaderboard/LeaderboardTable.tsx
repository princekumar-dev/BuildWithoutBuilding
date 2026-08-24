import React, { useState } from 'react'
import { Swords, Layers, Crown } from 'lucide-react'
import type { Team } from '../../types'

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
  const sorted = [...teams].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

  // Group teams by problem statement for Round 2 Duels View
  const problemKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']

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
                {/* Problem Track Header */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xl shrink-0">{pMeta.icon}</span>
                    <div className="truncate">
                      <p className="text-[10px] font-mono font-bold uppercase text-bwb-accent tracking-wider">
                        Track #{idx + 1} · {pMeta.category}
                      </p>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate">
                        {pMeta.title}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 text-bwb-muted border border-white/10 shrink-0">
                    {teamsInProblem.length} Squads
                  </span>
                </div>

                {/* Head to Head Teams */}
                <div className="space-y-2">
                  {/* Leading Team */}
                  {leader ? (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        leader.id === highlightTeamId
                          ? 'bg-bwb-accent/15 border-bwb-accent/40 text-bwb-text ring-1 ring-bwb-accent/40'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Crown size={14} className="text-amber-400 shrink-0" />
                        <span className="font-display font-bold text-xs sm:text-sm text-bwb-text truncate">
                          {leader.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                          👑 LEADING TRACK
                        </span>
                      </div>
                      <span className="font-display font-black text-xs sm:text-sm text-emerald-400 shrink-0">
                        {leaderScore} <span className="text-[9px] font-mono font-normal text-bwb-muted">pts</span>
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-dashed border-white/10 text-center text-xs text-bwb-muted font-mono">
                      No squads selected this track
                    </div>
                  )}

                  {/* Challenging Team */}
                  {challenger && (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        challenger.id === highlightTeamId
                          ? 'bg-bwb-accent/15 border-bwb-accent/40 text-bwb-text ring-1 ring-bwb-accent/40'
                          : 'bg-bwb-surface-2 border-white/10 text-bwb-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-bwb-muted shrink-0">⚔️ Opponent:</span>
                        <span className="font-display font-semibold text-xs sm:text-sm text-bwb-text truncate">
                          {challenger.name}
                        </span>
                      </div>
                      <span className="font-display font-bold text-xs sm:text-sm text-bwb-muted shrink-0">
                        {challengerScore} <span className="text-[9px] font-mono font-normal">pts</span>
                      </span>
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
                <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted text-right w-[80px]">Score</th>
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

                return (
                  <React.Fragment key={team.id}>
                    <tr
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
                              👑 Track Leader (Finals Spot)
                            </span>
                          ) : (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono text-rose-300/80 bg-rose-500/10 border border-rose-500/20 whitespace-nowrap">
                              ⚔️ 1v1 Opponent
                            </span>
                          )
                        ) : (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-semibold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/20 whitespace-nowrap">
                            ✓ Open Qualifier · Advances to R2
                          </span>
                        )}
                      </td>

                      {/* Score Column */}
                      <td className="px-2 sm:px-3 py-3 text-right font-display font-bold text-xs sm:text-sm text-bwb-accent">
                        {round === 1 ? '—' : team.score ?? 0}
                        {round !== 1 && <span className="text-[9px] text-bwb-muted font-mono font-normal"> pts</span>}
                      </td>
                    </tr>
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
