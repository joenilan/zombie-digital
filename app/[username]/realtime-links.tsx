"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SocialLink } from '@/types/database'
import {
  Twitter,
  Youtube,
  Twitch,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  Globe,
  Link as LinkIcon,
  Rocket,
  Music,
  Store,
  DollarSign,
  type LucideIcon,
  ChevronDown,
} from 'lucide-react'
import { 
  SiDiscord, 
  SiTiktok, 
  SiKick,
  SiKofi,
  SiPatreon,
  SiOnlyfans,
  SiCashapp,
  SiVenmo,
  SiPaypal,
  SiSpotify,
  SiSoundcloud,
  SiBandcamp,
  SiThreads,
  SiSubstack,
  SiMedium,
  SiBluesky,
} from '@icons-pack/react-simple-icons'
import { motion, AnimatePresence } from 'framer-motion'

const platformIcons: Record<string, any> = {
  // Social Media
  twitter: Twitter,
  bluesky: SiBluesky,
  youtube: Youtube,
  twitch: Twitch,
  instagram: Instagram,
  facebook: Facebook,
  github: Github,
  linkedin: Linkedin,
  discord: SiDiscord,
  tiktok: SiTiktok,
  kick: SiKick,
  threads: SiThreads,

  // Content Creation
  streamelements: Rocket,
  kofi: SiKofi,
  fourthwall: Store,
  patreon: SiPatreon,
  onlyfans: SiOnlyfans,

  // Payment/Support
  cashapp: SiCashapp,
  venmo: SiVenmo,
  paypal: SiPaypal,

  // Music/Audio
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  music: Music,

  // Writing/Blogs
  substack: SiSubstack,
  medium: SiMedium,

  // Generic
  website: Globe,
  link: LinkIcon,
}

// Custom color mapping for icons
const platformColors: Record<string, string> = {
  twitter: '#1DA1F2',
  bluesky: '#0085FF',
  youtube: '#FF0000',
  twitch: '#9146FF',
  instagram: '#E4405F',
  discord: '#5865F2',
  tiktok: '#000000',
  kick: '#53FC18',
  kofi: '#FF5E5B',
  patreon: '#FF424D',
  onlyfans: '#00AFF0',
  spotify: '#1DB954',
  streamelements: '#F43B4E',
}

function getPlatformIcon(platform: string) {
  const normalizedPlatform = platform.toLowerCase().trim()
  const Icon = platformIcons[normalizedPlatform] || platformIcons.link
  return Icon
}

function getPlatformColor(platform: string) {
  const normalizedPlatform = platform.toLowerCase().trim()
  return platformColors[normalizedPlatform] || 'currentColor'
}

interface RealtimeLinksProps {
  userId: string
  initialLinks: SocialLink[]
  isOwner?: boolean
}

function TwitchLink({ link, username }: { link: SocialLink; username: string }) {
  console.log('TwitchLink mounted for:', username);
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [streamInfo, setStreamInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkTwitchStatus() {
      console.log('Checking Twitch status for:', username);
      try {
        const response = await fetch(`/api/twitch/status?username=${username}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Twitch status response:', data);
        setIsLive(data.isLive)
        setStreamInfo(data.stream)
        setError(null)
      } catch (error) {
        console.error('Error checking Twitch status:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    const interval = setInterval(checkTwitchStatus, 60000) // Check every minute
    checkTwitchStatus() // Initial check

    return () => {
      console.log('TwitchLink cleanup for:', username);
      clearInterval(interval)
    }
  }, [username])

  console.log('TwitchLink rendering with state:', { isLive, streamInfo, error });

  return (
    <div className="w-full">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full p-4 bg-glass shadow-glass 
                 hover:shadow-cyber transition-all duration-300
                 text-center group relative overflow-hidden rounded-xl`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-center justify-center gap-3">
          <Twitch className="w-6 h-6" style={{ color: platformColors.twitch }} />
          <span className="font-medium text-lg">
            {link.title || link.platform}
          </span>
          {error ? (
            <span className="text-xs text-red-500">
              (Status check failed)
            </span>
          ) : isLive ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-500">LIVE</span>
              {streamInfo?.viewer_count && (
                <span className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat().format(streamInfo.viewer_count)} viewers
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              (Offline)
            </span>
          )}
        </div>
        {isLive && streamInfo && (
          <div className="mt-2 text-sm text-muted-foreground">
            {streamInfo.title}
          </div>
        )}
      </a>
      
      {isLive && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-2 bg-glass/50 hover:bg-glass transition-colors
                     flex items-center justify-center gap-2 text-sm text-muted-foreground
                     rounded-b-xl"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
            {isExpanded ? 'Hide Stream' : 'Show Stream'}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative pt-[56.25%] mt-2 rounded-xl overflow-hidden bg-black/50"
              >
                <iframe
                  src={`https://player.twitch.tv/?channel=${username}&parent=${window.location.hostname}`}
                  frameBorder="0"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

// Add this type for the realtime payload
type RealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: SocialLink | null
  old: SocialLink
  table: string
}

export function RealtimeLinks({ userId, initialLinks, isOwner }: RealtimeLinksProps) {
  console.log('RealtimeLinks render:', {
    userId,
    linksCount: initialLinks.length,
    isOwner,
  })

  const [links, setLinks] = useState(initialLinks)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel(`social_tree_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${userId}`
        },
        async (payload: RealtimePayload) => {
          console.log('Realtime event:', payload.eventType, payload) // Debug log

          if (payload.eventType === 'DELETE') {
            setLinks(currentLinks => 
              currentLinks.filter(link => link.id !== payload.old.id)
            )
          } else {
            // For INSERT and UPDATE, fetch fresh data
            const { data: freshLinks } = await supabase
              .from('social_tree')
              .select('*')
              .eq('user_id', userId)
              .order('order_index', { ascending: true })

            if (freshLinks) {
              console.log('Updated links:', freshLinks) // Debug log
              setLinks(freshLinks)
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, userId])

  if (!links.length) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="text-muted-foreground">
          {isOwner ? (
            <div className="space-y-4">
              <p className="mb-2">You haven't added any social links yet.</p>
              <a 
                href="/settings/links" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-glass 
                         hover:shadow-cyber transition-all duration-300 text-cyber-cyan 
                         hover:text-cyber-pink"
              >
                <LinkIcon className="w-4 h-4" />
                Get started by adding your first link
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-glass/50">
              <p>This user hasn't added any social links yet.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {links.map((link) => {
        // Debug logging
        console.log('Link:', {
          id: link.id,
          platform: link.platform,
          platformLower: link.platform.toLowerCase(),
          isTwitch: link.platform.toLowerCase() === 'twitch',
          url: link.url
        })

        // Special handling for Twitch links
        if (link.platform.toLowerCase() === 'twitch') {
          console.log('Rendering TwitchLink for:', link.url);
          try {
            const username = link.url.split('/').pop() || '';
            console.log('Extracted username:', username);
            if (!username) {
              console.error('Failed to extract username from URL:', link.url);
              throw new Error('Invalid Twitch URL');
            }
            return <TwitchLink key={link.id} link={link} username={username} />;
          } catch (error) {
            console.error('Error rendering TwitchLink:', error);
            // Fallback to regular link if TwitchLink fails
            const Icon = getPlatformIcon(link.platform);
            const iconColor = getPlatformColor(link.platform);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 rounded-xl bg-glass shadow-glass 
                         hover:shadow-cyber transition-all duration-300 transform hover:-translate-y-1
                         text-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                  <span className="font-medium text-lg">
                    {link.title || link.platform}
                  </span>
                </div>
              </a>
            );
          }
        }

        // Regular links remain the same
        console.log('Rendering regular link for:', link.platform);
        const Icon = getPlatformIcon(link.platform)
        const iconColor = getPlatformColor(link.platform)
        
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full p-4 rounded-xl bg-glass shadow-glass 
                     hover:shadow-cyber transition-all duration-300 transform hover:-translate-y-1
                     text-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3">
              <Icon className="w-6 h-6" style={{ color: iconColor }} />
              <span className="font-medium text-lg">
                {link.title || link.platform}
              </span>
            </div>
          </a>
        )
      })}
    </div>
  )
} 