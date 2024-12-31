'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { TWITCH_SCOPES } from '@/utils/twitch-constants'

export default function SignIn() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router, supabase])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: TWITCH_SCOPES.join(' '),
      },
    })
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <button
        onClick={handleSignIn}
        className="ethereal-button"
      >
        Connect with Twitch
      </button>
    </div>
  )
} 