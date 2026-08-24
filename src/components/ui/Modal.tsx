import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = '' }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
          <div
            ref={overlayRef}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={onClose}
          />
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6 py-6 sm:py-10 pointer-events-none">
            <motion.div
              className={`pointer-events-auto relative w-full ${maxWidth} max-h-[85vh] flex flex-col bg-bwb-surface border border-white/15 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden my-auto`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            >
              {title && (
                <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-bwb-surface-2/80 backdrop-blur-xl">
                  <h2 className="font-display text-base sm:text-lg font-bold text-bwb-text tracking-tight flex items-center gap-2">
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-bwb-muted hover:text-bwb-text hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
