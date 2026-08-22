import { useEffect, useState, useRef, type ReactNode } from 'react'
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

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(0, items.length - 1)))
  }, [items.length])

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
    const threshold = 48
    if (info.offset.x < -threshold || info.velocity.x < -500) paginate(1)
    else if (info.offset.x > threshold || info.velocity.x > 500) paginate(-1)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.9 }),
  }

  if (items.length === 0) return null

  return (
    <div className={`relative ${className}`} ref={constraintsRef}>
      <div className="relative min-h-[320px] sm:min-h-[420px] overflow-hidden">
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
            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y select-none"
            onClick={() => onSelect?.(items[active], active)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') paginate(-1)
              if (event.key === 'ArrowRight') paginate(1)
            }}
            role="group"
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label={`Card ${active + 1} of ${items.length}`}
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
            className="absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-2 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-bwb-muted hover:text-bwb-accent transition-colors touch-manipulation"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            className="absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-2 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-bwb-muted hover:text-bwb-accent transition-colors touch-manipulation"
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
