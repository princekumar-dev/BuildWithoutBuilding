import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

interface PageLayoutProps {
  children: ReactNode
  hideNav?: boolean
  fullWidth?: boolean
  className?: string
}

export function PageLayout({ children, hideNav, fullWidth, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen grid-bg relative overflow-x-clip ${className}`}>
      {/* Ambient background light cones */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {!hideNav && <Navbar />}
      <main className={`relative z-10 ${fullWidth ? '' : 'max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-8'}`}>
        {children}
      </main>
    </div>
  )
}

