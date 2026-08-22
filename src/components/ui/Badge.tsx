type BadgeVariant = 'default' | 'accent' | 'warn' | 'purple' | 'success' | 'danger'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-bwb-surface-2 text-bwb-muted border-bwb-border',
  accent: 'bg-bwb-accent/10 text-bwb-accent border-bwb-accent/30',
  warn: 'bg-bwb-warn/10 text-bwb-warn border-bwb-warn/30',
  purple: 'bg-bwb-purple/10 text-bwb-purple border-bwb-purple/30',
  success: 'bg-bwb-success/10 text-bwb-success border-bwb-success/30',
  danger: 'bg-bwb-danger/10 text-bwb-danger border-bwb-danger/30',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
