"use client"

import { usePathname } from 'next/navigation'
import Navbar from "@/components/Navbar"

function isProfilePage(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const reservedRoutes = ['login', 'dashboard', 'api']
  
  // Handle profile pages
  if (segments.length === 1 && !reservedRoutes.includes(segments[0])) {
    return true
  }
  
  // Handle user canvas pages (with or without ID), but not dashboard canvas pages
  if (segments.length >= 2 && segments[1] === 'canvas' && segments[0] !== 'dashboard') {
    return true
  }
  
  return false
}

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isProfile = isProfilePage(pathname)
  const isCanvasPage = pathname?.includes('/canvas/')

  return (
    <div className={`relative min-h-screen ${isCanvasPage ? 'bg-cyber-lighter dark:bg-cyber-darker' : ''} transition-colors duration-300`}>
      {!isProfile && (
        <>
          {/* Navbar */}
          <div className="relative flex flex-col min-h-screen">
            {!isCanvasPage && <Navbar />}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </>
      )}
      
      {isProfile && children}
    </div>
  )
} 