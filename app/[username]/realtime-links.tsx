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
import { getIconStyle } from '@/lib/icon-utils'
import { useThemeStore, type IconStyle } from '@/stores/useThemeStore'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { ViewButton } from '@/components/ui/action-button'
import { TooltipProvider } from '@/components/ui/tooltip'

interface RealtimeLinksProps {
  userId: string
  initialLinks: SocialLink[]
  isOwner?: boolean
  iconStyle?: string
}

function TwitchLink({ link, username, iconStyle }: { link: SocialLink; username: string; iconStyle: IconStyle }) {
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
    <div
      className="w-full backdrop-blur-[12px] rounded-lg border transition-all duration-300 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          rgba(var(--theme-primary), 0.10) 0%, 
          rgba(var(--theme-secondary), 0.05) 50%, 
          rgba(var(--theme-accent), 0.10) 100%
        )`,
        borderColor: `var(--theme-border-primary)`,
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: `
          0 6px 20px rgba(var(--theme-primary), 0.15), 
          0 3px 10px rgba(var(--theme-accent), 0.10),
          inset 0 1px 0 rgba(var(--theme-accent), 0.15)
        `
      }}
    >
      {/* Header row: Twitch link */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 sm:gap-3 min-h-[2.5rem] p-3 sm:p-4 text-center group relative select-none transition-all duration-200 hover:bg-white/5 focus:bg-white/10 rounded-t-lg"
        style={{ textDecoration: 'none' }}
      >
        <Twitch
          className="w-4 h-4 sm:w-6 sm:h-6"
          style={getIconStyle('twitch', iconStyle)}
        />
        <span className="font-medium text-sm sm:text-base" style={{ color: `rgb(var(--theme-foreground))` }}>
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
      </a>
      {/* Stream title if live */}
      {isLive && streamInfo && (
        <div className="px-4 pb-1 text-sm text-muted-foreground text-center">
          {streamInfo.title}
        </div>
      )}
      {/* Show Stream button as integrated footer, only when live */}
      {isLive && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm py-2 border-t border-t-[var(--theme-border-subtle)] focus:outline-none focus:bg-white/5 hover:bg-white/10 transition-colors rounded-b-lg"
          style={{ color: `rgba(var(--theme-foreground), 0.7)` }}
          aria-label={isExpanded ? 'Hide Stream' : 'Show Stream'}
          tabIndex={0}
          type="button"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
          {isExpanded ? 'Hide Stream' : 'Show Stream'}
        </button>
      )}
      {/* Expandable stream player */}
      {isLive && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative pt-[56.25%] mt-2 rounded-b-lg overflow-hidden bg-black/50"
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

export function RealtimeLinks({ userId, initialLinks, isOwner, iconStyle }: RealtimeLinksProps) {
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
                href="/dashboard/social-links"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-xl border"
                style={{
                  backgroundColor: `var(--theme-surface-primary)`,
                  borderColor: `var(--theme-border-primary)`,
                  color: `rgb(var(--theme-primary))`,
                  boxShadow: `0 0 20px rgba(var(--theme-primary), 0.3)`
                }}
              >
                <LinkIcon className="w-4 h-4" />
                Get started by adding your first link
              </a>
            </div>
          ) : (
            <Card variant="glass-subtle">
              <CardContent className="text-center">
                <p>This user hasn't added any social links yet.</p>
              </CardContent>
            </Card>
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
            <div
              className="text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              style={{
                background: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
              }}
            >
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
                    <TwitchLink link={link} username={username} iconStyle={(iconStyle as IconStyle) || 'colored'} />
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
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full p-3 sm:p-4 backdrop-blur-[12px] transition-all duration-300 text-center group relative overflow-hidden border rounded-lg`}
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(var(--theme-primary), 0.10) 0%, 
                      rgba(var(--theme-secondary), 0.05) 50%, 
                      rgba(var(--theme-accent), 0.10) 100%
                    )`,
                    borderColor: `var(--theme-border-primary)`,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    boxShadow: `
                      0 6px 20px rgba(var(--theme-primary), 0.15), 
                      0 3px 10px rgba(var(--theme-accent), 0.10),
                      inset 0 1px 0 rgba(var(--theme-accent), 0.15)
                    `
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                    style={{
                      background: `linear-gradient(45deg, rgba(var(--theme-primary), 0.15), rgba(var(--theme-accent), 0.15))`
                    }}
                  />
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <Icon
                      className="w-4 h-4 sm:w-6 sm:h-6"
                      style={getIconStyle(link.platform, (iconStyle as IconStyle) || 'colored', useThemeStore.getState().activeTheme)}
                    />
                    <span className="font-medium text-sm sm:text-base" style={{ color: `rgb(var(--theme-foreground))` }}>
                      {link.title || link.platform}
                    </span>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
} 