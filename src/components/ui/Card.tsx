import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-4 sm:p-8',
}


export function Card({ children, className = '', glow, padding = 'md' }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-bwb-surface border border-bwb-border ${paddingMap[padding]} ${glow ? 'glow-accent' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
