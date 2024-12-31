"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { SocialLinksManagerV2 } from '@/components/social-links-manager-v2'
import type { SocialLink } from '@/components/social-links-manager-v2'
import { BackgroundManager } from '@/components/background-manager'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface TwitchUser {
  id: string
  username: string
  background_media_url: string | null
  background_media_type: string | null
  [key: string]: any
}

export default function SocialLinksPage() {
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null)
  const [links, setLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        redirect('/login')
      }

      const provider_id = session.user.user_metadata?.sub || 
                       session.user.user_metadata?.provider_id

      // Get the correct user_id from twitch_users
      const { data: user } = await supabase
        .from('twitch_users')
        .select('*')
        .eq('twitch_id', provider_id)
        .single()

      if (!user) {
        redirect('/login')
      }

      // Get social tree links with the correct user_id
      const { data: socialLinks } = await supabase
        .from('social_tree')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      setTwitchUser(user)
      setLinks(socialLinks || [])
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleBackgroundUpdate = (background: { url: string | null; type: string | null }) => {
    setTwitchUser(prev => prev ? {
      ...prev,
      background_media_url: background.url,
      background_media_type: background.type
    } : null)
    if (background.url) {
      toast.success('Background updated successfully')
    } else {
      toast.success('Background removed successfully')
    }
  }

  const handleCopyUrl = async () => {
    if (!twitchUser?.username) return
    const url = `${window.location.origin}/${twitchUser.username}`
    await navigator.clipboard.writeText(url)
    toast.success('Profile URL copied to clipboard')
  }

  const handleOpenProfile = () => {
    if (!twitchUser?.username) return
    window.open(`/${twitchUser.username}`, '_blank')
  }

  if (isLoading || !twitchUser) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
        <div className="h-8 w-1/3 bg-glass animate-pulse rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-glass animate-pulse rounded-lg" />
          <div className="h-4 w-5/6 bg-glass animate-pulse rounded-lg" />
          <div className="h-4 w-4/6 bg-glass animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  const profileUrl = `${window.location.origin}/${twitchUser.username}`

  return (
    <div className="space-y-8">
      <motion.div 
        className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Profile Customization</h1>
            <p className="text-muted-foreground">
              Customize your profile appearance and manage your social links.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Your Profile</h2>
              <p className="text-muted-foreground">
                Share your profile with your audience.
              </p>
            </div>
            <div className="flex gap-2">
              <Input 
                value={profileUrl}
                readOnly
                className="font-mono bg-background/20"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
                title="Copy URL"
                className="bg-background/20 hover:bg-background/40"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenProfile}
                title="Open Profile"
                className="bg-background/20 hover:bg-background/40"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Background</h2>
            <p className="text-muted-foreground">
              Upload a custom background image or video for your profile page.
            </p>
          </div>
          <BackgroundManager 
            userId={twitchUser.id}
            currentBackground={{
              url: twitchUser.background_media_url || null,
              type: twitchUser.background_media_type || null
            }}
            onUpdate={handleBackgroundUpdate}
          />
        </div>
      </motion.div>

      <motion.div 
        className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Social Links</h2>
            <p className="text-muted-foreground">
              Manage your social media links that appear on your profile.
            </p>
          </div>
          <SocialLinksManagerV2 
            initialLinks={links} 
            twitchUserId={twitchUser.id}
          />
        </div>
      </motion.div>
    </div>
  )
} 