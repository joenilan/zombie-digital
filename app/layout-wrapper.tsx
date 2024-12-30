"use client"

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide navbar on overlay routes and profile pages
  if (pathname.startsWith('/overlay/')) {
    return <div className="relative min-h-screen">{children}</div>
  }

  // Check if we're on a profile page (single segment that's not a system route)
  const segments = pathname.split('/').filter(Boolean)
  const isProfilePage = segments.length === 1 && 
    !['dashboard', 'admin', 'auth', 'canvas', 'overlay', 'docs'].includes(segments[0])

  if (isProfilePage) {
    return <div className="relative min-h-screen">{children}</div>
  }

  // Show navbar on all other pages
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative">
        {children}
      </div>
    </div>
  )
} 