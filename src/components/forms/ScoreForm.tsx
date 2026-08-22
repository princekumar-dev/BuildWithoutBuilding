import { useState } from 'react'
import type { ScoreBreakdown } from '../../types'
import { SCORING_CRITERIA } from '../../data/mockData'
import { Button } from '../ui/Button'

interface ScoreFormProps {
  teamName: string
  onSubmit: (scores: ScoreBreakdown) => void
}

export function ScoreForm({ teamName, onSubmit }: ScoreFormProps) {
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
    const criterion = SCORING_CRITERIA.find((c) => c.key === key)
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
        <h3 className="font-display font-semibold">Score: {teamName}</h3>
        <span className={`font-display text-2xl font-bold ${total >= 70 ? 'text-bwb-success' : 'text-bwb-accent'}`}>
          {total}/100
        </span>
      </div>

      {SCORING_CRITERIA.map(({ key, label, max }) => (
        <div key={key} className="flex items-center gap-4">
          <label className="flex-1 text-sm text-bwb-muted">{label}</label>
          <span className="text-xs text-bwb-muted w-8 text-right">/{max}</span>
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
            className="w-20 text-center px-3 py-2 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text font-display font-bold placeholder:text-bwb-muted/50 focus:outline-none focus:border-bwb-accent/60 focus:ring-1 focus:ring-bwb-accent/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      ))}

      <Button type="submit" fullWidth size="lg" disabled={total === 0}>
        Submit Score
      </Button>
    </form>
  )
}
