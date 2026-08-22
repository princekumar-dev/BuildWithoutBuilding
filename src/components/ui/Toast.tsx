import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors: Record<ToastType, string> = {
  success: 'border-bwb-success/40 bg-bwb-success/10',
  error: 'border-bwb-danger/40 bg-bwb-danger/10',
  warning: 'border-bwb-warn/40 bg-bwb-warn/10',
  info: 'border-bwb-accent/40 bg-bwb-accent/10',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-bwb-success',
  error: 'text-bwb-danger',
  warning: 'text-bwb-warn',
  info: 'text-bwb-accent',
}

let toastId = 0

const listeners = new Set<(toasts: Toast[]) => void>()
let toasts: Toast[] = []

function notify(message: string, type: ToastType = 'info') {
  const id = String(++toastId)
  toasts = [...toasts, { id, message, type }]
  listeners.forEach((fn) => fn(toasts))
  setTimeout(() => dismiss(id), 4000)
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  listeners.forEach((fn) => fn(toasts))
}

export const toast = {
  success: (msg: string) => notify(msg, 'success'),
  error: (msg: string) => notify(msg, 'error'),
  warning: (msg: string) => notify(msg, 'warning'),
  info: (msg: string) => notify(msg, 'info'),
}

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    listeners.add(setItems)
    return () => { listeners.delete(setItems) }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = icons[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg min-w-[280px] max-w-sm ${colors[t.type]}`}
            >
              <Icon size={20} className={`mt-0.5 shrink-0 ${iconColors[t.type]}`} />
              <p className="text-sm text-bwb-text flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="p-0.5 rounded text-bwb-muted hover:text-bwb-text transition-colors cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
