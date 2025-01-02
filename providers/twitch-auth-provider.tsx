'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { authService } from '@/lib/auth'

interface TwitchAuthState {
  providerToken: string | null
  refreshTwitchToken: () => Promise<void>
  isRefreshing: boolean
  error: string | null
}

const TwitchAuthContext = createContext<TwitchAuthState | null>(null)

export function TwitchAuthProvider({ children }: { children: React.ReactNode }) {
  const [providerToken, setProviderToken] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const refreshTwitchToken = async () => {
    if (isRefreshing) return
    
    try {
      setIsRefreshing(true)
      setError(null)
      
      const { data: { session } } = await authService.getCurrentSession()
      if (!session) {
        console.log('No session found during token refresh')
        setError('No active session')
        return
      }

      const { data: user, error } = await supabase
        .from('twitch_users')
        .select('provider_token, provider_refresh_token, token_expires_at')
        .eq('twitch_id', session.user.user_metadata.sub)
        .single()

      if (error) {
        console.error('Error fetching Twitch token:', error)
        setError('Failed to fetch Twitch token')
        return
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = new Date(user.token_expires_at).getTime()
      const now = Date.now()
      const expiresInFiveMinutes = expiresAt - now <= 300000 // 5 minutes in milliseconds

      if (expiresInFiveMinutes) {
        // Call the refresh endpoint
        const response = await fetch('/api/auth/refresh-twitch-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            refreshToken: user.provider_refresh_token
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to refresh token:', errorText)
          setError('Failed to refresh token')
          return
        }

        // Get the updated token from the database
        const { data: updatedUser, error: updateError } = await supabase
          .from('twitch_users')
          .select('provider_token')
          .eq('twitch_id', session.user.user_metadata.sub)
          .single()

        if (updateError) {
          console.error('Error fetching updated token:', updateError)
          setError('Failed to fetch updated token')
          return
        }

        setProviderToken(updatedUser.provider_token)
      } else {
        setProviderToken(user.provider_token)
      }
    } catch (err) {
      console.error('Error in refreshTwitchToken:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshTwitchToken()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshTwitchToken()
      } else if (event === 'SIGNED_OUT') {
        setProviderToken(null)
        setError(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <TwitchAuthContext.Provider value={{ providerToken, refreshTwitchToken, isRefreshing, error }}>
      {children}
    </TwitchAuthContext.Provider>
  )
}

export function useTwitchAuth() {
  const context = useContext(TwitchAuthContext)
  if (!context) {
    throw new Error('useTwitchAuth must be used within a TwitchAuthProvider')
  }
  return context
} 