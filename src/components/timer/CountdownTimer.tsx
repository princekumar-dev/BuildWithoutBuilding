import { useCountdown } from '../../hooks/useCountdown'

interface CountdownTimerProps {
  initialSeconds: number
  running?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  showExpired?: boolean
}

const sizeClasses = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-4xl',
  lg: 'text-4xl sm:text-6xl',
  xl: 'text-5xl sm:text-8xl',
}


export function CountdownTimer({
  initialSeconds,
  running = true,
  size = 'md',
  label,
  showExpired = true,
}: CountdownTimerProps) {
  const { formatted, isUrgent, isExpired } = useCountdown(initialSeconds, running)

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs uppercase tracking-widest text-bwb-muted font-display">{label}</span>}
      <div
        className={`font-display font-bold tabular-nums ${sizeClasses[size]} ${
          isExpired ? 'text-bwb-danger' : isUrgent ? 'text-bwb-warn animate-pulse-ring' : 'text-bwb-accent'
        }`}
      >
        {isExpired && showExpired ? 'TIME!' : formatted}
      </div>
    </div>
  )
}
