import { useState } from 'react'
import type { ScoreBreakdown } from '../../types'
import { SCORING_CRITERIA } from '../../data/mockData'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

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
          <Input
            type="number"
            min={0}
            max={max}
            value={scores[key as keyof ScoreBreakdown]}
            onChange={(e) => update(key as keyof ScoreBreakdown, Number(e.target.value))}
            className="w-20 text-center"
          />
        </div>
      ))}

      <Button type="submit" fullWidth size="lg" disabled={total === 0}>
        Submit Score
      </Button>
    </form>
  )
}
