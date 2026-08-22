import { useState, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SwipeCarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode
  onSelect?: (item: T, index: number) => void
  className?: string
  showDots?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function SwipeCarousel<T>({
  items,
  renderItem,
  onSelect,
  className = '',
  showDots = true,
  showArrows = true,
}: SwipeCarouselProps<T>) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(0)
  const constraintsRef = useRef(null)

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setActive((prev) => {
      const next = prev + newDirection
      if (next < 0) return items.length - 1
      if (next >= items.length) return 0
      return next
    })
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x < -threshold) paginate(1)
    else if (info.offset.x > threshold) paginate(-1)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.9 }),
  }

  if (items.length === 0) return null

  return (
    <div className={`relative ${className}`} ref={constraintsRef}>
      <div className="relative h-[420px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onClick={() => onSelect?.(items[active], active)}
          >
            {renderItem(items[active], active, true)}
          </motion.div>
        </AnimatePresence>
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-bwb-muted hover:text-bwb-accent transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-bwb-muted hover:text-bwb-accent transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {showDots && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i) }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? 'w-8 bg-bwb-accent' : 'w-2 bg-bwb-border hover:bg-bwb-muted'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-bwb-muted mt-3">
        Swipe or use arrows · {active + 1} / {items.length}
      </p>
    </div>
  )
}
