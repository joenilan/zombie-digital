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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
      <div>
        <div className="container mx-auto px-4 py-8">
          <Card variant="error">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!canvasSettings) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>No Canvas Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">This canvas does not exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Canvas Settings</h1>
          <p className="text-gray-300">Customize your canvas appearance and behavior.</p>
        </motion.div>

        <div className="space-y-8">
          {/* Canvas Settings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Canvas Settings</CardTitle>
              <CardDescription>
                Configure your canvas properties and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CanvasSettingsForm
                canvasId={canvasId}
                initialData={canvasSettings}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 