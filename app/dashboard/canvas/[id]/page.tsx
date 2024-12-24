'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

export default function DashboardCanvasPage() {
  const params = useParams()
  const router = useRouter()
  const canvasId = params.id as string
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function redirectToCanvas() {
      try {
        // Get current user's auth ID
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
        if (userError || !authUser) {
          console.error('Auth error:', userError)
          return
        }

        // Get current user's twitch user record
        const { data: currentUser, error: twitchUserError } = await supabase
          .from('twitch_users')
          .select('*')
          .eq('twitch_id', authUser.user_metadata.provider_id)
          .single()

        if (twitchUserError || !currentUser) {
          console.error('Error fetching twitch user:', twitchUserError)
          return
        }

        // Redirect to the interactive canvas page
        router.replace(`/${currentUser.username}/canvas/${canvasId}/interact`)
      } catch (err) {
        console.error('Error:', err)
      }
    }

    redirectToCanvas()
  }, [canvasId, router, supabase])

  return null
} 