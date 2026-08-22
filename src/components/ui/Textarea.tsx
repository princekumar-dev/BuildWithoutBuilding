import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-bwb-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text placeholder:text-bwb-muted focus:outline-none focus:border-bwb-accent/60 focus:ring-1 focus:ring-bwb-accent/30 transition-colors resize-y min-h-[80px] ${error ? 'border-bwb-danger' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-bwb-danger">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
