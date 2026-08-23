import { useState, useEffect } from 'react'
import { Sparkles, Target, ShieldCheck } from 'lucide-react'
import type { Submission, Technology } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface SolutionFormProps {
  technologies: Technology[]
  onSubmit: (submission: Submission) => void
  disabled?: boolean
  initial?: Submission | null
  submitLabel?: string
  currentRound?: number
}

export function SolutionForm({ technologies, onSubmit, disabled, initial, submitLabel, currentRound = 1 }: SolutionFormProps) {
  const [form, setForm] = useState<Submission>({
    solutionName: initial?.solutionName ?? '',
    whatItDoes: initial?.whatItDoes ?? '',
    howItWorks: initial?.howItWorks ?? '',
    techUsage: initial?.techUsage ?? Object.fromEntries(technologies.map((t) => [t.id, ''])),
    mainAdvantage: initial?.mainAdvantage ?? '',
    mainLimitation: initial?.mainLimitation ?? '',
  })

  useEffect(() => {
    if (initial) {
      setForm({
        solutionName: initial.solutionName ?? '',
        whatItDoes: initial.whatItDoes ?? '',
        howItWorks: initial.howItWorks ?? '',
        techUsage: initial.techUsage ?? Object.fromEntries(technologies.map((t) => [t.id, ''])),
        mainAdvantage: initial.mainAdvantage ?? '',
        mainLimitation: initial.mainLimitation ?? '',
      })
    }
  }, [initial, technologies])

  const update = (field: keyof Submission, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const updateTech = (techId: string, value: string) =>
    setForm((prev) => ({ ...prev, techUsage: { ...prev.techUsage, [techId]: value } }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, submittedAt: new Date().toISOString() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ROUND RUBRIC GUIDANCE BANNER */}
      {currentRound === 1 && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
              <Target size={14} className="text-purple-400" />
              Round 1 Evaluation Focus · 100 Marks
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Zero Elimination
            </span>
          </div>
          <p className="text-xs text-bwb-muted leading-relaxed">
            In Round 1, judges evaluate how clearly you present <strong className="text-bwb-text">problem understanding</strong>, root causes, pain points, and shortcomings of <strong className="text-bwb-text">existing solutions</strong>.
          </p>
        </div>
      )}

      {currentRound === 2 && (
        <div className="p-4 rounded-2xl bg-bwb-accent/10 border border-bwb-accent/30 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-bwb-accent uppercase flex items-center gap-1.5">
              <Sparkles size={14} className="text-bwb-accent" />
              Round 2 Evaluation Focus · 100 Marks
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-bwb-accent/20 text-bwb-accent">
              Top 8 Qualify
            </span>
          </div>
          <p className="text-xs text-bwb-muted leading-relaxed">
            In Round 2, present how you <strong className="text-bwb-text">enhance your solution</strong>, integrate all 3 frontier tech cards, and deliver novel ideation to secure a spot in the Grand Finals!
          </p>
        </div>
      )}

      {currentRound === 3 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" />
              Round 3 Grand Finals · Live Stage Defense
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
              Top 4 Podium
            </span>
          </div>
          <p className="text-xs text-bwb-muted leading-relaxed">
            Present your master architectural pitch and defend against live judge attack questions to win 1st, 2nd, or 3rd place!
          </p>
        </div>
      )}

      <Input
        label="Solution Name *"
        placeholder="Give your solution a memorable name"
        value={form.solutionName}
        onChange={(e) => update('solutionName', e.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label={currentRound === 1 ? "Problem Understanding & What Your Solution Does *" : "What does your solution do? *"}
        placeholder={
          currentRound === 1
            ? "Describe how clearly your team understands the problem, its root causes, and your proposed approach"
            : "Describe the core purpose and enhanced capabilities in 2-3 sentences"
        }
        value={form.whatItDoes}
        onChange={(e) => update('whatItDoes', e.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label={currentRound === 1 ? "How does it work & Critique of Existing Solutions? *" : "How does it work? *"}
        placeholder={
          currentRound === 1
            ? "Explain your architecture flow and how it overcomes the limitations of existing solutions"
            : "Explain the architecture, edge-to-cloud handshakes, and system flow"
        }
        value={form.howItWorks}
        onChange={(e) => update('howItWorks', e.target.value)}
        disabled={disabled}
        required
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-bwb-text">Technology Usage *</p>
        {technologies.map((tech) => (
          <Textarea
            key={tech.id}
            label={`${tech.icon} ${tech.name}`}
            placeholder={`How does ${tech.name} fit into your solution?`}
            value={form.techUsage[tech.id] ?? ''}
            onChange={(e) => updateTech(tech.id, e.target.value)}
            disabled={disabled}
            required
          />
        ))}
      </div>

      <Textarea
        label="Main Advantage *"
        placeholder="What's the biggest strength of your approach compared to existing solutions?"
        value={form.mainAdvantage}
        onChange={(e) => update('mainAdvantage', e.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label="Main Limitation *"
        placeholder="Be honest — what's the weakest point or key risk?"
        value={form.mainLimitation}
        onChange={(e) => update('mainLimitation', e.target.value)}
        disabled={disabled}
        required
      />

      {!disabled && (
        <Button type="submit" size="lg" fullWidth>
          {submitLabel ?? 'Submit Solution'}
        </Button>
      )}
    </form>
  )
}
