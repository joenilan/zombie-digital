'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'

interface CanvasData {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

// Dynamic import for heavy canvas component
const FlowCanvasV2 = dynamic(() => import('@/components/canvas/FlowCanvasV2').then(mod => ({ default: mod.FlowCanvasV2 })), {
  loading: () => (
    <div className="h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyber-pink/30 border-t-cyber-pink rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground/70">Loading Canvas...</p>
      </div>
    </div>
  ),
  ssr: false
})

export default function CanvasPage() {
  const params = useParams()
  const canvasId = params.id as string
  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [canvasLoading, setCanvasLoading] = useState(true)
  const { user, isInitialized, isLoading } = useAuthStore()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get canvas data
    const getCanvas = async () => {
      try {
        setCanvasLoading(true)

        // First try the new canvases table
        const { data: canvas, error } = await supabase
          .from('canvases')
          .select('*')
          .eq('id', canvasId)
          .single()

        if (error) {
          console.error('[CanvasPage] Error fetching canvas:', error)
          return
        }

        setCanvas(canvas)
      } catch (error) {
        console.error('[CanvasPage] Unexpected error fetching canvas:', error)
      } finally {
        setCanvasLoading(false)
      }
    }

    if (canvasId) {
      getCanvas()
    }
  }, [canvasId, supabase])

  // Show loading while auth is initializing or canvas is loading
  if (!isInitialized || isLoading || canvasLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading canvas...</p>
          {!isInitialized && (
            <p className="text-sm text-muted-foreground mt-2">Initializing authentication...</p>
          )}
        </div>
      </div>
    )
  }

  // Show error if no user (shouldn't happen due to middleware protection)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Authentication error. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  // Show error if no canvas data
  if (!canvas) {
    return <div className="flex items-center justify-center min-h-screen">Canvas not found</div>
  }

  return (
    <div className="canvas-page">
      <FlowCanvasV2
        canvasId={canvasId}
        isOwner={user?.id === canvas.user_id}
        userId={user?.id}
      />
    </div>
  )
} 