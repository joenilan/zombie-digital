"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { SocialLink } from '@/stores/useSocialLinksStore'
import { redirect } from 'next/navigation'
import { useFeatureAccess } from '@/hooks/use-feature-access'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CopyButton, ViewButton, QRButton } from '@/components/ui/action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
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
  getPlatformColor,
  Users
} from '@/lib/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays, startOfDay, formatDistanceToNow } from 'date-fns'
import React from 'react'
import { AnimatedBreadcrumb } from '@/components/ui/breadcrumb'

import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useSocialLinksStore } from '@/stores/useSocialLinksStore'
import { umami } from '@/lib/umami'

// Dynamic imports for heavy components
const SocialLinksManagerV2 = dynamic(() => import('@/components/social-links-manager-v2').then(mod => ({ default: mod.SocialLinksManagerV2 })), {
  loading: () => <div className="h-64 bg-glass/50 animate-pulse rounded-xl" />,
  ssr: false
})

const BackgroundUpload = dynamic(() => import('@/components/background-upload').then(mod => ({ default: mod.BackgroundUpload })), {
  loading: () => <div className="h-32 bg-glass/50 animate-pulse rounded-xl" />,
  ssr: false
})

const UserAnalytics = dynamic(() => import('@/components/user-analytics').then(mod => ({ default: mod.UserAnalytics })), {
  loading: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-glass/50 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-glass/50 animate-pulse rounded-xl" />
    </div>
  ),
  ssr: false
})

const QRDialog = dynamic(() => import('@/app/[username]/qr-dialog').then(mod => ({ default: mod.QRDialog })), {
  loading: () => null,
  ssr: false
})

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
  // FIXED: Use twitchUser (which has site_role) instead of authUser

  // Wait for auth to initialize and user data to load before checking feature access
  const shouldCheckFeatureAccess = isInitialized && !authLoading && twitchUser

  const { hasFeatureAccess, isLoading: featuresLoading } = useFeatureAccess(shouldCheckFeatureAccess ? twitchUser : null)

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
  const channelRef = React.useRef<RealtimeChannel | null>(null)

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

    // Clean up existing channel first
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      } catch (e) {
        console.error('Error removing existing channel:', e);
      }
    }



    // Set up realtime subscription for dashboard
    const channelId = `dashboard_social_links_${twitchUser.id}_${Date.now()}`;

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
          // Prevent duplicate handling
          if (isHandlingEventRef.current) return;
          isHandlingEventRef.current = true;

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
          } finally {
            // Reset handling flag after a delay
            setTimeout(() => {
              isHandlingEventRef.current = false;
            }, 100);
          }
        }
      )
      .subscribe();

    // Store channel reference
    channelRef.current = channel;

    return () => {
      try {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      } catch (e) {
        console.error('Error removing dashboard channel:', e);
      }
    };
  }, [twitchUser?.id, supabase]) // Only depend on twitchUser.id, not the whole object

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

  const handleBioUpdate = (newBio: string) => {
    if (twitchUser) {
      setTwitchUser({ ...twitchUser, custom_bio: newBio })
    }
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

  if (isLoading || !twitchUser) {
    return <LoadingSpinner text="Loading social links..." />
  }

  // Feature access check - MOVED AFTER loading check so twitchUser is available
  // Only check feature access if we have a user and features are loaded
  if (shouldCheckFeatureAccess && !featuresLoading && !hasFeatureAccess('SOCIALS')) {

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
            <div className="text-xs font-mono bg-glass/20 p-2 rounded">
              Debug: User role = {twitchUser?.site_role || 'null'}
            </div>
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

  const profileUrl = `${window.location.origin}/${twitchUser.username}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <AnimatedBreadcrumb variant="glass" />
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              <span className="gradient-brand">Social Links</span>
            </h1>
            <p className="text-foreground/70 text-lg">
              Manage your digital presence and track your performance
            </p>
          </div>

          {/* Profile Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-foreground/60 mb-1">Your Profile</p>
              <button
                onClick={handleOpenProfile}
                className="text-sm font-mono text-foreground/80 hover:text-cyber-cyan transition-colors block"
                title="Click to open your profile"
              >
                zombie.digital/{twitchUser.username}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <CopyButton
                  onClick={handleCopyUrl}
                  size="icon"
                  tooltip="Copy profile link"
                >
                  <Copy className="w-4 h-4" />
                </CopyButton>

                <ViewButton
                  onClick={handleOpenProfile}
                  size="icon"
                  tooltip="Open profile in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </ViewButton>

                <QRDialog username={twitchUser.username} variant="icon" />
              </TooltipProvider>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-pink/10 text-cyber-pink">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Social Links</p>
              <p className="text-2xl font-bold">{links.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Views</p>
              <p className="text-2xl font-bold">
                {quickStatsLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  quickStats?.profileViews?.toLocaleString() || "0"
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <p className="text-2xl font-bold">
                {quickStatsLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  quickStats?.uniqueVisitors?.toLocaleString() || "0"
                )}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

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

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-medium transition-all duration-300 relative ${activeTab === 'settings'
            ? 'text-foreground'
            : 'text-foreground/70 hover:text-foreground'
            }`}
        >
          Settings
          {activeTab === 'settings' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-pink to-purple-500"
              layoutId="activeTab"
            />
          )}
        </button>
      </motion.div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'links' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Links Management */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="xl:col-span-2"
              >
                {/* Social Links Manager */}
                <Card variant="glass-interactive">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Manage Links</CardTitle>
                        <CardDescription className="mt-1">
                          Add, edit, and reorder your social media links
                        </CardDescription>
                      </div>
                      <div className="text-sm text-foreground/60 bg-glass/20 px-3 py-1 rounded-full border border-white/10">
                        {links.length} {links.length === 1 ? 'link' : 'links'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SocialLinksManagerV2
                      twitchUserId={twitchUser.id}
                      initialLinks={links}
                      onLinksChange={setLinks}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Column - Live Preview & Background */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="xl:col-span-1"
              >
                <div className="sticky top-6">
                  <Card variant="glass-interactive">
                    <CardHeader>
                      <CardTitle className="text-lg">Live Preview & Background</CardTitle>
                      <CardDescription>
                        See how your profile looks and customize the background
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mobile-first responsive preview */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-sm">
                          <div className="bg-background/20 backdrop-blur-xl rounded-xl shadow-glass overflow-hidden border border-white/10">
                            {/* Background */}
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

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                            {/* Content */}
                            <div className="relative space-y-4 p-6">
                              {/* Profile Header */}
                              <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-cyan animate-pulse blur-xl opacity-50"></div>
                                  <Image
                                    src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                                    alt={twitchUser.display_name || twitchUser.username}
                                    width={80}
                                    height={80}
                                    className="rounded-full relative border-2 border-background/50"
                                  />
                                </div>
                                <h1 className="text-xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink to-cyber-cyan">
                                  {twitchUser.display_name || twitchUser.username}
                                </h1>
                                <p className="text-sm text-muted-foreground mb-4">@{twitchUser.username}</p>
                              </div>

                              {/* Social Links */}
                              <div className="space-y-3">
                                {links.length > 0 ? (
                                  links.slice(0, 4).map((link) => {
                                    const Icon = getPlatformIcon(link.platform)
                                    return (
                                      <div
                                        key={link.id}
                                        className="block w-full p-3 bg-glass shadow-glass hover:shadow-cyber transition-all duration-300 text-center group relative overflow-hidden rounded-lg"
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
                                  <div className="text-center py-8 text-sm text-muted-foreground">
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

                          {/* Footer */}
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

                      {/* Background Upload */}
                      <div className="flex justify-center">
                        <BackgroundUpload
                          userId={twitchUser.id}
                          onSuccess={(url, type) => {
                            handleBackgroundUpdate({ url, type })
                          }}
                          showPreview={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">Analytics Overview</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Track your profile performance, visitor engagement, and link clicks.
              </p>
            </div>

            <UserAnalytics
              userId={twitchUser.twitch_id}
              username={twitchUser.username}
              websiteId="fffd9866-0f93-4330-b588-08313c1a1af9"
              initialDays={30}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">Profile Settings</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Customize your profile appearance and personal information.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Information */}
              <Card variant="glass-interactive">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile details and bio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bio Section */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Custom Bio
                    </label>
                    <textarea
                      value={twitchUser.custom_bio || ''}
                      onChange={(e) => handleBioUpdate(e.target.value)}
                      placeholder="Tell visitors about yourself..."
                      className="w-full p-3 bg-glass/20 border border-white/10 rounded-lg backdrop-blur-xl 
                            focus:bg-glass/30 focus:border-white/20 transition-all duration-300
                            text-foreground placeholder:text-foreground/50 resize-none"
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {twitchUser.custom_bio?.length || 0}/200 characters
                    </p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Display Name
                    </label>
                    <Input
                      value={twitchUser.display_name || twitchUser.username}
                      readOnly
                      className="bg-glass/10 border-white/5 text-foreground/70"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Synced from your Twitch profile
                    </p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Username
                    </label>
                    <Input
                      value={twitchUser.username}
                      readOnly
                      className="bg-glass/10 border-white/5 text-foreground/70"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your unique profile URL: /{twitchUser.username}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Theme & Appearance */}
              <Card variant="glass-interactive">
                <CardHeader>
                  <CardTitle>Theme & Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 flex items-center justify-center">
                      <Settings className="w-8 h-8 text-cyber-pink" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-sm max-w-md mx-auto">
                      Custom themes, color schemes, typography options, and advanced styling controls are in development.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Visibility */}
              <Card variant="glass-interactive">
                <CardHeader>
                  <CardTitle>Privacy & Visibility</CardTitle>
                  <CardDescription>
                    Control who can see your profile and links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-blue-500/20 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-cyber-cyan" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-sm max-w-md mx-auto">
                      Profile visibility settings, private links, and access controls will be available soon.
                    </p>
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