"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { debug, logError } from '@/lib/debug'

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
          debug.realtime('Background update:', payload)
          const newData = payload.new as any

          if (newData) {
            setBackground({
              url: newData.background_media_url,
              type: newData.background_media_type
            })
          }
        }
      )
      .subscribe((status, err) => {
        debug.realtime('[RealtimeBackground] Realtime subscription status:', status)
        if (err) {
          logError('[RealtimeBackground] Realtime subscription error:', err)
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, userId])

  if (!background?.url) {
    // Default theme-based gradient when no background is set
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-0" style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(var(--theme-primary), 0.15) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(var(--theme-accent), 0.1) 0%, transparent 50%),
          linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.9) 100%)
        `
      }} />
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0">
      {/* Background media (z-0, with less blur) */}
      {background.type?.startsWith('video/') ? (
        <video
          src={background.url}
          className="w-full h-full object-cover opacity-40 scale-110"
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
          className="object-cover opacity-40 scale-110"
          priority={false}
          quality={85}
          sizes="100vw"
        />
      )}
    </div>
  )
} 