import { useState, useEffect } from 'react'
import { Sparkles, Target, ShieldCheck, Presentation, Link as LinkIcon, Layers, FileText, CheckCircle2 } from 'lucide-react'
import type { Submission, Technology, SlideItem } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { toast } from '../ui/Toast'

export function getPresentationEmbedUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Google Slides: Convert /edit or /pub to /embed
  if (trimmed.includes('docs.google.com/presentation/d/')) {
    const match = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`
    }
  }

  // Canva: append ?embed if not present
  if (trimmed.includes('canva.com/design/') && trimmed.includes('/view')) {
    return trimmed.includes('?embed') ? trimmed : `${trimmed}?embed`
  }

  // Generic https url (Pitch.com, Gamma, Figma, PDF)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return trimmed
}

export function generateNativeSlides(form: Partial<Submission>, technologies: Technology[], currentRound: number = 1): SlideItem[] {
  const name = form.solutionName || (currentRound === 1 ? 'Problem & Landscape Formulation' : 'System Architecture Proposal')
  const whatItDoes = form.whatItDoes || 'Innovative solution addressing critical domain challenges.'
  const howItWorks = form.howItWorks || 'End-to-end intelligent data pipeline and automated actuation system.'
  const mainAdvantage = form.mainAdvantage || 'High reliability, low latency, and cost-effective deployment.'
  const mainLimitation = form.mainLimitation || 'Initial hardware calibration and edge synchronization.'

  if (currentRound === 1) {
    return [
      {
        id: 'slide-1',
        title: name,
        subtitle: 'Round 1 Pitch · Problem Understanding & Landscape (100 Pts)',
        badge: 'ROUND 1 · SLIDE 1 · EXECUTIVE OVERVIEW',
        icon: '🎯',
        content: whatItDoes,
        visualType: 'conclusion',
        bulletPoints: [
          `Initiative Scope: ${whatItDoes.slice(0, 130)}...`,
          'Strategic Domain: Comprehensive Problem Root Cause Formulation',
          'Zero Elimination Qualifier · Full Standing Carried to Round 2',
        ],
      },
      {
        id: 'slide-2',
        title: 'Problem Understanding & Root Cause Analysis',
        subtitle: 'Target stakeholder pain points & deep ecosystem bottlenecks',
        badge: 'ROUND 1 · SLIDE 2 · ROOT CAUSES',
        icon: '🔍',
        content: whatItDoes,
        visualType: 'bullets',
        bulletPoints: [
          `Core Problem & Stakeholders: ${whatItDoes.slice(0, 130)}...`,
          'Ecosystem Impact: High operational downtime and workflow friction',
          'Root Cause Diagnosis: Architectural latency and legacy bottlenecks',
        ],
      },
      {
        id: 'slide-3',
        title: 'Critique of Existing Solutions & Market Gaps',
        subtitle: 'Why legacy alternatives fail & where the strategic opportunity lies',
        badge: 'ROUND 1 · SLIDE 3 · GAP ANALYSIS',
        icon: '⚡',
        content: howItWorks,
        visualType: 'architecture',
        bulletPoints: [
          `Existing System Shortcomings: ${howItWorks.slice(0, 130)}...`,
          'Legacy Vulnerabilities: High infrastructure costs & single failure points',
          'The Strategic Opportunity: Modern resilient workflow with real-time telemetry',
        ],
      },
      {
        id: 'slide-4',
        title: 'Proposed Initial Tech Stack & Tools',
        subtitle: 'Open architectural technologies, frameworks & data pipelines',
        badge: 'ROUND 1 · SLIDE 4 · TECH FORMULATION',
        icon: '🛠️',
        visualType: 'bullets',
        bulletPoints: [
          `Proposed Technology Stack: ${mainAdvantage.slice(0, 140)}...`,
          'Core Building Blocks: Edge computing, real-time messaging & modular microservices',
          'Strategic Feasibility: Designed for zero downtime, low latency & rapid field deployment',
        ],
      },
      {
        id: 'slide-5',
        title: 'Key Constraints & Judge Defense Strategy',
        subtitle: 'Anticipated failure modes, risks & live Q&A defense',
        badge: 'ROUND 1 · SLIDE 5 · RISK DEFENSE',
        icon: '🛡️',
        visualType: 'comparison',
        bulletPoints: [
          `Operational Constraints & Risks: ${mainLimitation}`,
          'Defense Strategy: Redundancy protocols & fail-safe fallback modes',
          'Squad Alignment: Prepared to defend all technical assumptions during judge interrogation',
        ],
      },
    ]
  }

  if (currentRound === 2) {
    return [
      {
        id: 'slide-1',
        title: name,
        subtitle: 'Round 2 Pitch · 1v1 Problem Duel Showdown (Top 8 Qualify)',
        badge: 'ROUND 2 · SLIDE 1 · ARCHITECTURE OVERVIEW',
        icon: '⚡',
        content: whatItDoes,
        visualType: 'conclusion',
        bulletPoints: [
          `Core Purpose: ${whatItDoes.slice(0, 120)}...`,
          `3-Card Frontier Stack: ${technologies.map((t) => t.name).join(' + ')}`,
          `Cross-Tech Interoperability: ${form.techUsage?.['cross_synthesis'] || 'Unified edge telemetry and execution pipeline'}`,
        ],
      },
      {
        id: 'slide-2',
        title: 'Problem-Solution Alignment & Purpose',
        subtitle: 'How precisely this enhanced architecture eliminates verified user pain points',
        badge: 'ROUND 2 · SLIDE 2 · PROBLEM ALIGNMENT',
        icon: '🎯',
        content: whatItDoes,
        visualType: 'bullets',
        bulletPoints: [
          `Target Problem Fit: ${whatItDoes.slice(0, 130)}...`,
          'Eliminates critical bottlenecks with autonomous coordination',
          'Optimized for low-bandwidth, high-resilience field operation',
        ],
      },
      {
        id: 'slide-3',
        title: 'System Architecture & Execution Logic',
        subtitle: 'End-to-end engineering pipeline, edge-to-cloud handshakes & failover',
        badge: 'ROUND 2 · SLIDE 3 · SYSTEM FLOW',
        icon: '🔄',
        content: howItWorks,
        visualType: 'architecture',
        bulletPoints: [
          `System Pipeline: ${howItWorks.slice(0, 140)}...`,
          'Edge Sensing ➔ Real-Time Inference ➔ Autonomous Dispatch',
          'Zero Single Point of Failure with cryptographic handshake verification',
        ],
      },
      {
        id: 'slide-4',
        title: '3 Frontier Tech Cards Synthesis',
        subtitle: 'Deep technical integration and cross-technology communication',
        badge: 'ROUND 2 · SLIDE 4 · TECH SYNTHESIS',
        icon: '🔮',
        visualType: 'tech-stack',
        bulletPoints: [
          ...technologies.map((t) => {
            const usage = form.techUsage?.[t.id] || 'Synthesized into the system execution pipeline.'
            return `${t.name}: ${usage}`
          }),
          ...(form.techUsage?.['cross_synthesis'] ? [`Synthesis: ${form.techUsage['cross_synthesis']}`] : []),
        ],
      },
      {
        id: 'slide-5',
        title: 'Novelty & Judge Attack Defense',
        subtitle: 'Architectural differentiation, edge failure mode mitigation & live Q&A',
        badge: 'ROUND 2 · SLIDE 5 · NOVELTY & DEFENSE',
        icon: '🛡️',
        visualType: 'comparison',
        bulletPoints: [
          `Architectural Novelty: ${mainAdvantage}`,
          `Vulnerable Failure Modes & Mitigation: ${mainLimitation}`,
          'Prepared for rigorous edge-case attacks and technical scrutiny',
        ],
      },
    ]
  }

  return [
    {
      id: 'slide-1',
      title: name,
      subtitle: 'Grand Finals · Master Architecture Blueprint & Innovation [30 Pts]',
      badge: 'GRAND FINALS · SLIDE 1 · MASTER ARCHITECTURE [30 PTS]',
      icon: '🏆',
      content: whatItDoes,
      visualType: 'conclusion',
      bulletPoints: [
        `Master Blueprint: ${whatItDoes.slice(0, 130)}...`,
        `Frontier Tech Stack: ${technologies.map((t) => t.name).join(' + ')}`,
        'Championship Standard: Production-grade elegance, resilience & end-to-end telemetry',
      ],
    },
    {
      id: 'slide-2',
      title: 'Production Viability & Resilience [25 Pts]',
      subtitle: 'Real-world deployment feasibility, security protocols & edge failover',
      badge: 'GRAND FINALS · SLIDE 2 · VIABILITY & EDGE RESILIENCE [25 PTS]',
      icon: '🛡️',
      content: mainAdvantage,
      visualType: 'bullets',
      bulletPoints: [
        `Deployment Feasibility: ${mainAdvantage.slice(0, 130)}...`,
        `Edge Failover & Mitigation: ${mainLimitation}`,
        'High-resilience architecture with zero single points of failure',
      ],
    },
    {
      id: 'slide-3',
      title: 'End-to-End System Flow & Execution Logic',
      subtitle: 'Architectural data handshakes, ingestion pipeline & autonomous loops',
      badge: 'GRAND FINALS · SLIDE 3 · SYSTEM WORKFLOW',
      icon: '🔄',
      content: howItWorks,
      visualType: 'architecture',
      bulletPoints: [
        `System Pipeline: ${howItWorks.slice(0, 140)}...`,
        'Edge Sensing ➔ Real-Time Inference ➔ Autonomous Dispatch & Control',
        'Cryptographic handshake verification & hot-standby redundancy',
      ],
    },
    {
      id: 'slide-4',
      title: 'Seamless Tech Synthesis & Stack Mastery [20 Pts]',
      subtitle: 'Deep technical integration and cross-technology communication',
      badge: 'GRAND FINALS · SLIDE 4 · TECH SYNTHESIS [20 PTS]',
      icon: '🔮',
      visualType: 'tech-stack',
      bulletPoints: [
        ...technologies.map((t) => {
          const usage = form.techUsage?.[t.id] || 'Synthesized into core pipeline for processing and control.'
          return `${t.name}: ${usage}`
        }),
        ...(form.techUsage?.['cross_synthesis'] ? [`Cross-Synthesis: ${form.techUsage['cross_synthesis']}`] : []),
      ],
    },
    {
      id: 'slide-5',
      title: 'Live Stage Defense & Championship Moat [15 Pts]',
      subtitle: 'Technical depth, judge attack defense & competitive superiority',
      badge: 'GRAND FINALS · SLIDE 5 · STAGE DEFENSE & Q&A [15 PTS]',
      icon: '🎯',
      visualType: 'comparison',
      bulletPoints: [
        `Architectural Moat: ${mainAdvantage}`,
        `Edge Risk Mitigation: ${mainLimitation}`,
        'Prepared for live judge interrogation, technical stress tests & red teaming',
      ],
    },
  ]
}

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
    presentationUrl: initial?.presentationUrl ?? '',
    presentationEmbedUrl: initial?.presentationEmbedUrl ?? '',
  })

  const [slideMode, setSlideMode] = useState<'url' | 'upload' | 'smart'>(
    initial?.presentationUrl ? (initial.presentationUrl.startsWith('data:') ? 'upload' : 'url') : 'smart'
  )

  useEffect(() => {
    if (initial) {
      setForm({
        solutionName: initial.solutionName ?? '',
        whatItDoes: initial.whatItDoes ?? '',
        howItWorks: initial.howItWorks ?? '',
        techUsage: initial.techUsage ?? Object.fromEntries(technologies.map((t) => [t.id, ''])),
        mainAdvantage: initial.mainAdvantage ?? '',
        mainLimitation: initial.mainLimitation ?? '',
        presentationUrl: initial.presentationUrl ?? '',
        presentationEmbedUrl: initial.presentationEmbedUrl ?? '',
      })
      if (initial.presentationUrl) {
        setSlideMode(initial.presentationUrl.startsWith('data:') ? 'upload' : 'url')
      }
    }
  }, [initial, technologies])

  const update = (field: keyof Submission, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const updateTech = (techId: string, value: string) =>
    setForm((prev) => ({ ...prev, techUsage: { ...prev.techUsage, [techId]: value } }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const embedUrl = form.presentationUrl ? getPresentationEmbedUrl(form.presentationUrl) || undefined : undefined
    const nativeSlides = generateNativeSlides(form, technologies, currentRound)

    onSubmit({
      ...form,
      presentationEmbedUrl: embedUrl,
      slides: nativeSlides,
      submittedAt: new Date().toISOString(),
    })
  }

  const isRound3 = currentRound === 3

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ROUND RUBRIC GUIDANCE BANNER */}
      {currentRound === 1 && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
              <Target size={14} className="text-purple-400" />
              Round 1 Evaluation Focus · 100 Pts
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
              Round 2 Evaluation Focus · 100 Pts
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
              Round 3 Grand Finals · Live Stage Defense & Presentation Deck
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
              Top 4 Podium
            </span>
          </div>
          <p className="text-xs text-bwb-muted leading-relaxed">
            Present your master architectural pitch and defend against live judge attack questions! Your presentation will be broadcast on the <strong className="text-bwb-text">Stadium Projector Screen</strong> and controlled directly from your device.
          </p>
        </div>
      )}

      <Input
        label={currentRound === 1 ? "Initiative / Project Title *" : "Solution Name *"}
        placeholder={currentRound === 1 ? "e.g. Project AgriSense — Autonomous Crop Threat Defense" : "Give your solution a memorable name"}
        value={form.solutionName}
        onChange={(e) => update('solutionName', e.target.value)}
        disabled={disabled}
        required
      />

      {/* Presentation Deck / PPT Section - SHOWN ONLY IN ROUND 3 (GRAND FINALS) */}
      {isRound3 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-bwb-surface-2 border border-bwb-accent/30 space-y-3.5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-bwb-accent uppercase flex items-center gap-1.5">
                <Presentation size={15} className="text-bwb-accent" />
                Grand Finals Pitch Deck & Slides (Required)
              </span>
              <p className="text-[11px] text-bwb-muted mt-0.5">
                This presentation will appear on the Stadium Projector and be controlled live from your phone/laptop.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-bwb-bg p-1 rounded-xl border border-white/10 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setSlideMode('url')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                  slideMode === 'url' ? 'bg-bwb-accent text-bwb-bg shadow' : 'text-bwb-muted hover:text-white'
                }`}
              >
                <LinkIcon size={12} /> Google Slides / URL
              </button>
              <button
                type="button"
                onClick={() => setSlideMode('upload')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                  slideMode === 'upload' ? 'bg-bwb-accent text-bwb-bg shadow' : 'text-bwb-muted hover:text-white'
                }`}
              >
                <FileText size={12} /> Upload PDF / Slides
              </button>
              <button
                type="button"
                onClick={() => setSlideMode('smart')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                  slideMode === 'smart' ? 'bg-bwb-accent text-bwb-bg shadow' : 'text-bwb-muted hover:text-white'
                }`}
              >
                <Layers size={12} /> Smart Deck (Auto)
              </button>
            </div>
          </div>

          {slideMode === 'url' ? (
            <div className="space-y-2">
              <Input
                label="Google Slides / Canva / PPT Share Link"
                placeholder="https://docs.google.com/presentation/d/... or https://canva.com/design/..."
                value={form.presentationUrl && !form.presentationUrl.startsWith('data:') ? form.presentationUrl : ''}
                onChange={(e) => update('presentationUrl', e.target.value)}
                disabled={disabled}
              />
              <p className="text-[11px] text-bwb-muted font-mono">
                Paste your public Google Slides, Canva, Pitch, Gamma, or PDF view link. The projector will embed and sync your slides.
              </p>
              {form.presentationUrl && !form.presentationUrl.startsWith('data:') && getPresentationEmbedUrl(form.presentationUrl) && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300 font-mono">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Valid presentation link detected. Projector live sync ready!</span>
                </div>
              )}
            </div>
          ) : slideMode === 'upload' ? (
            <div className="space-y-2.5">
              <label className="block text-xs font-mono font-bold text-bwb-text uppercase">
                Upload PDF Presentation / Exported Slides (.pdf, .png, .jpg)
              </label>
              <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 sm:p-6 text-center bg-bwb-bg/60 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  disabled={disabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 25 * 1024 * 1024) {
                        toast.error('File size exceeds 25MB. Please upload a smaller PDF or use a Google Slides link.')
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string
                        update('presentationUrl', dataUrl)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Presentation size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-bwb-text">
                      {form.presentationUrl?.startsWith('data:') ? '✅ File Uploaded & Ready' : 'Click or Drag & Drop PDF / Slide Deck'}
                    </p>
                    <p className="text-[10px] text-bwb-muted font-mono mt-0.5">
                      Supports PowerPoint exported as PDF or Slide Image Deck (Up to 25MB)
                    </p>
                  </div>
                </div>
              </div>
              {form.presentationUrl?.startsWith('data:') && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Document loaded. Synced to Stadium Projector.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => update('presentationUrl', '')}
                    className="text-red-400 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-bwb-bg/70 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Smart Holographic Pitch Deck Generator Active</span>
              </div>
              <p className="text-bwb-muted text-[11px] leading-relaxed">
                We will automatically construct a 5-slide interactive holographic presentation for the Stadium Projector from your solution details, tech cards, and system architecture below.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 text-[10px] font-mono text-center">
                <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-bwb-text">1. Architecture [30]</span>
                <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-bwb-text">2. Viability [25]</span>
                <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-bwb-text">3. System Flow</span>
                <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-bwb-text">4. Tech Synthesis [20]</span>
                <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-bwb-text">5. Stage Defense [15]</span>
              </div>
            </div>
          )}
        </div>
      )}

      <Textarea
        label={
          currentRound === 1
            ? "Problem Understanding & Root Cause Analysis *"
            : isRound3
            ? "Master Architecture & Innovation Formulation [30 Pts] *"
            : "What does your solution do? *"
        }
        placeholder={
          currentRound === 1
            ? "Detail the deep root causes, target stakeholder pain points, and specific ecosystem bottlenecks this challenge addresses."
            : isRound3
            ? "Formulate your end-to-end master system blueprint, core architectural innovation, and deployment elegance."
            : "Describe the core purpose and enhanced capabilities in 2-3 sentences"
        }
        value={form.whatItDoes}
        onChange={(e) => update('whatItDoes', e.target.value)}
        disabled={disabled}
        required
      />

      <Textarea
        label={
          currentRound === 1
            ? "Critique of Existing Solutions & Market Gaps *"
            : isRound3
            ? "End-to-End System Flow & Execution Logic *"
            : "How does your solution work & System Flow? *"
        }
        placeholder={
          currentRound === 1
            ? "Why do current methods fail? What gaps or architectural shortcomings exist in today's alternatives, and where is the opportunity?"
            : isRound3
            ? "Detail the technical pipeline: edge sensing ➔ real-time inference ➔ autonomous actuation and fail-safe redundancy."
            : "Explain the architecture flow, edge-to-cloud handshakes, and execution logic"
        }
        value={form.howItWorks}
        onChange={(e) => update('howItWorks', e.target.value)}
        disabled={disabled}
        required
      />

      {/* TECH STACK SECTION: Open Formulation in Round 1 vs 3 Surprise Cards in Round 2/3 */}
      {currentRound === 1 ? (
        <Textarea
          label="Initial Proposed Tech Stack & Architectural Tools *"
          placeholder="List and describe the core technologies, tools, protocols, and data pipelines your squad proposes to build this solution (e.g. Edge ML, WebSocket gateways, MQTT, time-series DB, offline caching...)."
          value={form.mainAdvantage}
          onChange={(e) => update('mainAdvantage', e.target.value)}
          disabled={disabled}
          required
        />
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-bwb-text">
              {isRound3 ? "3 Frontier Tech Cards Synthesis [20 Pts] *" : "3 Frontier Tech Cards Integration *"}
            </p>
            <p className="text-[11px] text-bwb-muted mt-0.5">
              Explain how your architecture synthesizes and deeply integrates all 3 drawn constraint cards:
            </p>
          </div>
          {technologies.map((tech) => (
            <Textarea
              key={tech.id}
              label={`${tech.icon} ${tech.name}`}
              placeholder={`How does ${tech.name} fit into your architecture?`}
              value={form.techUsage[tech.id] ?? ''}
              onChange={(e) => updateTech(tech.id, e.target.value)}
              disabled={disabled}
              required
            />
          ))}

          {(currentRound === 2 || isRound3) && (
            <Textarea
              label={isRound3 ? "Cross-Technology Communication & Synthesis Protocol" : "3-Card Cross-Tech Interoperability & Synthesis"}
              placeholder="How do all 3 frontier tech cards communicate and work cohesively together in your architecture pipeline?"
              value={form.techUsage['cross_synthesis'] ?? ''}
              onChange={(e) => updateTech('cross_synthesis', e.target.value)}
              disabled={disabled}
            />
          )}
        </div>
      )}

      {currentRound === 1 ? (
        <Textarea
          label="Core Strategic Approach & Unique Angle *"
          placeholder="What is the most critical insight or structured angle your squad brings to this problem that other solutions miss?"
          value={form.solutionName ? form.techUsage['r1_angle'] || '' : ''}
          onChange={(e) => updateTech('r1_angle', e.target.value)}
          disabled={disabled}
        />
      ) : currentRound === 2 ? (
        <Textarea
          label="Main Advantage & Novelty *"
          placeholder="What's the biggest architectural strength and unique innovation of your approach compared to existing solutions?"
          value={form.mainAdvantage}
          onChange={(e) => update('mainAdvantage', e.target.value)}
          disabled={disabled}
          required
        />
      ) : (
        <Textarea
          label="Production Viability, Real-World Moat & Scalability [25 Pts] *"
          placeholder="Explain why this master architecture wins in real-world deployment, security protocols, edge fallback resilience, and commercial viability."
          value={form.mainAdvantage}
          onChange={(e) => update('mainAdvantage', e.target.value)}
          disabled={disabled}
          required
        />
      )}

      <Textarea
        label={
          currentRound === 1
            ? "Key Operational Risks & Anticipated Constraints *"
            : isRound3
            ? "Live Stage Defense & Vulnerability Mitigation [15 Pts] *"
            : "Main Limitation & Risk Mitigation *"
        }
        placeholder={
          currentRound === 1
            ? "What is the biggest operational risk, edge case, or constraint in this problem domain, and how will your team defend it during judge Q&A?"
            : isRound3
            ? "Anticipate live judge attack vectors, edge-case failure modes, and your architectural mitigations."
            : "Be honest — what's the weakest point, key constraint, or risk, and how do you mitigate it?"
        }
        value={form.mainLimitation}
        onChange={(e) => update('mainLimitation', e.target.value)}
        disabled={disabled}
        required
      />

      {!disabled && (
        <Button type="submit" size="lg" fullWidth className="glow-accent font-bold py-3.5 shadow-xl">
          <FileText size={16} className="mr-1.5" />
          {submitLabel ?? (
            currentRound === 1
              ? 'Submit Problem Understanding & Analysis'
              : isRound3
              ? 'Submit Final Pitch Architecture & Slides'
              : 'Submit Round 2 Solution Architecture'
          )}
        </Button>
      )}
    </form>
  )
}
