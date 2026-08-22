import React from 'react'
import { motion } from 'framer-motion'
import type { Team } from '../../types'

interface LeaderboardTableProps {
  teams: Team[]
  highlightTeamId?: string
  compact?: boolean
  showMovement?: boolean
  round?: number
  isFinalResults?: boolean
}

export function LeaderboardTable({
  teams,
  highlightTeamId,
  compact,
  showMovement = true,
  round = 1,
  isFinalResults = false,
}: LeaderboardTableProps) {
  const sorted = [...teams].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

  return (
    <div className="rounded-2xl border border-bwb-border bg-bwb-surface shadow-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-bwb-surface-2 text-left">
            <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted w-[60px]">Rank</th>
            <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted">Team</th>

            {!compact && (
              <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted hidden md:table-cell">Members</th>
            )}
            <th className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-display uppercase tracking-wider text-bwb-muted text-center whitespace-nowrap">Status / Prize</th>
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

            // Render qualification cut-off divider after rank 8 in Round 2
            const showRound2Cutoff = round === 2 && rank === 8 && sorted.length > 8

            return (
              <React.Fragment key={team.id}>
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-t border-bwb-border ${
                    isHighlighted
                      ? 'bg-bwb-accent/10 ring-1 ring-bwb-accent/30'
                      : isFirst && (round === 3 || isFinalResults)
                      ? 'bg-amber-500/10'
                      : 'bg-bwb-surface hover:bg-bwb-surface-2/50'
                  } transition-colors`}
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

                  {/* Members Column */}
                  {!compact && (
                    <td className="px-2 sm:px-3 py-3 text-[11px] text-bwb-muted hidden md:table-cell">
                      {team.members?.join(', ') || 'Team Squad'}
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
                      isTop8 ? (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ✓ Finalist Spot #{rank}
                        </span>
                      ) : (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono text-bwb-muted bg-white/5">
                          Rank #{rank}
                        </span>
                      )
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-semibold bg-bwb-accent/15 text-bwb-accent border border-bwb-accent/20 whitespace-nowrap">
                        Advances to R2
                      </span>
                    )}
                  </td>

                  {/* Score Column */}
                  <td className="px-2 sm:px-3 py-3 text-right font-display font-bold text-xs sm:text-sm text-bwb-accent">
                    {team.score ?? 0}
                    <span className="text-[9px] text-bwb-muted font-mono font-normal"> pts</span>
                  </td>
                </motion.tr>

                {/* Round 2 Qualification Cut-Off Divider */}
                {showRound2Cutoff && (
                  <tr className="bg-emerald-500/10 border-y-2 border-emerald-500/40">
                    <td colSpan={compact ? 4 : 5} className="py-2 px-3 text-center">
                      <span className="text-[10px] sm:text-xs font-mono font-black text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-2">
                        <span>▲ TOP 8 ADVANCE TO GRAND FINALS (ROUND 3) ▲</span>
                      </span>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

