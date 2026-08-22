import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { SoundFX } from '../../lib/soundEffects'

export function SoundToggle() {
  const [muted, setMuted] = useState(SoundFX.isMuted())

  const handleToggle = () => {
    const isNowActive = SoundFX.toggleSound()
    setMuted(!isNowActive)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={muted ? 'Unmute tournament sound effects' : 'Mute tournament sound effects'}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-2xl flex items-center gap-2 text-xs font-mono font-bold touch-manipulation select-none ${
        muted
          ? 'bg-bwb-surface-2/90 text-bwb-muted border-white/10 hover:text-bwb-text hover:border-bwb-accent/40'
          : 'bg-purple-600/90 text-white border-purple-400 shadow-purple-500/30 hover:scale-105 active:scale-95'
      }`}

    >
      {muted ? (
        <>
          <VolumeX size={16} className="text-bwb-muted" />
          <span className="hidden sm:inline">SFX Off</span>
        </>
      ) : (
        <>
          <Volume2 size={16} className="text-white animate-pulse" />
          <span className="hidden sm:inline">SFX Active</span>
        </>
      )}
    </button>
  )
}
