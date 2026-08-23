import { useState } from 'react'
import type { ScoreBreakdown } from '../../types'
import { getScoringCriteriaForRound } from '../../data/mockData'
import { Button } from '../ui/Button'

interface ScoreFormProps {
  teamName: string
  onSubmit: (scores: ScoreBreakdown) => void
  round?: number
}

export function ScoreForm({ teamName, onSubmit, round = 1 }: ScoreFormProps) {
  const criteria = getScoringCriteriaForRound(round)
  const [scores, setScores] = useState<ScoreBreakdown>({
    problemUnderstanding: 0,
    creativity: 0,
    technologyUsage: 0,
    technicalFeasibility: 0,
    realWorldImpact: 0,
    pitch: 0,
    defense: 0,
  })

  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  const update = (key: keyof ScoreBreakdown, value: number) => {
    const criterion = criteria.find((c) => c.key === key)
    const clamped = Math.min(Math.max(0, value), criterion?.max ?? 100)
    setScores((prev) => ({ ...prev, [key]: clamped }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(scores)
      }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-display font-semibold">Score: {teamName}</h3>
          <span className="text-xs text-purple-400 font-mono">
            {round === 1 ? 'Round 1: Problem Understanding & Landscape (100 Marks)' : round === 2 ? 'Round 2: Enhanced Architecture (100 Marks)' : 'Round 3: Master Pitch (Grand Finals)'}
          </span>
        </div>
        <span className={`font-display text-2xl font-bold ${total >= 70 ? 'text-bwb-success' : 'text-bwb-accent'}`}>
          {total}/100
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map(({ key, label, max, desc }) => (
          <div key={key} className="p-3 rounded-xl bg-bwb-surface-2/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-bwb-text">{label}</label>
                {desc && <p className="text-[11px] text-bwb-muted">{desc}</p>}
              </div>
              <span className="text-xs font-mono font-bold text-bwb-muted w-10 text-right">/{max}</span>
              <input
                type="number"
                min={0}
                max={max}
                placeholder="0"
                value={scores[key as keyof ScoreBreakdown] || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    update(key as keyof ScoreBreakdown, 0)
                  } else {
                    update(key as keyof ScoreBreakdown, Number(val))
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="w-20 text-center px-3 py-2 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text font-display font-bold placeholder:text-bwb-muted/50 focus:outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" fullWidth size="lg" disabled={total === 0}>
        Submit Score ({total}/100)
      </Button>
    </form>
  )
}
