import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, Zap, Layers } from 'lucide-react'
import type { Technology } from '../../types'

interface TechnologyCardProps {
  technology?: Technology
  revealed?: boolean
  index?: number
  locked?: boolean
  onClick?: () => void
  clickable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const techCategoryStyles: Record<
  string,
  {
    gradient: string
    border: string
    badge: string
    accentColor: string
    glow: string
    icon: string
  }
> = {
  Intelligence: {
    gradient: 'from-cyan-950/60 via-cyan-900/30 to-bwb-surface/90',
    border: 'border-cyan-500/50 hover:border-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentColor: '#00e5c7',
    glow: 'rgba(0, 229, 199, 0.25)',
    icon: '🧠',
  },
  Connectivity: {
    gradient: 'from-blue-950/60 via-blue-900/30 to-bwb-surface/90',
    border: 'border-blue-500/50 hover:border-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentColor: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.25)',
    icon: '📡',
  },
  Mobility: {
    gradient: 'from-purple-950/60 via-purple-900/30 to-bwb-surface/90',
    border: 'border-purple-500/50 hover:border-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentColor: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    icon: '🚁',
  },
  Security: {
    gradient: 'from-red-950/60 via-red-900/30 to-bwb-surface/90',
    border: 'border-red-500/50 hover:border-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40',
    accentColor: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.25)',
    icon: '🔐',
  },
  Interface: {
    gradient: 'from-emerald-950/60 via-emerald-900/30 to-bwb-surface/90',
    border: 'border-emerald-500/50 hover:border-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    icon: '📱',
  },
  Infrastructure: {
    gradient: 'from-amber-950/60 via-amber-900/30 to-bwb-surface/90',
    border: 'border-amber-500/50 hover:border-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    icon: '☁️',
  },
}

export function TechnologyCard({
  technology,
  revealed = true,
  index = 0,
  onClick,
  clickable = false,
  size = 'md',
}: TechnologyCardProps) {
  const categoryStyle = technology?.category
    ? techCategoryStyles[technology.category] ?? {
        gradient: 'from-cyan-950/40 via-cyan-900/20 to-bwb-surface',
        border: 'border-bwb-accent/50 hover:border-bwb-accent',
        badge: 'bg-bwb-surface text-bwb-accent border-bwb-accent/30',
        accentColor: '#00e5c7',
        glow: 'rgba(0, 229, 199, 0.2)',
        icon: '⚡',
      }
    : {
        gradient: 'from-cyan-950/40 via-cyan-900/20 to-bwb-surface',
        border: 'border-bwb-accent/50 hover:border-bwb-accent',
        badge: 'bg-bwb-surface text-bwb-accent border-bwb-accent/30',
        accentColor: '#00e5c7',
        glow: 'rgba(0, 229, 199, 0.2)',
        icon: '⚡',
      }

  // Compact layout for Sidebar in Build Phase
  if (size === 'sm') {
    return (
      <div className={`rounded-2xl border ${categoryStyle.border} bg-gradient-to-r ${categoryStyle.gradient} p-3.5 relative overflow-hidden shadow-lg stereo-card`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-bwb-bg/70 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {technology?.icon ?? '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-display font-bold text-sm text-bwb-text">
                  {technology?.name ?? 'Technology'}
                </span>
                {technology?.category && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryStyle.badge}`}>
                    {technology.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-bwb-muted line-clamp-2 leading-relaxed">
                {technology?.description ?? 'Must be integrated into your architecture.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-bwb-accent bg-bwb-bg/60 px-2 py-0.5 rounded-md border border-white/5 shrink-0">
            #{index + 1}
          </span>
        </div>
      </div>
    )
  }

  const sizeClasses = {
    sm: 'h-[230px]',
    md: 'h-[300px]',
    lg: 'h-[380px] sm:h-[400px]',
  }

  return (
    <div className={`perspective-1000 w-full ${sizeClasses[size]}`}>
      <motion.div
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.65, type: 'spring', stiffness: 240, damping: 22 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* FRONT OF CARD: Tactical Mystery Slot */}
        <div
          onClick={clickable && !revealed ? onClick : undefined}
          className={`absolute inset-0 backface-hidden rounded-3xl stereo-card border flex flex-col items-center justify-between p-6 text-center transition-all select-none ${
            clickable && !revealed
              ? 'cursor-pointer border-bwb-accent/60 hover:border-bwb-accent hover:shadow-2xl hover:shadow-bwb-accent/25 glow-pulse ring-1 ring-bwb-accent/20'
              : 'border-bwb-border'
          }`}
        >
          {/* Top slot pill */}
          <div className="w-full flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-bwb-surface-2 text-bwb-muted border border-white/5">
              SLOT #0{index + 1}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-bwb-accent font-bold">
              <Sparkles size={12} className="animate-spin" /> MYSTERY DRAW
            </span>
          </div>

          {/* Center Hologram Icon */}
          <div className="my-auto flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl glass flex items-center justify-center border-2 border-bwb-accent/40 shadow-inner shadow-bwb-accent/20">
                <Sparkles className="text-bwb-accent animate-pulse" size={38} />
              </div>
              <span className="absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-bwb-accent text-bwb-bg shadow-lg tracking-wider">
                CARD {index + 1}
              </span>
            </div>

            <h4 className="font-display font-bold text-base sm:text-lg tracking-wider uppercase text-bwb-text mt-2">
              {clickable ? 'Tap to Reveal' : 'Mystery Tech Card'}
            </h4>
            <p className="text-xs text-bwb-muted mt-0.5">
              Random technological constraint for your team
            </p>
          </div>

          {/* Bottom Action */}
          {clickable && (
            <motion.div
              animate={{ scale: [0.98, 1.02, 0.98] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="w-full py-2.5 rounded-2xl glass-accent text-xs font-bold text-bwb-accent uppercase tracking-widest border border-bwb-accent/50 shadow-lg shadow-bwb-accent/15 flex items-center justify-center gap-1.5"
            >
              <Zap size={14} className="fill-bwb-accent" />
              <span>Click to Reveal</span>
            </motion.div>
          )}
        </div>

        {/* BACK OF CARD: Holographic Revealed Tech Card */}
        <div
          style={{ transform: 'rotateY(180deg)' }}
          className={`absolute inset-0 backface-hidden rounded-3xl border-2 ${categoryStyle.border} bg-gradient-to-br ${categoryStyle.gradient} stereo-card p-6 flex flex-col justify-between overflow-hidden shadow-2xl relative`}
        >
          {/* Ambient Glow Background */}
          <div
            className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: categoryStyle.accentColor }}
          />

          {/* Header Row: Slot ID & Category Chip */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-bwb-bg/60 text-bwb-text/80 border border-white/10">
              SLOT #{index + 1}
            </span>

            {technology?.category && (
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-md ${categoryStyle.badge}`}>
                <span>{categoryStyle.icon}</span>
                <span>{technology.category}</span>
              </span>
            )}
          </div>

          {/* Hero Tech Showcase */}
          <div className="my-auto relative z-10 py-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-bwb-bg/70 border border-white/10 flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0">
                {technology?.icon ?? '⚡'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-bwb-muted font-bold block mb-0.5">
                  TECH COMPONENT
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-bwb-text leading-tight tracking-tight">
                  {technology?.name ?? 'Technology'}
                </h3>
              </div>
            </div>

            {/* Architecture Role & Function Box */}
            <div className="p-3.5 rounded-2xl bg-bwb-bg/50 border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-bwb-accent font-bold mb-1 flex items-center gap-1">
                <Layers size={11} /> Architecture Function:
              </p>
              <p className="text-xs sm:text-sm text-bwb-text/90 leading-relaxed font-medium">
                {technology?.description ?? 'Must be integrated into your core solution design.'}
              </p>
            </div>
          </div>

          {/* Footer: Live Active Status */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
            <div className="flex items-center gap-1.5 text-bwb-success font-semibold">
              <CheckCircle2 size={14} className="text-bwb-success" />
              <span>Assigned to Stack</span>
            </div>
            <span className="font-mono text-[11px] text-bwb-muted">
              Card {index + 1}/3
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
