'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { FlowCanvasV2 } from '@/components/canvas/FlowCanvasV2'
import { useParams } from 'next/navigation'

interface CanvasData {
  id: string
  user_id: string
}

export default function CanvasPage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  const canvasId = params.id as string
  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
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

    // Get current user
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error)
        return
      }

      if (user) {
        const { data: profile } = await supabase
          .from('twitch_users')
          .select('*')
          .eq('twitch_id', user.user_metadata.provider_id)
          .single()

        setCurrentUser(profile)
      }
    }

    getCanvas()
    getCurrentUser()
  }, [canvasId, supabase])

  if (!canvas) return null

  return (
    <FlowCanvasV2
      canvasId={canvasId}
      isOwner={currentUser?.id === canvas.user_id}
      userId={currentUser?.id}
    />
  )
} 