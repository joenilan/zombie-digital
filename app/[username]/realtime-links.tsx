"use client"

import React, { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRealtimeLinksStore, type SocialLink } from '@/stores/useRealtimeLinksStore'
import { useSocialLinksManagerStore } from '@/stores/useSocialLinksManagerStore'
import {
  Twitch,
  ChevronDown,
  getPlatformIcon,
  getPlatformColor,
  Link as LinkIcon
} from '@/lib/icons'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

interface RealtimeLinksProps {
  userId: string
  initialLinks: SocialLink[]
  isOwner?: boolean
}

function TwitchLink({ link, username }: { link: SocialLink; username: string }) {
  const {
    isExpanded,
    isLive,
    streamInfo,
    streamError,
    setIsExpanded,
    setIsLive,
    setStreamInfo,
    setStreamError
  } = useRealtimeLinksStore()

  useEffect(() => {
    async function checkTwitchStatus() {
      try {
        const response = await fetch(`/api/twitch/status?username=${username}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setIsLive(data.isLive)
        setStreamInfo(data.stream)
        setStreamError(null)
      } catch (error) {
        console.error('Error checking Twitch status:', error)
        setStreamError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    const interval = setInterval(checkTwitchStatus, 60000) // Check every minute
    checkTwitchStatus() // Initial check

    return () => {
      clearInterval(interval)
    }
  }, [username, setIsLive, setStreamInfo, setStreamError])

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
          <Twitch className="w-6 h-6" />
          <span className="font-medium text-lg">
            {link.title || link.platform}
          </span>
          {streamError ? (
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
  const {
    links,
    isUpdating,
    lastUpdateType,
    setLinks,
    setIsUpdating,
    setLastUpdateType
  } = useRealtimeLinksStore()

  const supabase = createClientComponentClient()

  // Also update the manager store for dashboard sync
  const managerStore = useSocialLinksManagerStore()

  // Define refs at component level, not inside useEffect
  const linkIdsRef = React.useRef(new Set<string>())
  const isHandlingEventRef = React.useRef(false)

  // Update when initial links change (e.g., on first load)
  useEffect(() => {
    setLinks(initialLinks)
    // Update the ref when links change
    linkIdsRef.current = new Set(initialLinks.map(link => link.id))
  }, [initialLinks, setLinks])

  useEffect(() => {
    // Create a unique channel ID that's fully unique (with timestamp and random string)
    const channelId = `public_profile_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let channel: RealtimeChannel | null = null;
    let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
    let isCleanedUp = false; // Flag to prevent operations after cleanup

    try {
      // Create channel with a unique name for public profile page
      channel = supabase.channel(channelId);

      // Debounced handler to prevent rapid-fire updates
      const debouncedRefresh = (eventType?: 'INSERT' | 'UPDATE' | 'DELETE') => {
        if (isCleanedUp || debounceTimeout) {
          if (debounceTimeout) clearTimeout(debounceTimeout);
        }
        if (isCleanedUp) return; // Don't proceed if cleaned up

        debounceTimeout = setTimeout(async () => {
          if (isCleanedUp) return;

          try {
            setIsUpdating(true);
            setLastUpdateType(eventType || null);

            const { data: freshLinks } = await supabase
              .from('social_tree')
              .select('*')
              .eq('user_id', userId)
              .order('order_index', { ascending: true });

            if (freshLinks && !isCleanedUp) {
              // Update our tracking set
              linkIdsRef.current.clear();
              freshLinks.forEach(link => linkIdsRef.current.add(link.id));

              setLinks(freshLinks);

              // Also update the manager store for dashboard sync
              managerStore.setLinks(freshLinks);

              // Show update feedback briefly
              setTimeout(() => {
                if (!isCleanedUp) {
                  setIsUpdating(false);
                  setLastUpdateType(null);
                }
              }, 1000);
            }
          } catch (error) {
            console.error('Error fetching fresh links:', error);
            if (!isCleanedUp) {
              setIsUpdating(false);
              setLastUpdateType(null);
            }
          }
        }, 50); // 50ms debounce (different from dashboard's 350ms)
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
          if (!isCleanedUp) {
            debouncedRefresh(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          }
        }
      );

      // Subscribe to the channel and log status
      channel.subscribe();
    } catch (error) {
      console.error('Critical error setting up realtime for public profile:', error);
    }

    return () => {
      isCleanedUp = true; // Set cleanup flag first

      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.error('Error removing public profile channel:', err);
        }
      }

      // Reset state flags
      setIsUpdating(false);
      setLastUpdateType(null);
    };
  }, [supabase, userId, setLinks, setIsUpdating, setLastUpdateType])

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
    <div className="space-y-4 w-full relative">
      {/* Real-time update indicator */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-cyber-gradient text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              {lastUpdateType === 'INSERT' && '✨ Link added'}
              {lastUpdateType === 'UPDATE' && '🔄 Links updated'}
              {lastUpdateType === 'DELETE' && '🗑️ Link removed'}
              {!lastUpdateType && '🔄 Updating...'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links with layout animations */}
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {links.map((link, index) => {
            // Special handling for Twitch links
            if (link.platform.toLowerCase() === 'twitch') {
              // Extract username from Twitch URL
              const match = link.url.match(/twitch\.tv\/([^\/\?]+)/);
              if (!match) {
                console.error('Failed to extract username from URL:', link.url);
                return null;
              }

              const username = match[1];

              try {
                return (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TwitchLink link={link} username={username} />
                  </motion.div>
                );
              } catch (error) {
                console.error('Error rendering TwitchLink:', error);
                return null;
              }
            }

            // Regular link
            const Icon = getPlatformIcon(link.platform);
            return (
              <motion.a
                key={link.id}
                layout
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 rounded-xl bg-glass shadow-glass 
                         hover:shadow-cyber transition-all duration-300 transform hover:-translate-y-1
                         text-center group relative overflow-hidden"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05
                  }
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                  scale: 0.95,
                  transition: { duration: 0.2 }
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <Icon className="w-6 h-6" style={{ color: getPlatformColor(link.platform) }} />
                  <span className="font-medium text-lg">
                    {link.title || link.platform}
                  </span>
                </div>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
} 