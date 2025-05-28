import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { TwitchUser } from '@/types/auth'

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

let authListenerSetup = false // Prevent multiple listeners

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

        console.log('[AuthStore] Initializing...')
        set({ isLoading: true }, false, 'initialize:start')

        try {
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('[AuthStore] Session error:', error)
            set({ 
              session: null, 
              user: null, 
              isLoading: false, 
              isInitialized: true 
            }, false, 'initialize:error')
            return
          }

          console.log('[AuthStore] Session found:', !!session)
          
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
                console.log('[AuthStore] User data loaded:', (userData as TwitchUser).username)
              } else {
                console.error('[AuthStore] User data error:', userError)
              }
            } catch (err) {
              console.error('[AuthStore] Error fetching user:', err)
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
            console.log('[AuthStore] Setting up auth listener')
            
            supabase.auth.onAuthStateChange(async (event, session) => {
              console.log('[AuthStore] Auth state change:', event, {
                hasSession: !!session,
                userId: session?.user?.id,
                timestamp: new Date().toISOString()
              })
              
              if (event === 'SIGNED_OUT') {
                console.log('[AuthStore] Processing SIGNED_OUT event')
                set({ 
                  session: null, 
                  user: null 
                }, false, 'auth:signed_out')
              } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Only handle meaningful auth events, not INITIAL_SESSION
                // INITIAL_SESSION events are triggered by getSession() calls and don't represent actual changes
                console.log('[AuthStore] Processing meaningful auth event:', event)
                
                // Check if this is actually a change by comparing with current state
                const currentState = get()
                const currentUserId = currentState.user?.twitch_id
                const newUserId = session?.user?.user_metadata?.sub
                
                if (currentUserId === newUserId && currentState.session) {
                  console.log('[AuthStore] Ignoring auth event - no actual change detected:', {
                    currentUserId,
                    newUserId,
                    event
                  })
                  return
                }
                
                console.log('[AuthStore] Processing auth event - change detected:', {
                  currentUserId,
                  newUserId,
                  event
                })
                
                let userData = null
                if (session?.user?.user_metadata?.sub) {
                  try {
                    console.log('[AuthStore] Fetching user data for auth event:', event)
                    const { data, error: userError } = await supabase
                      .from('twitch_users')
                      .select('*')
                      .eq('twitch_id', session.user.user_metadata.sub)
                      .single()

                    if (!userError && data) {
                      userData = data as TwitchUser
                      console.log('[AuthStore] User data loaded for event:', event, userData.username)
                    } else {
                      console.error('[AuthStore] User data error for event:', event, userError)
                    }
                  } catch (err) {
                    console.error('[AuthStore] Error fetching user on auth change:', err)
                  }
                }
                
                set({ 
                  session, 
                  user: userData 
                }, false, `auth:${event.toLowerCase()}`)
              } else {
                console.log('[AuthStore] Ignoring auth event:', event, '(likely INITIAL_SESSION)')
              }
              // Ignore INITIAL_SESSION events to prevent cross-tab interference
            })

            // Listen for Twitch token refresh events
            if (typeof window !== 'undefined') {
              window.addEventListener('twitch-token-refreshed', async (event: any) => {
                console.log('[AuthStore] Twitch token refreshed, updating user data')
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
                    console.log('[AuthStore] User data updated after token refresh')
                  }
                } catch (err) {
                  console.error('[AuthStore] Error updating user after token refresh:', err)
                }
              })
            }
          }

        } catch (error) {
          console.error('[AuthStore] Initialize error:', error)
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
          await supabase.auth.signOut()
          set({ 
            session: null, 
            user: null, 
            isLoading: false 
          }, false, 'signOut:success')
        } catch (error) {
          console.error('[AuthStore] Sign out error:', error)
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
          console.error('[AuthStore] Refresh user error:', error)
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
) 