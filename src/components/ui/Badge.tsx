type BadgeVariant = 'default' | 'accent' | 'warn' | 'purple' | 'success' | 'danger' | 'gold'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  glow?: boolean
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-bwb-surface-2/90 text-bwb-muted border-white/10 shadow-sm',
  accent: 'bg-bwb-accent/15 text-bwb-accent border-bwb-accent/35 shadow-[0_0_12px_rgba(0,229,199,0.15)]',
  warn: 'bg-bwb-warn/15 text-bwb-warn border-bwb-warn/35 shadow-[0_0_12px_rgba(255,107,53,0.15)]',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/35 shadow-[0_0_12px_rgba(167,139,250,0.15)]',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
  danger: 'bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
  gold: 'bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-[0_0_14px_rgba(251,191,36,0.18)]',
}

export function Badge({ children, variant = 'default', className = '', glow = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold font-mono tracking-wide border backdrop-blur-md transition-all ${variants[variant]} ${glow ? 'animate-pulse' : ''} ${className}`}
    >
      {children}
    </span>
  )
}

