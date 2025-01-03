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
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
          try {
            // Call the refresh endpoint
            const response = await fetch('/api/auth/refresh-twitch-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                twitch_id: session.user.user_metadata.sub,
                refreshToken: user.provider_refresh_token
              })
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error('Failed to refresh token:', errorText)

              // For 401/403 errors, try to get a fresh session first
              if ((response.status === 401 || response.status === 403) && retryCount < maxRetries - 1) {
                const freshSession = await authService.validateAndRefreshSession()
                if (!freshSession) {
                  await authService.signOut()
                  setError('Session expired - Please sign in again')
                  return
                }
                retryCount++
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
                continue
              }

              // For other errors, retry if we haven't hit the limit
              if (retryCount < maxRetries - 1) {
                retryCount++
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
                continue
              }

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
            break
          } catch (err) {
            if (err instanceof Error && err.message.includes('sign in again')) {
              setError(err.message)
              return
            }

            if (retryCount === maxRetries - 1) {
              console.error('Max retries reached for token refresh:', err)
              setError('Failed to refresh token after multiple attempts')
              return
            }

            retryCount++
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          }
        }
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

    // Set up a timer to check token expiration based on database expiry time
    let expiryTimer: number | null = null;

    async function setupExpiryTimer() {
      const { data: { session } } = await authService.getCurrentSession()
      if (!session) return;

      const { data: user } = await supabase
        .from('twitch_users')
        .select('token_expires_at')
        .eq('twitch_id', session.user.user_metadata.sub)
        .single()

      if (user?.token_expires_at) {
        const expiresAt = new Date(user.token_expires_at).getTime()
        const now = Date.now()
        const timeUntilExpiry = expiresAt - now - 300000 // Refresh 5 minutes before expiry

        if (timeUntilExpiry > 0) {
          expiryTimer = window.setTimeout(refreshTwitchToken, timeUntilExpiry)
        } else {
          // If already expired or about to expire, refresh now
          refreshTwitchToken()
        }
      }
    }

    setupExpiryTimer()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshTwitchToken()
        setupExpiryTimer()
      } else if (event === 'SIGNED_OUT') {
        if (expiryTimer) {
          window.clearTimeout(expiryTimer)
        }
        setProviderToken(null)
        setError(null)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (expiryTimer) {
        window.clearTimeout(expiryTimer)
      }
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