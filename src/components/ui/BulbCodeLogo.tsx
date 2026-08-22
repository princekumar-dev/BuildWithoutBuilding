interface BulbCodeLogoProps {
  className?: string
  size?: number
  glow?: boolean
}

export function BulbCodeLogo({ className = 'w-9 h-9', size = 36, glow = true }: BulbCodeLogoProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Ambient Outer Light Rays Glow */}
      {glow && (
        <div className="absolute -inset-1 rounded-2xl bg-amber-400/25 blur-md pointer-events-none animate-pulse" />
      )}

      {/* Styled Housing */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-amber-500/25 via-bwb-surface-2 to-bwb-surface border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden">
        {/* Subtle radial sheen */}
        <div className="absolute inset-0 bg-radial from-amber-400/10 to-transparent pointer-events-none" />

        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
        >
          {/* Top Filament rays */}
          <line x1="12" y1="1" x2="12" y2="3" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="19.78" y1="4.22" x2="18.36" y2="5.64" stroke="#fbbf24" strokeWidth="1.5" />

          {/* Lightbulb Contour */}
          <path
            d="M9 18h6"
            stroke="#fbbf24"
            strokeWidth="1.8"
          />
          <path
            d="M10 21h4"
            stroke="#fbbf24"
            strokeWidth="1.8"
          />
          <path
            d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 2.2 1.3 4.1 2.8 5.5h7.4c1.5-1.4 2.8-3.3 2.8-5.5A6.5 6.5 0 0 0 12 3z"
            stroke="#fbbf24"
            strokeWidth="1.8"
          />

          {/* Code Brackets </> inside */}
          <path
            d="M9.5 8l-2 1.5 2 1.5"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <path
            d="M14.5 8l2 1.5-2 1.5"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <line
            x1="12.5"
            y1="7.5"
            x2="11.5"
            y2="11.5"
            stroke="#00e5c7"
            strokeWidth="1.6"
          />
        </svg>
      </div>
    </div>
  )
}
