'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CanvasSettingsForm } from '@/components/canvas/CanvasSettingsForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { SkeletonForm } from '@/components/ui/skeleton'

export default function CanvasSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const canvasId = params.id as string
  const [loading, setLoading] = useState(true)
  const [canvasSettings, setCanvasSettings] = useState<any>(null)
  const [error, setError] = useState<string>()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchCanvasSettings() {
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('canvas_settings')
          .select('*, twitch_user:user_id(*)')
          .eq('id', canvasId)
          .single()

        if (settingsError) {
          console.error('Error fetching canvas settings:', settingsError)
          setError('Failed to load canvas settings')
          return
        }

        // Get current user's auth ID to check permissions
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
        if (userError || !authUser) {
          console.error('Auth error:', userError)
          setError('Not authenticated')
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
          setError('Failed to load user profile')
          return
        }

        // Check if user owns this canvas
        if (settings.user_id !== currentUser.id) {
          setError('You do not have permission to edit this canvas')
          return
        }

        setCanvasSettings(settings)
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCanvasSettings()
  }, [canvasId, supabase])

  if (loading) {
    return <SkeletonForm />
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!canvasSettings) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold mb-2">No Canvas Found</h1>
            <p className="text-muted-foreground">This canvas does not exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Canvas Settings</h1>
          <p className="text-gray-300">Customize your canvas appearance and behavior.</p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Configure Canvas</h2>
              <p className="text-muted-foreground">
                Adjust settings and customize your stream overlay.
              </p>
            </div>

            <CanvasSettingsForm
              canvasId={canvasId}
              initialData={canvasSettings}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
} 