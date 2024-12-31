'use client'

import { useEffect } from 'react'

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Apply styles to document elements
    document.documentElement.style.background = 'none'
    document.documentElement.style.backgroundColor = 'transparent'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.body.style.background = 'none'
    document.body.style.backgroundColor = 'transparent'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.height = '100%'
    document.body.style.width = '100%'

    // Add global styles
    const style = document.createElement('style')
    style.textContent = `
      * {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      :root {
        --background: transparent !important;
        color-scheme: none !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div data-overlay-page className="min-h-screen bg-transparent">
      {children}
    </div>
  )
} 