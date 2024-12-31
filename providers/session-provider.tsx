'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    let sessionCheckInterval: ReturnType<typeof setInterval>
    let unsubscribe: (() => void) | undefined

    // Check and refresh Twitch token if needed
    const checkTwitchToken = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        console.error('Error getting session:', sessionError)
        return
      }

      // Get the user's Twitch token info
      const { data: twitchUser, error: twitchError } = await supabase
        .from('twitch_users')
        .select('token_expires_at, refresh_token')
        .eq('twitch_id', session.user.user_metadata.provider_id)
        .single()

      if (twitchError || !twitchUser) {
        console.error('Error getting Twitch user:', twitchError)
        return
      }

      // Check if token is expired or will expire in the next 5 minutes
      const expiresAt = new Date(twitchUser.token_expires_at)
      const now = new Date()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      
      if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
        console.log('Twitch token needs refresh')
        
        try {
          // Call the existing refresh-twitch-token endpoint
          const response = await fetch('/api/auth/refresh-twitch-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              refresh_token: twitchUser.refresh_token,
              user_id: session.user.id
            })
          })

          if (!response.ok) {
            throw new Error('Failed to refresh token')
          }

          // Force a router refresh to update the session
          router.refresh()
        } catch (error) {
          console.error('Error refreshing token:', error)
          // If refresh fails, redirect to auth
          router.push('/auth/signin')
        }
      }
    }

    // Set up auth subscription
    const setupAuth = async () => {
      // Initial token check
      await checkTwitchToken()

      // Set up interval to check token
      sessionCheckInterval = setInterval(checkTwitchToken, 60000) // Check every minute

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/auth/signin')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkTwitchToken()
        }
      })

      unsubscribe = () => {
        subscription.unsubscribe()
      }
    }

    setupAuth()

    return () => {
      if (unsubscribe) unsubscribe()
      if (sessionCheckInterval) clearInterval(sessionCheckInterval)
    }
  }, [supabase, router])

  return children
} 