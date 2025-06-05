"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

interface RealtimeBackgroundProps {
  userId: string
  initialBackground: {
    url: string | null
    type: string | null
  }
}

export function RealtimeBackground({ userId, initialBackground }: RealtimeBackgroundProps) {
  const [background, setBackground] = useState(initialBackground)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel(`background_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'twitch_users',
          filter: `id=eq.${userId}`
        },
        async (payload) => {
          console.log('Background update:', payload)
          const newData = payload.new as any

          if (newData) {
            setBackground({
              url: newData.background_media_url,
              type: newData.background_media_type
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, userId])

  if (!background?.url) return null

  return (
    <div className="absolute inset-0">
      {background.type?.startsWith('video/') ? (
        <video
          src={background.url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <Image
          src={background.url}
          alt="Profile Background"
          fill
          className="object-cover"
          priority={false}
          quality={85}
          sizes="100vw"
        />
      )}
    </div>
  )
} 