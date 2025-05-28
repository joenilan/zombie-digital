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
          <Twitch className="w-6 h-6" />
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
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdateType, setLastUpdateType] = useState<'INSERT' | 'UPDATE' | 'DELETE' | null>(null)
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
          if (isCleanedUp || isHandlingEventRef.current) return;

          try {
            isHandlingEventRef.current = true;
            setIsUpdating(true);
            setLastUpdateType(eventType || null);
            console.log('Public profile: Database change detected, fetching fresh data...');

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
              console.log('Public profile: Updated with fresh links, count:', freshLinks.length);

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
          } finally {
            setTimeout(() => {
              if (!isCleanedUp) {
                isHandlingEventRef.current = false;
              }
            }, 500);
          }
        }, 400); // 400ms debounce (different from dashboard's 350ms)
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
            console.log('Public profile: Database event:', payload.eventType, payload);
            debouncedRefresh(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
          }
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
      isCleanedUp = true; // Set cleanup flag first

      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (channel) {
        try {
          supabase.removeChannel(channel);
          console.log('Successfully removed public profile channel:', channelId);
        } catch (err) {
          console.error('Error removing public profile channel:', err);
        }
      }

      // Reset state flags
      isHandlingEventRef.current = false;
      setIsUpdating(false);
      setLastUpdateType(null);
    };
  }, [supabase, userId]) // Removed links from dependencies to prevent infinite loops

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
                return (
                  <motion.div
                    key={link.id}
                    layout
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
                      y: -2,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                  >
                    <TwitchLink link={link} username={username} />
                  </motion.div>
                );
              } catch (error) {
                console.error('Error rendering TwitchLink:', error);
                // Fallback to regular link if TwitchLink fails
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
                      y: -2,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center gap-3">
                      <Icon className="w-6 h-6" />
                      <span className="font-medium text-lg">
                        {link.title || link.platform}
                      </span>
                    </div>
                  </motion.a>
                );
              }
            }

            // Regular links with enhanced animations
            console.log('Rendering regular link for:', link.platform);
            const Icon = getPlatformIcon(link.platform)

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
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-lg">
                    {link.title || link.platform}
                  </span>
                </div>
              </motion.a>
            )
          })}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
} 