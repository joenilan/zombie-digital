import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/auth-helpers-nextjs'
import type { TwitchUser } from '@/types/auth'
import { debug, logError } from '@/lib/debug'

interface AuthState {
  // State
  session: Session | null
  user: TwitchUser | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const supabase = createClientComponentClient()

// Track if auth listener has been set up to prevent duplicates
let authListenerSetup = false

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      session: null,
      user: null,
      isLoading: false,
      isInitialized: false,

      // Initialize auth - call this once on app start
      initialize: async () => {
        const state = get()
        if (state.isInitialized) return

        set({ isLoading: true }, false, 'initialize:start')

        try {
          // Get current session - this will automatically refresh if needed
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            logError('[AuthStore] Session error:', error)
            // If there's a session error, try to refresh once
            if (error.message?.includes('refresh_token_not_found') || error.message?.includes('invalid_refresh_token')) {
              debug.auth('[AuthStore] Attempting to clear invalid session')
              await supabase.auth.signOut()
            }
            set({ 
              session: null, 
              user: null, 
              isLoading: false, 
              isInitialized: true 
            }, false, 'initialize:error')
            return
          }
          
          let userData = null
          if (session?.user?.user_metadata?.sub) {
            try {
              const { data, error: userError } = await supabase
                .from('twitch_users')
                .select('*')
                .eq('twitch_id', session.user.user_metadata.sub)
                .single()

              if (!userError && data) {
                userData = data as TwitchUser
              } else {
                if (userError) {
                  logError('[AuthStore] User data error:', userError)
                }
              }
            } catch (err) {
              logError('[AuthStore] Error fetching user:', err)
            }
          }

          set({ 
            session, 
            user: userData, 
            isLoading: false, 
            isInitialized: true 
          }, false, 'initialize:success')

          // Set up auth listener only once
          if (!authListenerSetup) {
            authListenerSetup = true
            
            supabase.auth.onAuthStateChange(async (event, session) => {
              
              if (event === 'SIGNED_OUT') {
                set({ 
                  session: null, 
                  user: null 
                }, false, 'auth:signed_out')
              } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Only handle meaningful auth events, not INITIAL_SESSION
                // Check if this is actually a change by comparing with current state
                const currentState = get()
                const currentUserId = currentState.user?.twitch_id
                const newUserId = session?.user?.user_metadata?.sub
                
                // Skip if it's the same user and we already have a session
                if (currentUserId === newUserId && currentState.session && event !== 'TOKEN_REFRESHED') {
                  return
                }
                
                let userData = null
                if (session?.user?.user_metadata?.sub) {
                  try {
                    const { data, error: userError } = await supabase
                      .from('twitch_users')
                      .select('*')
                      .eq('twitch_id', session.user.user_metadata.sub)
                      .single()

                    if (!userError && data) {
                      userData = data as TwitchUser
                    } else {
                      if (userError) {
                        logError(`[AuthStore] User data error for event: ${event}`, userError)
                      }
                    }
                  } catch (err) {
                    logError('[AuthStore] Error fetching user on auth change:', err)
                  }
                }
                
                set({ 
                  session, 
                  user: userData 
                }, false, `auth:${event.toLowerCase()}`)
              }
              // Ignore INITIAL_SESSION events to prevent cross-tab interference
            })

            // Listen for Twitch token refresh events
            if (typeof window !== 'undefined') {
              window.addEventListener('twitch-token-refreshed', async (event: any) => {
                const { userId } = event.detail
                
                try {
                  const { data, error } = await supabase
                    .from('twitch_users')
                    .select('*')
                    .eq('twitch_id', userId)
                    .single()

                  if (!error && data) {
                    const currentState = get()
                    set({ 
                      user: data as TwitchUser 
                    }, false, 'twitch:token_refreshed')
                  }
                } catch (err) {
                  logError('[AuthStore] Error updating user after token refresh:', err)
                }
              })
            }
          }

        } catch (error) {
          logError('[AuthStore] Initialize error:', error)
          set({ 
            session: null, 
            user: null, 
            isLoading: false, 
            isInitialized: true 
          }, false, 'initialize:error')
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true }, false, 'signOut:start')
        try {
          // Force sign out with scope 'global' to clear all sessions
          await supabase.auth.signOut({ scope: 'global' })
          
          // Clear any local storage items that might persist
          if (typeof window !== 'undefined') {
            // Clear Supabase auth tokens
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-') || key.includes('supabase')) {
                localStorage.removeItem(key)
              }
            })
            
            // Clear session storage too
            Object.keys(sessionStorage).forEach(key => {
              if (key.startsWith('sb-') || key.includes('supabase')) {
                sessionStorage.removeItem(key)
              }
            })
          }
          
          set({ 
            session: null, 
            user: null, 
            isLoading: false 
          }, false, 'signOut:success')
        } catch (error) {
          logError('[AuthStore] Sign out error:', error)
          set({ isLoading: false }, false, 'signOut:error')
        }
      },

      // Refresh user data
      refreshUser: async () => {
        const { session } = get()
        if (!session?.user?.user_metadata?.sub) return

        try {
          const { data, error } = await supabase
            .from('twitch_users')
            .select('*')
            .eq('twitch_id', session.user.user_metadata.sub)
            .single()

          if (!error && data) {
            set({ user: data as TwitchUser }, false, 'refreshUser:success')
          }
        } catch (error) {
          logError('[AuthStore] Refresh user error:', error)
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
) 