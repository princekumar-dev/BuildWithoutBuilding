import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean | 'accent' | 'purple' | 'amber' | 'gold'
  variant?: 'default' | 'glass' | 'stereo' | 'holo'
  interactive?: boolean
  hoverEffect?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
}

const variantMap = {
  default: 'bg-bwb-surface border border-bwb-border/80 shadow-lg',
  glass: 'glass-card',
  stereo: 'stereo-card',
  holo: 'holo-card',
}

export function Card({
  children,
  className = '',
  glow,
  variant = 'default',
  interactive = false,
  hoverEffect = false,
  padding = 'md',
}: CardProps) {
  const glowClass =
    glow === true || glow === 'accent'
      ? 'glow-accent'
      : glow === 'purple'
      ? 'glow-purple'
      : glow === 'amber' || glow === 'gold'
      ? 'glow-gold'
      : ''

  const interactiveClass =
    interactive || hoverEffect
      ? 'stereo-card-interactive cursor-pointer transition-all duration-300'
      : ''

  return (
    <div
      className={`rounded-2xl relative ${variantMap[variant]} ${paddingMap[padding]} ${glowClass} ${interactiveClass} ${className}`}
    >
      {children}
    </div>
  )
}

