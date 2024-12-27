'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Badge } from '@/components/ui/badge'

interface TwitchStreamStatusProps {
  twitchId: string
  username: string
}

interface StreamData {
  type: string
  title: string
  viewer_count: number
  started_at: string
  game_name: string
}

export function TwitchStreamStatus({ twitchId, username }: TwitchStreamStatusProps) {
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkStreamStatus = async () => {
      try {
        // Get access token from the current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get Twitch user data
        const { data: userData } = await supabase
          .from('twitch_users')
          .select('provider_token')
          .eq('twitch_id', user.user_metadata.provider_id)
          .single()

        if (!userData?.provider_token) return

        // Check stream status
        const response = await fetch(
          `https://api.twitch.tv/helix/streams?user_id=${twitchId}`,
          {
            headers: {
              'Authorization': `Bearer ${userData.provider_token}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
            }
          }
        )

        const data = await response.json()
        setStreamData(data.data?.[0] || null)
      } catch (error) {
        console.error('Error checking stream status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Check initially and then every minute
    checkStreamStatus()
    const interval = setInterval(checkStreamStatus, 60000)

    return () => clearInterval(interval)
  }, [supabase, twitchId])

  if (isLoading) return null

  if (!streamData) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Badge variant="secondary">Offline</Badge>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Badge variant="default" className="bg-red-500">Live</Badge>
        <span className="text-sm text-muted-foreground">
          {streamData.viewer_count.toLocaleString()} viewers
        </span>
      </div>

      <div className="aspect-video w-full rounded-lg overflow-hidden">
        <iframe
          src={`https://player.twitch.tv/?channel=${username}&parent=${window.location.hostname}&muted=true`}
          height="100%"
          width="100%"
          allowFullScreen
        />
      </div>

      <div className="text-center">
        <h3 className="font-semibold">{streamData.title}</h3>
        <p className="text-sm text-muted-foreground">Playing {streamData.game_name}</p>
      </div>
    </div>
  )
} 