import { useEffect, useState, useRef } from 'react'
import { SoundFX } from '../lib/soundEffects'

export function useCountdown(initialSeconds: number, running = true) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const prevSecondsRef = useRef(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
    prevSecondsRef.current = initialSeconds
  }, [initialSeconds])

  useEffect(() => {
    if (!running || seconds <= 0) return
    const id = setInterval(() => {
      setSeconds((s) => {
        const next = Math.max(0, s - 1)
        if (next <= 5 && next > 0) {
          SoundFX.playTick()
        } else if (next === 0 && s > 0) {
          SoundFX.playBuzzer()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, seconds])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const isUrgent = seconds <= 60 && seconds > 0
  const isExpired = seconds === 0

  return { seconds, minutes, secs, formatted, isUrgent, isExpired }
}

