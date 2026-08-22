import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-bwb-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text placeholder:text-bwb-muted focus:outline-none focus:border-bwb-accent/60 focus:ring-1 focus:ring-bwb-accent/30 transition-colors ${error ? 'border-bwb-danger' : ''} ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-bwb-muted">{hint}</p>}
        {error && <p className="text-xs text-bwb-danger">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
