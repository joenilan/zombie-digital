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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays, startOfDay, formatDistanceToNow } from 'date-fns'
import React from 'react'
import { Users } from 'lucide-react'

import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useSocialLinksStore } from '@/stores/useSocialLinksStore'
import { UserAnalytics } from '@/components/user-analytics'
import { umami } from '@/lib/umami'

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

  // Analytics state - remove mock data
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Quick stats from Umami
  const [quickStats, setQuickStats] = useState<{
    profileViews: number
    uniqueVisitors: number
  } | null>(null)
  const [quickStatsLoading, setQuickStatsLoading] = useState(true)

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

  // Fetch quick stats from Umami
  useEffect(() => {
    async function fetchQuickStats() {
      if (!twitchUser?.username) return

      try {
        setQuickStatsLoading(true)
        await umami.initialize('fffd9866-0f93-4330-b588-08313c1a1af9')

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30) // Last 30 days

        // Get all page views for this user's profile
        const allPageViews = await umami.getPageViews('fffd9866-0f93-4330-b588-08313c1a1af9', startDate)

        // Filter to only this user's profile views
        const userProfilePath = `/${twitchUser.username}`
        const profileViews = allPageViews?.filter(view =>
          view.url_path === userProfilePath
        ) || []

        // Get unique visitors to this profile
        const uniqueSessionIds = new Set(profileViews.map(view => view.session_id))

        setQuickStats({
          profileViews: profileViews.length,
          uniqueVisitors: uniqueSessionIds.size
        })
      } catch (error) {
        console.error('Error fetching quick stats:', error)
        // Fallback to 0 if there's an error
        setQuickStats({
          profileViews: 0,
          uniqueVisitors: 0
        })
      } finally {
        setQuickStatsLoading(false)
      }
    }

    if (twitchUser?.username) {
      fetchQuickStats()
    }
  }, [twitchUser?.username])

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
      <div className="bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center py-16">
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
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="gradient-brand">Social</span>
            <span className="text-foreground/90"> Presence</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-3 font-medium">
            Manage Your Digital Identity
          </p>
          <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Create, customize, and track your social media presence with powerful tools and analytics
          </p>
        </motion.div>

        {/* Profile summary and preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card variant="glass-interactive" className="hover:bg-glass/40 cursor-default">
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 rounded-full blur-lg"></div>
                    <Image
                      src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full relative z-10 object-cover border-2 border-white/10"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-semibold text-foreground">{twitchUser.display_name || twitchUser.username}</h2>
                    <p className="text-foreground/70">@{twitchUser.username}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <CopyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60" />
                      <Input
                        value={profileUrl}
                        readOnly
                        className="pl-10 bg-glass/20 border-white/10 backdrop-blur-xl 
                              focus:bg-glass/30 focus:border-white/20 transition-all duration-300"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopyUrl}
                        className="h-10 w-10 rounded-lg hover:text-white hover:bg-cyber-cyan/20 transition-all duration-300"
                      >
                        <Copy className="w-4 h-4 text-cyber-cyan" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleOpenProfile}
                        className="h-10 w-10 rounded-lg hover:text-white hover:bg-cyber-pink/20 transition-all duration-300"
                      >
                        <ExternalLink className="w-4 h-4 text-cyber-pink" />
                      </Button>
                      <QRDialog username={twitchUser.username} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="glass-interactive" className="hover:bg-glass/40 cursor-default">
              <CardHeader>
                <CardTitle size="lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent spacing="tight">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-glass/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyber-pink/10 text-cyber-pink">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-ui">Social Links</p>
                        <p className="text-2xl font-bold font-heading">{links.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-glass/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-ui">Profile Views</p>
                        <p className="text-2xl font-bold font-heading">
                          {quickStatsLoading ? (
                            <span className="animate-pulse">--</span>
                          ) : (
                            quickStats?.profileViews?.toLocaleString() || "0"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-glass/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-ui">Unique Visitors</p>
                        <p className="text-2xl font-bold font-heading">
                          {quickStatsLoading ? (
                            <span className="animate-pulse">--</span>
                          ) : (
                            quickStats?.uniqueVisitors?.toLocaleString() || "0"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          className="flex border-b border-white/10 mb-8 gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-3 px-4 font-medium transition-all duration-300 relative ${activeTab === 'links'
              ? 'text-foreground'
              : 'text-foreground/70 hover:text-foreground'
              }`}
          >
            Manage Links
            {activeTab === 'links' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-pink to-purple-500"
                layoutId="activeTab"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 px-4 font-medium transition-all duration-300 relative ${activeTab === 'appearance'
              ? 'text-foreground'
              : 'text-foreground/70 hover:text-foreground'
              }`}
          >
            Background Settings
            {activeTab === 'appearance' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-pink to-purple-500"
                layoutId="activeTab"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 font-medium transition-all duration-300 relative ${activeTab === 'analytics'
              ? 'text-foreground'
              : 'text-foreground/70 hover:text-foreground'
              }`}
          >
            Analytics
            {activeTab === 'analytics' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-pink to-purple-500"
                layoutId="activeTab"
              />
            )}
          </button>
        </motion.div>

        {/* Tab content */}
        <div className="min-h-[500px]">
          {activeTab === 'links' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Manage Your Links</h2>
                <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Add, edit and arrange your social links. Upload backgrounds and see how they look in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Social Links Manager */}
                <div className="xl:col-span-3">
                  <Card variant="glass-interactive" className="h-fit cursor-default">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">Social Links</CardTitle>
                          <CardDescription className="mt-1">
                            Double-click any link to edit its details • Drag to reorder
                          </CardDescription>
                        </div>
                        <div className="text-sm text-foreground/60 bg-glass/20 px-3 py-1 rounded-full border border-white/10">
                          {links.length} {links.length === 1 ? 'link' : 'links'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <SocialLinksManagerV2
                        twitchUserId={twitchUser.id}
                        initialLinks={links}
                        onLinksChange={setLinks}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Preview & Background Combined */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Background Settings */}
                  <Card variant="glass-interactive" className="cursor-default">
                    <CardHeader>
                      <CardTitle className="text-lg">Background</CardTitle>
                      <CardDescription>
                        Upload a custom background for your profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BackgroundUpload
                        userId={twitchUser.id}
                        onSuccess={(url, type) => {
                          handleBackgroundUpdate({ url, type })
                        }}
                        showPreview={true}
                      />
                    </CardContent>
                  </Card>

                  {/* Live Profile Preview */}
                  <Card variant="glass-interactive" className="cursor-default">
                    <CardHeader>
                      <CardTitle className="text-lg">Live Preview</CardTitle>
                      <CardDescription>
                        See exactly how your profile looks to visitors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Scaled down version of the actual profile card */}
                      <div className="flex justify-center">
                        <div className="relative scale-90 origin-center">
                          <div className="w-72 bg-background/20 backdrop-blur-xl rounded-xl shadow-glass overflow-hidden border border-white/10">
                            {/* Background - same as real profile */}
                            {twitchUser.background_media_url && (
                              <div className="absolute inset-0">
                                {twitchUser.background_media_type === 'video' ? (
                                  <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                  >
                                    <source src={twitchUser.background_media_url} type="video/mp4" />
                                  </video>
                                ) : (
                                  <Image
                                    src={twitchUser.background_media_url}
                                    alt="Background"
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            )}

                            {/* Glass Overlay - same as real profile */}
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                            {/* Content - same structure as real profile */}
                            <div className="relative space-y-4 p-5">
                              {/* Profile Header - exact same as real profile */}
                              <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-cyan animate-pulse blur-xl opacity-50"></div>
                                  <Image
                                    src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                                    alt={twitchUser.display_name || twitchUser.username}
                                    width={70}
                                    height={70}
                                    className="rounded-full relative border-2 border-background/50"
                                  />
                                </div>
                                <h1 className="text-xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink to-cyber-cyan">
                                  {twitchUser.display_name || twitchUser.username}
                                </h1>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                  <p className="text-xs text-muted-foreground">@{twitchUser.username}</p>
                                </div>
                              </div>

                              {/* Social Links - same as real profile but compacted */}
                              <div className="space-y-2">
                                {links.length > 0 ? (
                                  links.slice(0, 4).map((link) => {
                                    const Icon = getPlatformIcon(link.platform)
                                    return (
                                      <div
                                        key={link.id}
                                        className="block w-full p-2.5 bg-glass shadow-glass hover:shadow-cyber transition-all duration-300 text-center group relative overflow-hidden rounded-lg"
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center justify-center gap-2">
                                          <Icon className="w-4 h-4" />
                                          <span className="font-medium text-sm">
                                            {link.title || link.platform}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="text-center py-6 text-sm text-muted-foreground">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-glass/20 flex items-center justify-center">
                                      <LinkIcon className="w-6 h-6 text-foreground/40" />
                                    </div>
                                    <p>No social links added yet</p>
                                    <p className="text-xs mt-1">Add your first link to get started</p>
                                  </div>
                                )}
                                {links.length > 4 && (
                                  <div className="text-center py-2 text-xs text-muted-foreground bg-glass/20 rounded-lg border border-white/5">
                                    +{links.length - 4} more {links.length - 4 === 1 ? 'link' : 'links'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Footer - same as real profile */}
                          <div className="text-center text-xs text-muted-foreground/60 pt-4">
                            <p>
                              Powered by{" "}
                              <span className="font-bold">
                                <span className="gradient-brand">Zombie</span>
                                <span className="text-foreground/80">.Digital</span>
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">Customization</h2>
                <p className="text-foreground/70 max-w-2xl mx-auto">
                  Advanced customization options for themes, colors, and styling.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                      Theme selection, custom colors, sliders, and advanced styling options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 flex items-center justify-center">
                        <Settings className="w-8 h-8 text-cyber-pink" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Advanced Customization</h3>
                      <p className="text-sm">
                        Theme selection, custom color palettes, typography options, and more coming soon.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <UserAnalytics
                userId={twitchUser.twitch_id}
                username={twitchUser.username}
                websiteId="fffd9866-0f93-4330-b588-08313c1a1af9"
                initialDays={30}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 