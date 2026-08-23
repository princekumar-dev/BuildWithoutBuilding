import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, ExternalLink, MessageSquare, Bell, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from './Toast'
import { SoundFX } from '../../lib/soundEffects'

export const OFFICIAL_WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/DHke2VBDQnbKxVBiLcpN5t?s=cl&p=a&ilr=1'

/**
 * Official SVG WhatsApp Icon with crisp vector paths
 */
export function WhatsAppIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.676.15-.2.301-.776.978-.951 1.179-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.926-2.233-.244-.587-.492-.507-.676-.517-.175-.008-.376-.01-.576-.01-.2 0-.526.075-.802.376-.276.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.227 3.11.15.2 2.12 3.238 5.136 4.542.717.31 1.277.496 1.713.635.72.229 1.375.197 1.893.12.578-.086 1.78-.727 2.03-1.43.25-.703.25-1.305.175-1.431-.075-.125-.275-.201-.576-.351z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.765.458 3.424 1.258 4.869L2 22l5.281-1.229A9.957 9.957 0 0 0 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.2c-1.57 0-3.033-.448-4.276-1.225l-.307-.19-3.14.731.748-3.064-.207-.324A8.163 8.163 0 0 1 3.8 12c0-4.528 3.676-8.2 8.204-8.2 4.527 0 8.196 3.672 8.196 8.2 0 4.528-3.669 8.2-8.196 8.2z"
      />
    </svg>
  )
}

interface WhatsAppGroupCardProps {
  variant?: 'full' | 'compact' | 'banner'
  className?: string
  groupUrl?: string
  teamName?: string
}

export function WhatsAppGroupCard({
  variant = 'full',
  className = '',
  groupUrl = OFFICIAL_WHATSAPP_GROUP_URL,
  teamName,
}: WhatsAppGroupCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    SoundFX.playCutePop(2)
    navigator.clipboard.writeText(groupUrl)
    setCopied(true)
    toast.success('WhatsApp Group Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleJoinClick = () => {
    SoundFX.playSuccessChime()
  }

  if (variant === 'banner') {
    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#075E54]/30 via-emerald-950/40 to-emerald-900/20 border border-emerald-500/30 text-white shadow-lg ${className}`}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0 shadow-md">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-[#25D366] tracking-wider">
                OFFICIAL WHATSAPP GROUP
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
            </div>
            <p className="text-xs text-white/90 font-medium truncate">
              Live round alerts & tournament updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6e] shadow-lg shadow-[#25D366]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Join Group</span>
            <ExternalLink size={12} className="opacity-80" />
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 transition-colors shrink-0"
            title="Copy WhatsApp Group Link"
          >
            {copied ? <CheckCircle2 size={14} className="text-[#25D366]" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl sm:rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-[#075E54]/25 via-emerald-950/40 to-bwb-surface-2 p-4 sm:p-6 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mb-4 pb-4 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#25D366]/30 border border-white/20 ring-4 ring-[#25D366]/15">
            <WhatsAppIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black text-[#25D366] tracking-wider px-2 py-0.5 rounded-md bg-[#25D366]/15 border border-[#25D366]/30 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                OFFICIAL TOURNAMENT WHATSAPP GROUP
              </span>
            </div>
            <h4 className="font-display font-extrabold text-lg sm:text-xl text-white mt-1">
              Join the Event WhatsApp Group
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-center">
          <Sparkles size={12} className="text-[#25D366]" />
          Instant Alerts
        </span>
      </div>

      {/* Description & Value Props */}
      <div className="relative z-10 space-y-3 mb-5">
        <p className="text-xs sm:text-sm text-bwb-muted leading-relaxed">
          {teamName ? (
            <>
              All members of squad <strong className="text-white">{teamName}</strong> must join the official WhatsApp group for live stage calls, pitch queue announcements, room updates, and direct Q&amp;A with hosts.
            </>
          ) : (
            'Stay connected with real-time tournament alerts, pitch order calls, round transition updates, and direct communications from the organizing team.'
          )}
        </p>

        {/* Feature highlight tags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/25 border border-white/5 text-[11px] text-white/90">
            <Bell size={13} className="text-[#25D366] shrink-0" />
            <span className="truncate">Live Pitch Call Alerts</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/25 border border-white/5 text-[11px] text-white/90">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate">Host &amp; Judge Updates</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/25 border border-white/5 text-[11px] text-white/90">
            <MessageSquare size={13} className="text-teal-300 shrink-0" />
            <span className="truncate">Team Coordination</span>
          </div>
        </div>
      </div>

      {/* Direct Link Preview Box */}
      <div className="relative z-10 p-3 sm:p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="min-w-0 flex items-center gap-2">
          <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
          <span className="text-xs font-mono text-white/80 truncate select-all">
            {groupUrl}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all shrink-0 active:scale-95"
        >
          {copied ? (
            <>
              <CheckCircle2 size={13} className="text-[#25D366]" />
              <span className="text-[#25D366]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleJoinClick}
          className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-display font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#25D366] via-[#1ebd5d] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6e] shadow-xl shadow-[#25D366]/30 border border-emerald-300/30 transition-all hover:scale-[1.01] active:scale-[0.99] text-center"
        >
          <WhatsAppIcon className="w-5 h-5 shrink-0" />
          <span>Join WhatsApp Group</span>
          <ExternalLink size={16} className="opacity-90 shrink-0" />
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className="sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-bold bg-bwb-surface-2/90 hover:bg-bwb-surface-2 border border-white/15 text-white transition-colors"
        >
          <Copy size={15} />
          <span>{copied ? 'Link Copied' : 'Share with Squad'}</span>
        </button>
      </div>
    </motion.div>
  )
}
