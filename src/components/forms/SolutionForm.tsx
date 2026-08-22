import { useState, useEffect } from 'react'
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
}

export function SolutionForm({ technologies, onSubmit, disabled, initial, submitLabel }: SolutionFormProps) {
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
      <Input
        label="Solution Name *"
        placeholder="Give your solution a memorable name"
        value={form.solutionName}
        onChange={(e) => update('solutionName', e.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label="What does your solution do? *"
        placeholder="Describe the core purpose in 2-3 sentences"
        value={form.whatItDoes}
        onChange={(e) => update('whatItDoes', e.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label="How does it work? *"
        placeholder="Explain the architecture and flow"
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
        placeholder="What's the biggest strength of your approach?"
        value={form.mainAdvantage}
        onChange={(e) => update('mainAdvantage', e.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label="Main Limitation *"
        placeholder="Be honest — what's the weakest point?"
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
