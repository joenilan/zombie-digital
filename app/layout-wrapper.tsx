"use client"

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverlayPage = pathname.startsWith('/overlay/')
  const isCanvasPage = pathname.startsWith('/canvas/')
  // Only match usernames that don't start with any known routes
  const isProfilePage = /^\/[^(/|dashboard|overlay|canvas)][^/]*$/.test(pathname)
  
  // Show nav on pages that are NOT overlay, canvas, or profile
  const shouldShowNav = !isOverlayPage && !isCanvasPage && !isProfilePage

  return (
    <div className="relative min-h-screen">
      {shouldShowNav && <Navbar />}
      {children}
    </div>
  )
} 