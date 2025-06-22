'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { TWITCH_SCOPES_MINIMAL } from '@/utils/twitch-constants'

export default function SignIn() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    // Redirect if already signed in
    if (isInitialized && user) {
      router.push('/dashboard')
    }
  }, [user, isInitialized, router])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: TWITCH_SCOPES_MINIMAL.join(' '),
        queryParams: { force_verify: 'true' },
      },
    })
  }

  const handleFreshSignIn = async () => {
    // Force clear everything first
    await supabase.auth.signOut({ scope: 'global' })

    // Clear any local storage items that might persist
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })

      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
        }
      })
    }

    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 500))

    // Now sign in fresh
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: TWITCH_SCOPES_MINIMAL.join(' '),
        queryParams: { force_verify: 'true' },
      },
    })
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleSignIn}
          className="ethereal-button"
        >
          Connect with Twitch
        </button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Having issues? Try a fresh login:
          </p>
          <button
            onClick={handleFreshSignIn}
            className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition-colors"
          >
            Force Fresh Login (Clear Cache)
          </button>
        </div>
      </div>
    </div>
  )
} 