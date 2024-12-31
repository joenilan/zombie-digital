'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && pathname.startsWith('/dashboard')) {
        router.push('/auth/signin')
      } else if (event === 'SIGNED_IN') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, pathname])

  return children
} 