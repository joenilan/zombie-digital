"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { SocialLinksManagerV2 } from '@/components/social-links-manager-v2'
import type { SocialLink } from '@/stores/useSocialLinksStore'
import { BackgroundUpload } from '@/components/background-upload'
import { redirect } from 'next/navigation'
import { useFeatureAccess } from '@/hooks/use-feature-access'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Copy,
  ExternalLink,
  QrCode,
  BarChart4,
  Eye,
  Share2,
  Settings,
  Layers,
  ChevronRight,
  Link as LinkIcon,
  Copy as CopyIcon,
  UserCircle,
  Calendar,
  ArrowUpRight,
  RefreshCcw,
  getPlatformIcon,
  getPlatformColor
} from '@/lib/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { QRDialog } from '@/app/[username]/qr-dialog'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays, startOfDay, formatDistanceToNow } from 'date-fns'
import React from 'react'

import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useSocialLinksStore } from '@/stores/useSocialLinksStore'

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
  <div className="p-4 rounded-lg bg-background/20 border border-white/5">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  </div>
)

export default function SocialLinksPage() {
  const { user: authUser, session, isLoading: authLoading, isInitialized } = useAuthStore()
  const {
    twitchUser,
    links,
    profileViews,
    isLoading,
    activeTab,
    showAddLinkDialog,
    setTwitchUser,
    setLinks,
    setProfileViews,
    setIsLoading,
    setActiveTab,
    setShowAddLinkDialog,
    updateBackground
  } = useSocialLinksStore()
  const supabase = createClientComponentClient()
  const { hasFeatureAccess, isLoading: featuresLoading } = useFeatureAccess(authUser)

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Define refs at the component level
  const currentLinkIdsRef = React.useRef(new Set<string>())
  const isHandlingEventRef = React.useRef(false)

  // Auth is handled by dashboard layout - no need for redirect logic here

  // Initial data loading
  useEffect(() => {
    async function loadData() {
      if (!authUser) return

      try {
        const provider_id = authUser.twitch_id

        // Get the correct user_id from twitch_users
        const { data: user } = await supabase
          .from('twitch_users')
          .select('*')
          .eq('twitch_id', provider_id)
          .single()

        if (!user) {
          console.error('User not found in database')
          return
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
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isInitialized && authUser) {
      loadData()
    }
  }, [authUser, isInitialized, supabase])

  // Update ref when links change
  useEffect(() => {
    // Update our links tracking ref
    currentLinkIdsRef.current = new Set(links.map(link => link.id));
  }, [links]);

  // Subscribe to real-time changes in social_tree
  useEffect(() => {
    if (!twitchUser) return;

    console.log('Setting up dashboard realtime subscriptions for user:', twitchUser.id);

    // Set up realtime subscription for dashboard
    const channelId = `dashboard_social_links_${twitchUser.id}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${twitchUser.id}`
        },
        async (payload) => {
          // Fetch fresh data when changes occur
          try {
            const { data: freshLinks, error } = await supabase
              .from('social_tree')
              .select('*')
              .eq('user_id', twitchUser.id)
              .order('order_index', { ascending: true });

            if (error) {
              console.error('Error fetching fresh links:', error);
              return;
            }

            setLinks(freshLinks || []);
          } catch (error) {
            console.error('Error fetching fresh links:', error);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.error('Error removing dashboard channel:', e);
      }
    };
  }, [twitchUser, supabase])

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!authUser) return

    setAnalyticsLoading(true)
    try {
      const response = await fetch('/api/analytics/profile-views?days=30')
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Fetch analytics when tab changes to analytics
  useEffect(() => {
    if (activeTab === 'analytics' && authUser && !analyticsData) {
      fetchAnalytics()
    }
  }, [activeTab, authUser, analyticsData])

  const handleBackgroundUpdate = (background: { url: string | null; type: string | null }) => {
    updateBackground(background)

    if (background.url) {
      toast.success('Background updated', {
        description: 'Your profile background has been updated',
      })
    } else {
      toast.success('Background removed', {
        description: 'Your profile background has been removed',
      })
    }
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

  // Show loading while auth is initializing
  if (!isInitialized || authLoading) {
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

  // Feature access check
  if (!featuresLoading && !hasFeatureAccess('SOCIALS')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-glass border-amber-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-400 flex items-center justify-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Feature Not Available
            </CardTitle>
            <CardDescription>
              The Social Links feature is not available for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Access Restricted
            </div>
            <p className="text-sm text-muted-foreground">
              Contact an administrator if you believe this is an error.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !twitchUser) {
    return <LoadingSpinner text="Loading social links..." />
  }

  const profileUrl = `${window.location.origin}/${twitchUser.username}`

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Social Presence</h1>
          <p className="text-gray-300">Manage your social media presence, customize your profile, and track engagement with your audience.</p>
        </motion.div>

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Background Upload */}
                  <div className="bg-background rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-4">Background Settings</h3>
                    <BackgroundUpload
                      userId={twitchUser.id}
                      showPreview={true}
                      onSuccess={(url, type) => {
                        handleBackgroundUpdate({ url, type })
                      }}
                    />
                  </div>

                  {/* Profile Preview */}
                  <div className="bg-background rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-4">Profile Preview</h3>
                    <div className="relative">
                      {/* Scaled down version of the actual profile card */}
                      <div className="max-w-[320px] mx-auto relative">
                        <div className="bg-background/20 backdrop-blur-xl rounded-xl shadow-glass overflow-hidden border border-white/10 relative">
                          {/* Background */}
                          {twitchUser.background_media_url && (
                            <div className="absolute inset-0">
                              <img
                                src={twitchUser.background_media_url}
                                alt="Profile Background"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Glass Overlay */}
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                          {/* Content - scaled down but proportionally identical */}
                          <div className="relative space-y-4 p-3">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center">
                              <div className="relative mb-3">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-cyan animate-pulse blur-lg opacity-50"></div>
                                <Image
                                  src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                                  alt="Profile"
                                  width={65}
                                  height={65}
                                  className="rounded-full relative border-2 border-background/50"
                                />
                              </div>
                              <h4 className="text-xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink to-cyber-cyan">
                                {twitchUser.display_name || twitchUser.username}
                              </h4>

                              {/* Username */}
                              <div className="flex items-center justify-center gap-1 mb-4">
                                <p className="text-sm text-muted-foreground">@{twitchUser.username}</p>
                              </div>
                            </div>

                            {/* Social Links - simple but with correct icons and hover effects */}
                            <div className="space-y-2">
                              {links.slice(0, 3).map((link) => {
                                const Icon = getPlatformIcon(link.platform)
                                return (
                                  <div
                                    key={link.id}
                                    className="block w-full p-2 bg-glass shadow-glass hover:shadow-cyber transition-all duration-300 text-center group relative overflow-hidden rounded-xl"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative flex items-center justify-center gap-2">
                                      <Icon className="w-4 h-4 flex-shrink-0" />
                                      <span className="font-medium text-xs truncate">{link.title}</span>
                                    </div>
                                  </div>
                                )
                              })}
                              {links.length === 0 && (
                                <div className="block w-full p-2 bg-glass/50 rounded-xl text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">Add your first link</span>
                                  </div>
                                </div>
                              )}
                              {links.length > 3 && (
                                <div className="text-center">
                                  <span className="text-xs text-muted-foreground">+{links.length - 3} more links</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>

                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Live preview of your public profile
                      </p>
                    </div>
                  </div>
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
                      <div className="text-3xl font-bold">
                        {analyticsLoading ? "..." : (analyticsData?.totalViews || profileViews || "0")}
                      </div>
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
                      <BarChart4 className="w-4 h-4 text-green-500" />
                      Recent Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold">
                        {analyticsLoading ? "..." : (analyticsData?.recentViews || "0")}
                      </div>
                      <div className={`text-sm flex items-center ${analyticsData?.growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {analyticsData?.growthPercentage ? `${analyticsData.growthPercentage > 0 ? '+' : ''}${analyticsData.growthPercentage}%` : 'Last 7 days'}
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
              </div>

              <div className="bg-background rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Views Over Time</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                      setAnalyticsData(null)
                      fetchAnalytics()
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
    </div>
  )
} 