"use client"

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SideNav } from '@/components/dashboard/side-nav'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import type { TwitchUser } from '@/types/database'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<TwitchUser | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const provider_id = session.user.user_metadata?.sub || 
                       session.user.user_metadata?.provider_id

      const { data: user } = await supabase
        .from('twitch_users')
        .select()
        .eq('twitch_id', provider_id)
        .single()

      if (user) {
        setUser(user)
      }
    }

    loadUser()
  }, [supabase])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading..." />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="w-full border-b border-white/5">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-cyber-gradient">
            Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Channel Overview */}
        <section>
          <Suspense 
            fallback={
              <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8">
                <LoadingSpinner text="Loading channel stats..." />
              </div>
            }
          >
            <SideNav user={user} />
          </Suspense>
        </section>

        {/* Dashboard Content */}
        <section>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </>
  )
} 