'use client'

import { useEffect } from 'react'

export function CanvasOBSWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add('canvas-obs')
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('canvas-obs')
    }
  }, [])

  return <>{children}</>
} 