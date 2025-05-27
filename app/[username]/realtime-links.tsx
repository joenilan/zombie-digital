"use client"

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'
import Link from 'next/link'
// Define SocialLink type directly instead of importing from a potentially missing module
export interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  title?: string
  order_index: number
  created_at?: string
  updated_at?: string
  [key: string]: any
}
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

// Type for the entire payload
export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: any
  old: any
  schema: string
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

  // Define refs at component level, not inside useEffect
  const linkIdsRef = React.useRef(new Set<string>())
  const isHandlingEventRef = React.useRef(false)

  // Update when initial links change (e.g., on first load)
  useEffect(() => {
    setLinks(initialLinks)
    // Update the ref when links change
    linkIdsRef.current = new Set(initialLinks.map(link => link.id))
  }, [initialLinks])

  useEffect(() => {
    console.log('Setting up realtime subscription for user:', userId)

    // Create a unique channel ID that's fully unique (with timestamp and random string)
    const channelId = `public_profile_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`Creating public profile channel: ${channelId}`);

    let channel: RealtimeChannel | null = null;
    try {
      // Create channel with a unique name for public profile page
      channel = supabase.channel(channelId);

      // For all events (INSERT, UPDATE, DELETE), just refetch the entire list
      // This ensures consistency and prevents duplicates
      const handleDatabaseChange = async (payload?: any) => {
        if (isHandlingEventRef.current) return;

        try {
          isHandlingEventRef.current = true;

          // Check if this is a content update (name/URL change)
          const isContentUpdate = payload &&
            payload.eventType === 'UPDATE' &&
            payload.new && payload.old && (
              payload.new.url !== payload.old.url ||
              payload.new.title !== payload.old.title ||
              payload.new.platform !== payload.old.platform
            );

          if (isContentUpdate) {
            console.log('Public profile: Detected content update (name/URL/platform changed)');
          }

          console.log('Public profile: Database change detected, fetching fresh data...');

          const { data: freshLinks } = await supabase
            .from('social_tree')
            .select('*')
            .eq('user_id', userId)
            .order('order_index', { ascending: true });

          if (freshLinks) {
            console.log('Public profile: Updated links received:', freshLinks.length);

            // Before blindly updating, check if there are actual differences
            // This prevents unnecessary re-renders when the data hasn't changed
            const freshIds = new Set(freshLinks.map(link => link.id));

            // Check if there are differences by comparing IDs
            let hasDifferences = freshIds.size !== linkIdsRef.current.size;

            // If we have a content update, force an update regardless of ID changes
            if (isContentUpdate) {
              hasDifferences = true;
              console.log('Public profile: Forcing update due to content change');
            }

            if (!hasDifferences) {
              // Check for items in fresh that aren't in current
              for (const link of freshLinks) {
                if (!linkIdsRef.current.has(link.id)) {
                  hasDifferences = true;
                  break;
                }
              }

              // If still no differences, check for items in current that aren't in fresh
              if (!hasDifferences) {
                for (const id of linkIdsRef.current) {
                  if (!freshIds.has(id)) {
                    hasDifferences = true;
                    break;
                  }
                }
              }

              // Even if IDs match, content might have changed (name/URL updates)
              if (!hasDifferences && payload && payload.eventType === 'UPDATE') {
                // Compare content of current links with fresh links
                const currentLinks = links;
                const currentLinksMap = new Map(currentLinks.map(link => [link.id, link]));

                for (const freshLink of freshLinks) {
                  const currentLink = currentLinksMap.get(freshLink.id);
                  if (currentLink && (
                    currentLink.url !== freshLink.url ||
                    currentLink.title !== freshLink.title ||
                    currentLink.platform !== freshLink.platform
                  )) {
                    console.log('Public profile: Content change detected for link', freshLink.id);
                    hasDifferences = true;
                    break;
                  }
                }
              }
            }

            if (hasDifferences) {
              // Only update state if there's a difference in the data
              console.log('Public profile: Differences detected, updating links');

              // Update our ref for next comparison
              linkIdsRef.current = freshIds;

              setLinks(freshLinks);
            } else {
              console.log('Public profile: No changes detected, skipping update');
            }
          }
        } catch (error) {
          console.error('Error fetching updated links:', error);
        } finally {
          // Allow handling future events after a short delay
          // This prevents race conditions with multiple rapid changes
          setTimeout(() => {
            isHandlingEventRef.current = false;
          }, 1000); // Longer delay for public profile to ensure dashboard has time to update
        }
      };

      // Set up a single handler for all database events
      channel.on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Public profile: Database event:', payload.eventType, payload);
          handleDatabaseChange(payload);
        }
      );

      // Subscribe to the channel and log status
      channel.subscribe((status) => {
        console.log(`Public profile realtime status for ${userId}:`, status);
      });
    } catch (error) {
      console.error('Critical error setting up realtime for public profile:', error);
    }

    return () => {
      console.log('Cleaning up realtime subscription for public profile:', userId);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.error('Error removing channel:', err);
        }
      }
    };
  }, [supabase, userId, links]) // Added links to dependencies since we reference it for the initial ref value

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