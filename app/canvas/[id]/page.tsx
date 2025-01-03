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
    let sessionCheckInterval: ReturnType<typeof setInterval>

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

    // Check and refresh session if needed
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error checking session:', error)
        return
      }

      if (!session) {
        // If no session, try to refresh it
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshedSession) {
          console.error('Session refresh failed:', refreshError)
          setCurrentUser(null)
          return
        }
        // Update user after successful refresh
        const { data: profile } = await supabase
          .from('twitch_users')
          .select('*')
          .eq('twitch_id', refreshedSession.user.user_metadata.provider_id)
          .single()
        setCurrentUser(profile)
      } else {
        // Get user profile if we have a session
        const { data: profile } = await supabase
          .from('twitch_users')
          .select('*')
          .eq('twitch_id', session.user.user_metadata.provider_id)
          .single()
        setCurrentUser(profile)
      }
    }

    // Get current user and set up auth subscription
    const setupAuth = async () => {
      // Initial session check
      await checkSession()

      // Set up interval to check session
      sessionCheckInterval = setInterval(checkSession, 60000) // Check every minute

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await checkSession()
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
      if (sessionCheckInterval) clearInterval(sessionCheckInterval)
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