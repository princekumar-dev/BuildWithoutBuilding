import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, CheckCircle2, Info, X } from 'lucide-react'
import { Button } from './Button'

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose, loading])

  const variantStyles = {
    danger: {
      icon: <Trash2 size={24} className="text-red-400" />,
      iconBg: 'bg-red-500/15 border-red-500/30 shadow-red-500/20',
      confirmBtn: 'danger' as const,
      border: 'border-red-500/30',
      glow: 'from-red-500/10 via-transparent to-transparent',
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-amber-400" />,
      iconBg: 'bg-amber-500/15 border-amber-500/30 shadow-amber-500/20',
      confirmBtn: 'secondary' as const,
      border: 'border-amber-500/30',
      glow: 'from-amber-500/10 via-transparent to-transparent',
    },
    info: {
      icon: <Info size={24} className="text-cyan-400" />,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 shadow-cyan-500/20',
      confirmBtn: 'primary' as const,
      border: 'border-cyan-500/30',
      glow: 'from-cyan-500/10 via-transparent to-transparent',
    },
    success: {
      icon: <CheckCircle2 size={24} className="text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/20',
      confirmBtn: 'primary' as const,
      border: 'border-emerald-500/30',
      glow: 'from-emerald-500/10 via-transparent to-transparent',
    },
  }[variant]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !loading && onClose()}
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-md rounded-3xl bg-bwb-surface border ${variantStyles.border} bg-gradient-to-b ${variantStyles.glow} p-6 shadow-2xl shadow-black/90 z-10`}
          >
            {/* Close Icon Button */}
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon & Content */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-lg ${variantStyles.iconBg}`}>
                {variantStyles.icon}
              </div>

              <h3 className="font-display text-xl font-bold text-bwb-text mb-2 tracking-tight">
                {title}
              </h3>

              <div className="text-xs sm:text-sm text-bwb-muted leading-relaxed mb-6">
                {typeof message === 'string' ? <p>{message}</p> : message}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  size="md"
                  disabled={loading}
                  onClick={onClose}
                  className="font-bold text-xs justify-center"
                >
                  {cancelText}
                </Button>

                <Button
                  type="button"
                  variant={variantStyles.confirmBtn}
                  fullWidth
                  size="md"
                  disabled={loading}
                  onClick={onConfirm}
                  className={`font-bold text-xs justify-center ${variant === 'info' || variant === 'success' ? 'glow-accent' : ''}`}
                >
                  {loading ? 'Processing...' : confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
