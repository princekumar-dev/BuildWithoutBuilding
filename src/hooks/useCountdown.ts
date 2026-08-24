import { useEffect, useState } from 'react'
import { SoundFX } from '../lib/soundEffects'

export function useCountdown(initialSeconds: number, running = true, targetTime?: string | number | Date | null) {
  const calculateRemaining = (): number => {
    if (targetTime) {
      const targetMs = new Date(targetTime).getTime()
      if (!isNaN(targetMs) && targetMs > 0) {
        const diffSecs = Math.round((targetMs - Date.now()) / 1000)
        return Math.max(0, diffSecs)
      }
    }
    return Math.max(0, initialSeconds)
  }

  const [seconds, setSeconds] = useState<number>(calculateRemaining)

  useEffect(() => {
    setSeconds(calculateRemaining())
  }, [initialSeconds, targetTime])

  useEffect(() => {
    if (!running) return

    const tick = () => {
      if (targetTime) {
        const targetMs = new Date(targetTime).getTime()
        if (!isNaN(targetMs) && targetMs > 0) {
          const next = Math.max(0, Math.round((targetMs - Date.now()) / 1000))
          setSeconds((current) => {
            if (next !== current) {
              if (next <= 5 && next > 0 && current > next) {
                SoundFX.playTick()
              } else if (next === 0 && current > 0) {
                SoundFX.playBuzzer()
              }
              return next
            }
            return current
          })
          return
        }
      }

      // Fallback relative tick
      setSeconds((s) => {
        if (s <= 0) return 0
        const next = Math.max(0, s - 1)
        if (next <= 5 && next > 0) {
          SoundFX.playTick()
        } else if (next === 0 && s > 0) {
          SoundFX.playBuzzer()
        }
        return next
      })
    }

    // High frequency interval (250ms) to ensure exact second transitions without drift
    const id = setInterval(tick, targetTime ? 250 : 1000)
    return () => clearInterval(id)
  }, [running, targetTime])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const isUrgent = seconds <= 60 && seconds > 0
  const isExpired = seconds === 0

  return { seconds, minutes, secs, formatted, isUrgent, isExpired }
}


