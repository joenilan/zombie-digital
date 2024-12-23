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
  const isCanvasPage = pathname?.startsWith('/canvas/')

  return (
    <div className="relative min-h-screen bg-cyber-lighter dark:bg-cyber-darker transition-colors duration-300">
      {!isProfile && (
        <>
          {/* Gradient overlays - Dark Theme */}
          <div className="absolute inset-0 dark:block hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(145,70,255,0.15)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(0,240,255,0.1)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,46,147,0.1)_0%,_transparent_50%)]" />
          </div>

          {/* Gradient overlays - Light Theme */}
          <div className="absolute inset-0 dark:hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(145,70,255,0.1)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(0,240,255,0.05)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,46,147,0.05)_0%,_transparent_50%)]" />
          </div>

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