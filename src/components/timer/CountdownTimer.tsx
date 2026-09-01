import { useEffect, useRef } from 'react'
import { useCountdown } from '../../hooks/useCountdown'

interface CountdownTimerProps {
  initialSeconds: number
  targetTime?: string | number | Date | null
  running?: boolean
  isPaused?: boolean
  pausedSeconds?: number | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  showExpired?: boolean
  onComplete?: () => void
}

const sizeClasses = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-4xl',
  lg: 'text-4xl sm:text-6xl',
  xl: 'text-5xl sm:text-8xl',
}


export function CountdownTimer({
  initialSeconds,
  targetTime,
  running = true,
  isPaused = false,
  pausedSeconds,
  size = 'md',
  label,
  showExpired = true,
  onComplete,
}: CountdownTimerProps) {
  const isEffectivelyRunning = running && !isPaused
  const { formatted, isUrgent, isExpired } = useCountdown(initialSeconds, isEffectivelyRunning, targetTime, isPaused, pausedSeconds)
  const completedRef = useRef(false)

  useEffect(() => {
    completedRef.current = false
  }, [initialSeconds])

  useEffect(() => {
    if (!isExpired || !isEffectivelyRunning || completedRef.current) return
    completedRef.current = true
    onComplete?.()
  }, [isExpired, onComplete, isEffectivelyRunning])

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs uppercase tracking-widest text-bwb-muted font-display">{label}</span>}
      <div
        className={`font-display font-bold tabular-nums flex items-center gap-2 ${sizeClasses[size]} ${
          isPaused
            ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]'
            : isExpired
            ? 'text-bwb-danger'
            : isUrgent
            ? 'text-bwb-warn animate-pulse-ring'
            : 'text-bwb-accent'
        }`}
      >
        <span>{isExpired && showExpired ? 'TIME!' : formatted}</span>
        {isPaused && (
          <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm">
            ⏸️ PAUSED
          </span>
        )}
      </div>
    </div>
  )
}
