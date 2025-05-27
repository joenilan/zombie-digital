"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { SocialLinksManagerV2 } from '@/components/social-links-manager-v2'
import type { SocialLink } from '@/components/social-links-manager-v2'
import { BackgroundManager } from '@/components/background-manager'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, QrCode, BarChart4, Eye, Share2, Settings, Layers, ChevronRight, Link as LinkIcon, Copy as CopyIcon, UserCircle, Calendar, ArrowUpRight, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { QRDialog } from '@/app/[username]/qr-dialog'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays, startOfDay, formatDistanceToNow } from 'date-fns'
import React from 'react'
import { useRouter } from 'next/navigation'
import { RealtimeChannel } from '@supabase/supabase-js'

interface TwitchUser {
  id: string
  username: string
  display_name?: string
  profile_image_url?: string
  background_media_url: string | null
  background_media_type: string | null
  created_at?: string
  [key: string]: any

}

const StatCard = ({ title, value, icon: Icon, color = "primary" }: {
  title: string,
  value: string | number,
  icon: React.ElementType,
  color?: string
}) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}/10`}>
      <Icon className={`w-6 h-6 text-${color}`} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

export default function SocialLinksPage() {
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null)
  const [links, setLinks] = useState<SocialLink[]>([])
  const [profileViews, setProfileViews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'analytics'>('links')
  const [showAddLinkDialog, setShowAddLinkDialog] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Define refs at the component level
  const currentLinkIdsRef = React.useRef(new Set<string>())
  const isHandlingEventRef = React.useRef(false)

  // Initial data loading
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

      // Get profile views count using the twitch user ID (the profile being viewed)
      const { data: viewsData } = await supabase
        .from('profile_views')
        .select('view_count')
        .eq('user_id', user.id)
        .single()

      setTwitchUser(user)
      setLinks(socialLinks || [])
      setProfileViews(viewsData?.view_count ?? 0)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Update ref when links change
  useEffect(() => {
    // Update our links tracking ref
    currentLinkIdsRef.current = new Set(links.map(link => link.id));
  }, [links]);

  // Subscribe to real-time changes in social_tree
  useEffect(() => {
    if (!twitchUser) return;

    console.log('Setting up dashboard realtime subscriptions for user:', twitchUser.id);

    // Create the channel with a unique name (including random string to ensure uniqueness)
    const channelId = `dashboard_social_tree_${twitchUser.id}_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Creating dashboard channel: ${channelId}`);

    // Declare variables outside the try block for cleanup
    let channel: RealtimeChannel | null = null;
    let refreshInterval: ReturnType<typeof setInterval> | undefined;

    // Add error boundary
    try {
      channel = supabase.channel(channelId);

      // Handle INSERT events
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${twitchUser.id}`
        },
        (payload) => {
          console.log('Dashboard: INSERT event received', payload);

          // Add the new link to our existing links but check for duplicates
          if (!isHandlingEventRef.current && payload.new && payload.new.id) {
            isHandlingEventRef.current = true;

            try {
              // Prevent adding duplicate items by checking if we already have this ID
              if (!currentLinkIdsRef.current.has(payload.new.id)) {
                // Add to our tracking set
                currentLinkIdsRef.current.add(payload.new.id);

                // Type assertion to handle Supabase payload typing
                const newLink = payload.new as any as SocialLink;

                setLinks(prevLinks => {
                  // Double-check that the link doesn't already exist in the list
                  if (prevLinks.some(link => link.id === newLink.id)) {
                    return prevLinks;
                  }
                  return [...prevLinks, newLink];
                });
              }
            } catch (err) {
              console.error('Error handling INSERT event:', err);
            } finally {
              setTimeout(() => { isHandlingEventRef.current = false; }, 300);
            }
          }
        }
      );

      // Handle DELETE events
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${twitchUser.id}`
        },
        (payload) => {
          console.log('Dashboard: DELETE event received', payload);

          // Remove the deleted link
          if (!isHandlingEventRef.current && payload.old && payload.old.id) {
            isHandlingEventRef.current = true;

            try {
              // Remove from our tracking set
              currentLinkIdsRef.current.delete(payload.old.id);

              setLinks(prevLinks => prevLinks.filter(link => link.id !== payload.old.id));
            } catch (err) {
              console.error('Error handling DELETE event:', err);
            } finally {
              setTimeout(() => { isHandlingEventRef.current = false; }, 300);
            }
          }
        }
      );

      // Handle UPDATE events
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${twitchUser.id}`
        },
        async (payload) => {
          console.log('Dashboard: UPDATE event received', payload);

          // For updates (especially reordering), fetch all links to ensure correct order
          if (!isHandlingEventRef.current) {
            isHandlingEventRef.current = true;

            try {
              // Check if this is a name/URL update (instead of just reordering)
              const isContentUpdate = payload.new && payload.old && (
                payload.new.url !== payload.old.url ||
                payload.new.title !== payload.old.title ||
                payload.new.platform !== payload.old.platform
              );

              if (isContentUpdate) {
                console.log('Dashboard: Detected content update (name/URL/platform changed)');
              }

              const { data: updatedLinks } = await supabase
                .from('social_tree')
                .select('*')
                .eq('user_id', twitchUser.id)
                .order('order_index');

              if (updatedLinks) {
                // Update our tracking set based on the fresh data
                currentLinkIdsRef.current.clear();
                updatedLinks.forEach(link => currentLinkIdsRef.current.add(link.id));

                setLinks(updatedLinks);
                console.log('Dashboard: Updated links with fresh data, count:', updatedLinks.length);
              }
            } catch (error) {
              console.error('Error fetching updated links:', error);
            } finally {
              setTimeout(() => { isHandlingEventRef.current = false; }, 300);
            }
          }
        }
      );

      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log(`Dashboard social links subscription status (${twitchUser.id}):`, status);
      });

      // Fallback: Occasionally refresh the entire list to ensure consistency
      // but don't use an interval that's too frequent
      refreshInterval = setInterval(async () => {
        if (!isHandlingEventRef.current) {
          try {
            const { data: freshLinks } = await supabase
              .from('social_tree')
              .select('*')
              .eq('user_id', twitchUser.id)
              .order('order_index');

            if (freshLinks) {
              // Only update if there are differences
              const currentLinks = Array.from(currentLinkIdsRef.current);
              const freshIds = freshLinks.map(link => link.id);

              const hasDifferences =
                currentLinks.length !== freshIds.length ||
                freshLinks.some(link => !currentLinkIdsRef.current.has(link.id)) ||
                currentLinks.some(id => !freshIds.includes(id));

              if (hasDifferences) {
                // Update our tracking set
                currentLinkIdsRef.current.clear();
                freshLinks.forEach(link => currentLinkIdsRef.current.add(link.id));

                setLinks(freshLinks);
              }
            }
          } catch (error) {
            console.error('Error during periodic refresh:', error);
          }
        }
      }, 30000); // Every 30 seconds

    } catch (error) {
      console.error('Critical error in dashboard real-time setup:', error);
    }

    return () => {
      console.log('Cleaning up dashboard realtime subscriptions');
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Safely remove channels
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.error('Error removing channel:', e);
        }
      }


    };
  }, [twitchUser, supabase]) // Removed links from dependencies

  const handleBackgroundUpdate = (background: { url: string | null; type: string | null }) => {
    setTwitchUser(prev => prev ? {
      ...prev,
      background_media_url: background.url,
      background_media_type: background.type
    } : null)

    toast.success('Background updated', {
      description: 'Your profile background has been updated',
    })
  }

  const handleCopyUrl = async () => {
    if (!twitchUser?.username) return
    const url = `${window.location.origin}/${twitchUser.username}`
    await navigator.clipboard.writeText(url)
    toast.success('Profile URL copied', {
      description: 'Link copied to clipboard',
    })
  }

  const handleOpenProfile = () => {
    if (!twitchUser?.username) return
    window.open(`/${twitchUser.username}`, '_blank')
  }

  if (isLoading || !twitchUser) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LinkIcon className="w-8 h-8 text-primary animate-spin-slow" />
          </div>
        </div>
      </div>
    )
  }

  const profileUrl = `${window.location.origin}/${twitchUser.username}`

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Page header */}
      <div className="space-y-6 mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
          Social Presence
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Manage your social media presence, customize your profile, and track engagement with your audience.
        </p>
      </div>

      {/* Profile summary and preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="lg:col-span-2 p-6 rounded-xl bg-background"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg"></div>
              <Image
                src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full relative z-10 object-cover border-0"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold">{twitchUser.display_name || twitchUser.username}</h2>
              <p className="text-muted-foreground">@{twitchUser.username}</p>
            </div>

            <Button
              variant="outline"
              className="gap-2 border-0 bg-muted/20"
              onClick={handleOpenProfile}
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <CopyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={profileUrl}
                  readOnly
                  className="pl-10 pr-24 bg-muted/20 border-0"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button size="icon" variant="ghost" onClick={handleCopyUrl} className="h-8 w-8">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <QRDialog username={twitchUser.username} />
                </div>
              </div>

              <Button className="gap-2 bg-primary hover:bg-primary/90 text-white" onClick={handleOpenProfile}>
                <ExternalLink className="w-4 h-4" />
                Open Profile
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 rounded-xl bg-background"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 gap-4">
            <StatCard
              title="Social Links"
              value={links.length}
              icon={LinkIcon}
            />
            <StatCard
              title="Profile Views"
              value={profileViews !== null ? profileViews : "--"}
              icon={Eye}
              color="blue"
            />
            {/* More stats can be added here */}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/10 mb-8 gap-2">
        <button
          onClick={() => setActiveTab('links')}
          className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'links'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Social Links
          {activeTab === 'links' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="activeTab"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'appearance'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Profile Appearance
          {activeTab === 'appearance' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="activeTab"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'analytics'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Analytics
          {activeTab === 'analytics' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="activeTab"
            />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-[500px]">
        {activeTab === 'links' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Manage Your Links</h2>
              <p className="text-muted-foreground mb-6">
                Add, edit and arrange the links that appear on your public profile page.
              </p>
            </div>

            <SocialLinksManagerV2
              twitchUserId={twitchUser.id}
              initialLinks={links}
              onLinksChange={setLinks}
            />
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Profile Background</h2>
              <p className="text-muted-foreground mb-6">
                Customize your profile background to match your brand.
              </p>

              <div className="bg-background rounded-xl p-6">
                <BackgroundManager
                  userId={twitchUser.id}
                  currentBackground={{
                    url: twitchUser.background_media_url,
                    type: twitchUser.background_media_type
                  }}
                  onUpdate={handleBackgroundUpdate}
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">Profile Settings</h2>
              <p className="text-muted-foreground mb-6">
                Additional profile customization options will be available soon.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background flex items-center">
                  <div className="flex-1">
                    <h3 className="font-medium">Custom Theme</h3>
                    <p className="text-sm text-muted-foreground">Set colors for your profile page</p>
                  </div>
                  <div className="text-muted-foreground">Coming soon</div>
                </div>

                <div className="p-4 rounded-xl bg-background flex items-center">
                  <div className="flex-1">
                    <h3 className="font-medium">Link Animations</h3>
                    <p className="text-sm text-muted-foreground">Add animations to your links</p>
                  </div>
                  <div className="text-muted-foreground">Coming soon</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Profile Analytics</h2>
              <p className="text-muted-foreground mb-6">
                Track engagement with your profile and understand your audience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Total Profile Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">{profileViews !== null ? profileViews : "0"}</div>
                    <div className="text-sm text-blue-500 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      All time
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-purple-500" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">{links.length}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Active links
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Profile Age
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">
                      {twitchUser?.created_at ? formatDistanceToNow(new Date(twitchUser.created_at), { addSuffix: false }) : "--"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-background rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Views Over Time</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                    toast.info("Refreshing analytics...", {
                      description: "Your analytics data is being updated.",
                    })
                  }}>
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="h-[350px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg"></div>
                  <div className="relative flex items-center justify-center w-full h-full rounded-full bg-muted/20">
                    <BarChart4 className="w-8 h-8 text-primary/70" />
                  </div>
                </div>

                <h3 className="text-xl font-medium mb-2">Detailed Analytics Coming Soon</h3>

                <p className="text-muted-foreground max-w-md mb-2">
                  We're working on detailed charts to show your profile views over time and other engagement metrics.
                </p>

                <p className="text-sm text-muted-foreground">
                  Your views are being tracked now and will be displayed in charts soon!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Traffic Sources</CardTitle>
                  <CardDescription>Where your profile visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Link Click Analytics</CardTitle>
                  <CardDescription>Which links get the most engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 