import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Sparkles, Zap, Shield, 
  ExternalLink, Maximize2, Monitor, Radio, Play, Pause
} from 'lucide-react'
import type { Team, SlideItem } from '../../types'
import { generateNativeSlides } from '../forms/SolutionForm'

const SLIDE_DURATION_MS = 22000 // 22 seconds auto-advance per slide

interface LivePitchDeckProps {
  team: Team
  activeSlideIndex?: number
  isController?: boolean
  onSlideChange?: (index: number) => void
  catalogProblems?: Array<{ id: string; title: string; category: string; twist?: string }>
  round?: number
}

export function LivePitchDeck({
  team,
  activeSlideIndex = 0,
  isController = false,
  onSlideChange,
  catalogProblems = [],
  round = 1,
}: LivePitchDeckProps) {
  const [localIndex, setLocalIndex] = useState(activeSlideIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [progress, setProgress] = useState(0)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const teamProblem = catalogProblems.find((p) => p.id === team.selectedProblemId)

  useEffect(() => {
    setLocalIndex(activeSlideIndex)
    setProgress(0)
  }, [activeSlideIndex])

  const submission = team.submission
  const embedUrl = submission?.presentationEmbedUrl || (submission?.presentationUrl?.includes('embed') ? submission.presentationUrl : null)

  // Construct slides matching current round (or fallback to round-specific generator)
  const isSubmissionMatchingCurrentRound = submission?.slides && submission.slides.length > 0 && (
    (round === 1 && submission.slides[0]?.badge?.includes('ROUND 1')) ||
    (round === 2 && submission.slides[0]?.badge?.includes('ROUND 2')) ||
    (round === 3 && submission.slides[0]?.badge?.includes('GRAND FINALS'))
  )

  const slides: SlideItem[] = isSubmissionMatchingCurrentRound
    ? submission!.slides!
    : generateNativeSlides(
        submission || {
          solutionName: round === 1 ? 'Problem & Landscape Formulation' : 'System Architecture Proposal',
          whatItDoes: 'Scalable autonomous domain architecture and ecosystem strategy.',
          howItWorks: 'Real-time telemetry and edge computation loop.',
          mainAdvantage: 'High reliability and resilient fault tolerance.',
          mainLimitation: 'Initial calibration requirements.',
        },
        team.technologies || [],
        round
      )

  const maxIndex = slides.length - 1
  const currentIndex = Math.max(0, Math.min(localIndex, maxIndex))
  const currentSlide = slides[currentIndex] || slides[0]

  const goToSlide = useCallback((newIdx: number) => {
    const clamped = Math.max(0, Math.min(newIdx, maxIndex))
    setLocalIndex(clamped)
    setProgress(0)
    if (onSlideChange) {
      onSlideChange(clamped)
    }
  }, [maxIndex, onSlideChange])

  // Auto-advance slides periodically across projector and presenter devices
  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      return
    }

    const intervalStep = 100 // ms
    const increment = (intervalStep / SLIDE_DURATION_MS) * 100

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          const nextIdx = (currentIndex + 1) % (maxIndex + 1)
          goToSlide(nextIdx)
          return 0
        }
        return prev + increment
      })
    }, intervalStep)

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [isAutoPlay, currentIndex, maxIndex, slides.length, goToSlide])

  // Keyboard navigation for controller (instantly skips and resets auto-advance)
  useEffect(() => {
    if (!isController) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'Space', 'PageDown'].includes(e.code)) {
        e.preventDefault()
        goToSlide((currentIndex + 1) % (maxIndex + 1))
      } else if (['ArrowLeft', 'PageUp'].includes(e.code)) {
        e.preventDefault()
        goToSlide((currentIndex - 1 + (maxIndex + 1)) % (maxIndex + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isController, currentIndex, maxIndex, goToSlide])

  // If user uploaded a PDF/Image file or provided a presentation URL
  const rawUrl = submission?.presentationUrl
  const isDataPdf = rawUrl?.startsWith('data:application/pdf')
  const isDataImage = rawUrl?.startsWith('data:image/')

  if (embedUrl || isDataPdf || isDataImage) {
    const displaySrc = isDataPdf ? `${rawUrl}#page=${currentIndex + 1}&view=FitH` : (embedUrl || rawUrl)

    return (
      <div className={`w-full rounded-3xl overflow-hidden bg-bwb-bg/90 border border-cyan-500/30 shadow-2xl space-y-3 p-4 sm:p-5 relative ${isFullscreen ? 'fixed inset-4 z-50 bg-black/95' : ''}`}>
        <div className="flex items-center justify-between px-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radio size={14} className="animate-pulse" />
            <span className="font-bold">LIVE STAGE PRESENTATION · {team.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {!rawUrl?.startsWith('data:') && (
              <a
                href={rawUrl || embedUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-bwb-text flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={12} /> Open Link
              </a>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 relative bg-black shadow-inner flex items-center justify-center">
          {isDataImage ? (
            <img src={rawUrl} alt={`${team.name} Slide`} className="max-w-full max-h-full object-contain" />
          ) : (
            <iframe
              src={displaySrc || ''}
              title={`${team.name} Pitch Deck`}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
        </div>

        {/* Presenter Remote Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToSlide(currentIndex - 1)}
              disabled={currentIndex <= 0}
              className="px-3 py-1.5 rounded-xl bg-bwb-surface-2 hover:bg-white/15 text-bwb-text disabled:opacity-30 disabled:pointer-events-none border border-white/10 flex items-center gap-1 font-bold"
            >
              <ChevronLeft size={14} /> Prev Page
            </button>
            <span className="text-cyan-300 font-bold px-2">Page {currentIndex + 1}</span>
            <button
              onClick={() => goToSlide(currentIndex + 1)}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black flex items-center gap-1 shadow-md"
            >
              Next Page <ChevronRight size={14} />
            </button>
          </div>

          <div className="text-[11px] text-emerald-300 font-bold hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>STADIUM PROJECTOR SYNCED</span>
          </div>
        </div>
      </div>
    )
  }

  if (!currentSlide) return null

  // Native Futuristic Holographic Slide Deck Viewer
  return (
    <div className={`w-full flex flex-col justify-between rounded-3xl bg-gradient-to-br from-bwb-surface/95 via-bwb-bg/95 to-bwb-surface/95 border border-cyan-500/30 shadow-2xl p-5 sm:p-7 relative overflow-hidden transition-all ${isFullscreen ? 'fixed inset-4 z-50 bg-black/95' : ''}`}>
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-xl text-[11px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
            <Sparkles size={13} className="text-cyan-400" />
            {currentSlide.badge || `SLIDE ${currentIndex + 1} OF ${slides.length}`}
          </span>
          <span className="text-xs font-mono font-bold text-bwb-muted">
            {team.name} ({team.department || 'Squad'} · {team.members?.length || 3} Members)
          </span>
          {teamProblem && (
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              {teamProblem.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-Slide Toggle Button */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
              isAutoPlay
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-sm'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
            title={isAutoPlay ? 'Auto-Advancing Slides (Click to Pause)' : 'Auto-Advancing Paused (Click to Resume)'}
          >
            {isAutoPlay ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoPlay ? 'Auto-Slide' : 'Paused'}</span>
          </button>

          {/* Projector Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>STADIUM PROJECTOR SYNCED</span>
          </div>

          {!isController && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-bwb-muted hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Animated Slide Content Area */}
      <div className="min-h-[260px] sm:min-h-[300px] flex flex-col justify-center relative z-10 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${currentSlide.id}-${currentIndex}`}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-4 text-left"
          >
            {/* Title and Subtitle */}
            <div>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-bwb-text tracking-tight flex items-center gap-2.5">
                <span>{currentSlide.icon || '⚡'}</span>
                <span>{currentSlide.title}</span>
              </h2>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm text-cyan-300/80 font-mono mt-1 font-semibold">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Visual Content Layouts */}
            {currentSlide.visualType === 'tech-stack' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {(team.technologies && team.technologies.length > 0 ? team.technologies : [
                  { id: 't1', name: 'Frontier AI Engine', icon: '🤖', category: 'Intelligence' },
                  { id: 't2', name: 'Edge Telemetry Mesh', icon: '📡', category: 'Hardware' },
                  { id: 't3', name: 'Autonomous Dispatch', icon: '⚡', category: 'Automation' },
                ]).map((tech) => {
                  const usage = submission?.techUsage?.[tech.id] || 'Integrated into core architecture.'
                  return (
                    <div
                      key={tech.id}
                      className="p-4 rounded-2xl bg-bwb-surface-2/90 border border-cyan-500/30 shadow-lg space-y-1.5"
                    >
                      <span className="text-3xl block">{tech.icon}</span>
                      <h4 className="font-display font-bold text-sm text-bwb-text">{tech.name}</h4>
                      <p className="text-xs text-bwb-muted line-clamp-3 leading-relaxed">{usage}</p>
                    </div>
                  )
                })}
              </div>
            ) : currentSlide.visualType === 'comparison' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 shadow-md">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 uppercase">
                    <Shield size={14} className="text-emerald-400" />
                    <span>Competitive Advantage</span>
                  </div>
                  <p className="text-sm text-bwb-text/90 leading-relaxed font-medium">
                    {submission?.mainAdvantage || 'High operational uptime, rapid edge dispatch, and resilient fallback protocol.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 shadow-md">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase">
                    <Zap size={14} className="text-amber-400" />
                    <span>Trade-Offs & Defense Strategy</span>
                  </div>
                  <p className="text-sm text-bwb-text/90 leading-relaxed font-medium">
                    {submission?.mainLimitation || 'Edge calibration latency mitigated by decentralized peer synchronization.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {currentSlide.bulletPoints && currentSlide.bulletPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-bwb-surface-2/80 border border-white/10 flex items-start gap-3 shadow-md hover:border-cyan-400/40 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-bwb-text font-medium leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Controls & Queue Tabs */}
      <div className="pt-3 mt-2 border-t border-white/10 relative z-10 space-y-2.5">
        {/* Auto-Slide Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative" title={`Auto-advances every ${SLIDE_DURATION_MS / 1000}s`}>
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Slide Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap sm:flex-nowrap justify-between sm:justify-start">
          {slides.map((s, idx) => {
            const isActive = idx === currentIndex
            const shortLabels: Record<number, Record<number, string>> = {
              1: { 0: 'Overview', 1: 'Root Causes', 2: 'Gap Analysis', 3: 'Tech Stack', 4: 'Defense' },
              2: { 0: 'Overview', 1: 'Alignment', 2: 'System Flow', 3: '3 Frontier Tech', 4: 'Defense' },
              3: { 0: 'Overview', 1: 'Deep Dive', 2: 'Architecture', 3: 'Tech Matrix', 4: 'Final Edge' },
            }
            const tabLabel = shortLabels[round]?.[idx] || (s.title.length > 16 ? `${s.title.slice(0, 14)}..` : s.title)

            return (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 border whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg scale-105 font-black'
                    : 'bg-white/5 hover:bg-white/10 text-bwb-muted border-white/10 hover:text-white'
                }`}
              >
                <span className="text-xs">{s.icon || `#${idx + 1}`}</span>
                <span>{tabLabel}</span>
              </button>
            )
          })}
        </div>

        {/* Controller Tip for Presenters */}
        {isController && (
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <div className="flex items-center gap-1.5">
              <Monitor size={13} className="text-cyan-400 animate-pulse" />
              <span>You are controlling the Stadium Projector slides live</span>
            </div>
            <span className="hidden sm:inline text-bwb-muted">
              Press <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white border border-white/10">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white border border-white/10">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white border border-white/10">Space</kbd> to skip
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
