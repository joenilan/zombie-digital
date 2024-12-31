'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { FlowCanvasV2 } from '@/components/canvas/FlowCanvasV2'
import { useParams, useRouter } from 'next/navigation'

interface CanvasData {
  id: string
  user_id: string
}

export default function CanvasPage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  const router = useRouter()
  const canvasId = params.id as string
  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    // Get canvas data
    const getCanvas = async () => {
      const { data: canvas, error } = await supabase
        .from('canvas_settings')
        .select('*')
        .eq('id', canvasId)
        .single()

      if (error) {
        console.error('Error fetching canvas:', error)
        return
      }

      setCanvas(canvas)
    }

    // Get current user and set up auth subscription
    const setupAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('twitch_users')
          .select('*')
          .eq('twitch_id', session.user.user_metadata.provider_id)
          .single()

        setCurrentUser(profile)
      } else {
        setCurrentUser(null)
      }

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null)
          router.refresh()
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('twitch_users')
            .select('*')
            .eq('twitch_id', session.user.user_metadata.provider_id)
            .single()

          setCurrentUser(profile)
        }
      })

      unsubscribe = () => {
        subscription.unsubscribe()
      }
    }

    getCanvas()
    setupAuth()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [canvasId, supabase, router])

  if (!canvas) return null

  return (
    <div className="canvas-page">
      <FlowCanvasV2
        canvasId={canvasId}
        isOwner={currentUser?.id === canvas.user_id}
        userId={currentUser?.id}
      />
    </div>
  )
} 