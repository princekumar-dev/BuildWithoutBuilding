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
    <div className={`min-h-screen grid-bg ${className}`}>
      {!hideNav && <Navbar />}
      <main className={fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 py-8'}>
        {children}
      </main>
    </div>
  )
}
