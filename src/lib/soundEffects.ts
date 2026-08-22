// Web Audio API zero-dependency sound synthesizer.
// Audio is unlocked after a real user interaction because browsers block autoplay.

let audioCtx: AudioContext | null = null
let resumePromise: Promise<void> | null = null
let hasLoggedAudioError = false
const SOUND_PREFERENCE_KEY = 'bwb-sound-enabled'

function getInitialSoundSetting() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== 'false'
}

let soundEnabled = getInitialSoundSetting()

function reportAudioError(error: unknown) {
  if (hasLoggedAudioError) return
  hasLoggedAudioError = true
  console.warn('Tournament sound effects are unavailable in this browser session.', error)
}

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioCtx?.state === 'closed') audioCtx = null
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtxClass) return null
    try {
      audioCtx = new AudioCtxClass()
    } catch (error) {
      reportAudioError(error)
      return null
    }
  }
  return audioCtx
}

function resumeAudioContext() {
  const ctx = createAudioContext()
  if (!ctx || ctx.state === 'running') return Promise.resolve(ctx)
  if (!resumePromise) {
    resumePromise = ctx.resume()
      .catch((error) => reportAudioError(error))
      .finally(() => { resumePromise = null })
  }
  return resumePromise.then(() => (ctx.state === 'running' ? ctx : null))
}

function withAudio(play: (ctx: AudioContext) => void) {
  if (!soundEnabled) return
  void resumeAudioContext().then((ctx) => {
    if (!ctx || !soundEnabled) return
    try {
      play(ctx)
    } catch (error) {
      reportAudioError(error)
    }
  })
}

function setPreference(enabled: boolean) {
  soundEnabled = enabled
  if (typeof window !== 'undefined') window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled))
}

if (typeof window !== 'undefined') {
  const unlockAudio = () => { void resumeAudioContext() }
  window.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true })
  window.addEventListener('keydown', unlockAudio, { capture: true })
}

function playTone(ctx: AudioContext, frequency: number, duration: number, type: OscillatorType, volume: number, targetFrequency?: number) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)
  if (targetFrequency) osc.frequency.exponentialRampToValueAtTime(targetFrequency, now + Math.min(duration * 0.67, 0.3))
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration)
}

export const SoundFX = {
  isMuted: () => !soundEnabled,
  toggleSound: () => {
    setPreference(!soundEnabled)
    if (soundEnabled) SoundFX.playSuccessChime()
    return soundEnabled
  },
  setSoundEnabled: (enabled: boolean) => setPreference(enabled),

  playPhaseTransition: () => withAudio((ctx) => playTone(ctx, 220, 0.45, 'sine', 0.15, 880)),
  playEliminationAlert: () => withAudio((ctx) => playTone(ctx, 320, 0.6, 'sawtooth', 0.18, 110)),
  playSuccessChime: () => withAudio((ctx) => playTone(ctx, 587.33, 0.35, 'sine', 0.15, 880)),
  playBuzzer: () => withAudio((ctx) => playTone(ctx, 150, 0.5, 'sawtooth', 0.25, 120)),
  playTick: () => withAudio((ctx) => playTone(ctx, 900, 0.08, 'sine', 0.1)),
  playCutePop: (index = 0) => withAudio((ctx) => {
    const pitches = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66]
    const note = pitches[Math.abs(index) % pitches.length]
    playTone(ctx, note, 0.22, 'sine', 0.12, note * 1.5)
  }),
  playVictoryFanfare: () => withAudio((ctx) => {
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + index * 0.1
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.8)
    })
  }),
}
