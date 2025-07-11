"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { debug, logError, logWarning } from '@/lib/debug'
import { supabase as singletonSupabase } from '@/lib/supabase'
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
import { Switch } from '@/components/ui/switch'
import { IconStyleSelector } from '@/components/ui/icon-style-selector'
import { CustomColorPicker } from '@/components/ui/custom-color-picker'
import { useThemeStore, type IconStyle, type CustomColors } from '@/stores/useThemeStore'
import { useThemeUpdates } from '@/hooks/useThemeUpdates'
import { colorSchemes, parseCustomColors } from '@/lib/theme-system'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { getIconStyle } from '@/lib/icon-utils'
import {
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
import { createClient } from '@supabase/supabase-js'

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

  // Theme management with proper architecture
  const {
    currentScheme,
    seasonalEnabled,
    iconStyle,
    previewScheme,
    activeTheme,
    currentSeason,
    customColors: storeCustomColors,
    previewColorScheme,
    previewCustomColors
  } = useThemeStore()

  const { updateColorScheme, toggleSeasonalThemes, updateIconStyle, isUpdating: themeLoading } = useThemeUpdates()

  // Local custom colors state
  const [customColors, setCustomColors] = useState<CustomColors | null>(null)

  // --- FIX: Move bioDraft and bioSaving hooks to the top, before any returns ---
  const [bioDraft, setBioDraft] = useState('')
  const [bioSaving, setBioSaving] = useState(false)

  // Sync bioDraft with twitchUser.custom_bio when twitchUser changes
  useEffect(() => {
    setBioDraft(twitchUser?.custom_bio || '')
  }, [twitchUser?.custom_bio])

  // Debounced save effect
  useEffect(() => {
    if (!twitchUser) return
    const handler = setTimeout(async () => {
      if (bioDraft !== twitchUser.custom_bio) {
        setBioSaving(true)
        const { error } = await supabase
          .from('twitch_users')
          .update({ custom_bio: bioDraft })
          .eq('id', twitchUser.id)
        setBioSaving(false)
        if (error) {
          toast.error('Failed to update bio', { description: error.message })
        } else {
          setTwitchUser({ ...twitchUser, custom_bio: bioDraft })
          toast.success('Bio updated!')
        }
      }
    }, 600)
    return () => clearTimeout(handler)
  }, [bioDraft, twitchUser?.id])

  // Initialize custom colors from user data
  useEffect(() => {
    if (authUser?.theme_scheme) {
      const parsedColors = parseCustomColors(authUser.theme_scheme)
      if (parsedColors) {
        setCustomColors(parsedColors)
      }
    }
  }, [authUser?.theme_scheme])

  // Sync theme store with user data
  useEffect(() => {
    if (authUser) {
      const store = useThemeStore.getState()
      store.applyTheme(
        authUser.theme_scheme || 'cyber-default',
        authUser.seasonal_themes ?? false
      )
      // Also sync icon style
      store.setIconStyle(authUser.icon_style || 'colored')
    }
  }, [authUser?.theme_scheme, authUser?.seasonal_themes, authUser?.icon_style])

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

  // Sync local twitchUser state with auth store user when it changes
  useEffect(() => {
    if (authUser && twitchUser && authUser.twitch_id === twitchUser.twitch_id) {
      // Update local state with auth store changes (particularly theme fields)
      setTwitchUser({
        ...twitchUser,
        theme_scheme: authUser.theme_scheme,
        seasonal_themes: authUser.seasonal_themes,
        icon_style: authUser.icon_style
      })
    }
  }, [authUser?.theme_scheme, authUser?.seasonal_themes, authUser?.icon_style])

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
          logError('User not found in database', null, { component: 'Dashboard' })
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
        logError('Error loading data', error, { component: 'Dashboard' })
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

  // Note: Dashboard realtime removed due to WebSocket connection issues
  // The main realtime functionality (dashboard -> profile) still works via the profile page subscription
  // Multi-tab sync is an edge case that doesn't justify the connection complexity

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
      logError('Error fetching analytics', error, { component: 'Dashboard' })
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
        logError('Error fetching quick stats', error, { component: 'Dashboard' })
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

  const handleBioUpdate = async (newBio: string) => {
    if (twitchUser) {
      setTwitchUser({ ...twitchUser, custom_bio: newBio })
      const { error } = await supabase
        .from('twitch_users')
        .update({ custom_bio: newBio })
        .eq('id', twitchUser.id)
      if (error) {
        toast.error('Failed to update bio', { description: error.message })
      } else {
        toast.success('Bio updated!')
      }
    }
  }

  const handleIconStyleUpdate = async (style: IconStyle) => {
    updateIconStyle(style)
  }

  const handleThemeSchemeUpdate = async (schemeKey: string, colors?: CustomColors) => {
    updateColorScheme(schemeKey, colors)
  }

  const handleCustomColorsChange = (colors: CustomColors) => {
    setCustomColors(colors)
    // Auto-save custom colors when they change
    handleThemeSchemeUpdate('custom', colors)
  }

  const handleCustomColorsPreview = (colors: CustomColors) => {
    previewCustomColors(colors)
  }

  const handleSeasonalThemesToggle = async (enabled: boolean) => {
    toggleSeasonalThemes(enabled)
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
                  <CopyIcon className="w-4 h-4" />
                </CopyButton>

                <ViewButton
                  onClick={handleOpenProfile}
                  size="icon"
                  tooltip="Open profile in new tab"
                >
                  <ArrowUpRight className="w-4 h-4" />
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

      {/* Tab Content - Two Column Layout for all tabs */}
      <div className="min-h-[500px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'links' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
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
                      iconStyle={iconStyle}
                      activeTheme={activeTheme}
                      mainTwitchUsername={twitchUser.username}
                      mainTwitchId={twitchUser.id}
                    />
                  </CardContent>
                </Card>
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
                          value={bioDraft}
                          onChange={e => setBioDraft(e.target.value)}
                          placeholder="Tell visitors about yourself..."
                          className="w-full p-3 bg-glass/20 border border-white/10 rounded-lg backdrop-blur-xl 
                                focus:bg-glass/30 focus:border-white/20 transition-all duration-300
                                text-foreground placeholder:text-foreground/50 resize-none"
                          rows={4}
                          maxLength={200}
                        />
                        {bioSaving && (
                          <p className="text-xs text-muted-foreground mt-1">Saving...</p>
                        )}
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
                        Customize colors, themes, and the visual style of your profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Current Theme Preview */}
                      <div className="p-4 bg-glass/10 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">Current Theme</p>
                            <p className="text-xs text-muted-foreground">{activeTheme?.displayName || 'Default'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: activeTheme?.colors.primary || '#ec4899' }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: activeTheme?.colors.secondary || '#9147ff' }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: activeTheme?.colors.accent || '#67e8f9' }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{activeTheme?.description || 'Default cyber theme'}</p>
                      </div>

                      {/* Color Scheme Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Color Scheme
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(colorSchemes).map(([schemeKey, scheme]) => {
                            const isActive = currentScheme === schemeKey
                            const isCurrentlyActive = activeTheme?.name === schemeKey

                            return (
                              <button
                                key={schemeKey}
                                onClick={() => handleThemeSchemeUpdate(schemeKey)}
                                onMouseEnter={() => previewColorScheme(schemeKey)}
                                onMouseLeave={() => previewColorScheme(null)}
                                disabled={themeLoading}
                                className={`p-3 rounded-lg border transition-all duration-200 text-left group hover:scale-[1.02] ${isCurrentlyActive
                                  ? 'border-white/30 bg-glass/30 shadow-lg'
                                  : 'border-white/10 bg-glass/10 hover:border-white/20 hover:bg-glass/20'
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-medium text-foreground">
                                    {scheme.displayName}
                                  </p>
                                  <div className="flex gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full border border-white/20"
                                      style={{ backgroundColor: scheme.colors.primary }}
                                    />
                                    <div
                                      className="w-3 h-3 rounded-full border border-white/20"
                                      style={{ backgroundColor: scheme.colors.secondary }}
                                    />
                                    <div
                                      className="w-3 h-3 rounded-full border border-white/20"
                                      style={{ backgroundColor: scheme.colors.accent }}
                                    />
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                  {scheme.description}
                                </p>
                                {isActive && (
                                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    Active
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Custom Color Picker - Show when custom theme is selected */}
                      {currentScheme === 'custom' && (
                        <div className="space-y-3">
                          <CustomColorPicker
                            initialColors={customColors || {
                              primary: '#ec4899',
                              secondary: '#9146ff',
                              accent: '#8df5ff'
                            }}
                            onColorsChange={handleCustomColorsChange}
                            onPreview={handleCustomColorsPreview}
                          />
                        </div>
                      )}

                      {/* Icon Style Setting */}
                      <div className="p-4 bg-glass/20 rounded-lg border border-white/10">
                        <IconStyleSelector
                          value={iconStyle}
                          onChange={handleIconStyleUpdate}
                          disabled={themeLoading}
                        />
                      </div>

                      {/* Icon Preview */}
                      <div className="p-4 bg-glass/10 rounded-lg border border-white/5">
                        <p className="text-sm font-medium text-foreground mb-3">Social Icon Preview</p>
                        <div className="flex items-center gap-3">
                          {['youtube', 'twitch', 'instagram', 'twitter'].map((platform) => {
                            const Icon = getPlatformIcon(platform)

                            let iconStyles = {}
                            if (iconStyle === 'colored') {
                              iconStyles = { color: getPlatformColor(platform) }
                            } else if (iconStyle === 'theme' && activeTheme) {
                              iconStyles = { color: activeTheme.colors.primary }
                            }
                            // monochrome uses default white/gray from CSS

                            return (
                              <div key={platform} className="flex items-center gap-2 p-2 bg-glass/20 rounded-lg">
                                <Icon
                                  className="w-5 h-5"
                                  style={iconStyles}
                                />
                                <span className="text-xs capitalize">{platform}</span>
                              </div>
                            )
                          })}
                        </div>
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

          {/* Right Column - Sticky Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card variant="glass-interactive">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-lg">Live Preview</CardTitle>
                      <CardDescription>
                        See how your profile looks to visitors
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ThemeWrapper
                      userTheme={twitchUser.theme_scheme}
                      seasonalThemes={twitchUser.seasonal_themes}
                      iconStyle={iconStyle}
                    >
                      {/* Compact responsive preview with proper theming */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-xs">
                          <div
                            className="backdrop-blur-xl rounded-xl overflow-hidden relative border border-white/20"
                            style={{
                              background: `
                                linear-gradient(135deg, 
                                  rgba(255, 255, 255, 0.1) 0%, 
                                  rgba(255, 255, 255, 0.05) 50%,
                                  rgba(0, 0, 0, 0.2) 100%
                                )
                              `,
                              boxShadow: `
                                0 8px 32px rgba(0, 0, 0, 0.3),
                                0 0 0 1px rgba(255, 255, 255, 0.1),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1)
                              `
                            }}
                          >
                            {/* Background with elegant blending */}
                            {twitchUser.background_media_url && (
                              <div className="absolute inset-0 rounded-xl overflow-hidden">
                                {/* Background Image/Video */}
                                <div className="absolute inset-0 scale-110">
                                  {twitchUser.background_media_type === 'video' ? (
                                    <video
                                      autoPlay
                                      muted
                                      loop
                                      playsInline
                                      className="w-full h-full object-cover opacity-40"
                                    >
                                      <source src={twitchUser.background_media_url} type="video/mp4" />
                                    </video>
                                  ) : (
                                    <Image
                                      src={twitchUser.background_media_url}
                                      alt="Background"
                                      fill
                                      sizes="100vw"
                                      className="object-cover opacity-40"
                                    />
                                  )}
                                </div>

                                {/* Elegant gradient overlay */}
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    background: `
                                      radial-gradient(circle at center, 
                                        rgba(0, 0, 0, 0.2) 0%, 
                                        rgba(0, 0, 0, 0.5) 70%, 
                                        rgba(0, 0, 0, 0.8) 100%
                                      ),
                                      linear-gradient(135deg, 
                                        rgba(168, 85, 247, 0.1) 0%, 
                                        rgba(34, 211, 238, 0.05) 100%
                                      )
                                    `
                                  }}
                                />
                              </div>
                            )}

                            {/* Default elegant background when no custom background */}
                            {!twitchUser.background_media_url && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: `
                                    radial-gradient(circle at 30% 20%, 
                                      rgba(168, 85, 247, 0.15) 0%, 
                                      transparent 50%
                                    ),
                                    radial-gradient(circle at 70% 80%, 
                                      rgba(34, 211, 238, 0.1) 0%, 
                                      transparent 50%
                                    ),
                                    linear-gradient(135deg, 
                                      rgba(15, 23, 42, 0.8) 0%, 
                                      rgba(30, 41, 59, 0.9) 100%
                                    )
                                  `
                                }}
                              />
                            )}

                            {/* Subtle overlay for content readability */}
                            <div
                              className="absolute inset-0"
                              style={{
                                background: twitchUser.background_media_url
                                  ? `
                                    rgba(0, 0, 0, 0.3),
                                    linear-gradient(135deg, 
                                      rgba(255, 255, 255, 0.05) 0%, 
                                      rgba(0, 0, 0, 0.1) 100%
                                    )
                                  `
                                  : 'transparent'
                              }}
                            />

                            {/* Content */}
                            <div className="relative space-y-4 p-4">
                              {/* Profile Header */}
                              <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                  <div
                                    className="absolute inset-0 rounded-full animate-pulse blur-xl opacity-50"
                                    style={{
                                      background: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
                                    }}
                                  />
                                  <Image
                                    src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                                    alt={twitchUser.display_name || twitchUser.username}
                                    width={80}
                                    height={80}
                                    className="rounded-full relative"
                                    style={{
                                      borderColor: `var(--theme-border-primary)`,
                                      borderWidth: '2px',
                                      borderStyle: 'solid',
                                      boxShadow: `0 0 20px rgba(var(--theme-primary), 0.4), 0 0 40px rgba(var(--theme-accent), 0.2)`
                                    }}
                                    sizes="80px"
                                  />
                                </div>
                                <h1
                                  className="text-lg font-bold mb-1 bg-clip-text text-transparent"
                                  style={{
                                    backgroundImage: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
                                  }}
                                >
                                  {twitchUser.display_name || twitchUser.username}
                                </h1>
                                <p className="text-sm text-muted-foreground mb-4">@{twitchUser.username}</p>
                                {twitchUser.custom_bio && (
                                  <p className="text-xs text-muted-foreground text-center mb-4 max-w-xs leading-relaxed whitespace-pre-wrap">
                                    {twitchUser.custom_bio}
                                  </p>
                                )}
                              </div>

                              {/* Social Links */}
                              <div className="space-y-3">
                                {links.length > 0 ? (
                                  links.slice(0, 5).map((link) => {
                                    const Icon = getPlatformIcon(link.platform)
                                    return (
                                      <div
                                        key={link.id}
                                        className="block w-full p-3 backdrop-blur-xl transition-all duration-300 text-center group relative overflow-hidden rounded-lg"
                                        style={{
                                          backgroundColor: `var(--theme-surface-glass)`,
                                          borderColor: `var(--theme-border-primary)`,
                                          borderWidth: '1px',
                                          borderStyle: 'solid',
                                          boxShadow: `
                                          0 6px 20px rgba(var(--theme-primary), 0.25), 
                                          0 3px 10px rgba(var(--theme-accent), 0.15),
                                          inset 0 1px 0 rgba(var(--theme-accent), 0.1)
                                        `
                                        }}
                                      >
                                        <div
                                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                          style={{
                                            background: `linear-gradient(45deg, rgba(var(--theme-primary), 0.15), rgba(var(--theme-accent), 0.15))`
                                          }}
                                        />
                                        <div className="relative flex items-center justify-center gap-2">
                                          <Icon
                                            className="w-4 h-4"
                                            style={getIconStyle(link.platform, iconStyle, activeTheme)}
                                          />
                                          <span
                                            className="font-medium text-sm"
                                            style={{ color: `rgb(var(--theme-foreground))` }}
                                          >
                                            {link.title || link.platform}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="text-center py-6 text-xs text-muted-foreground">
                                    <div
                                      className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                                      style={{
                                        backgroundColor: `rgba(var(--theme-surface), 0.2)`
                                      }}
                                    >
                                      <LinkIcon className="w-4 h-4 text-foreground/40" />
                                    </div>
                                    <p className="text-xs">No social links added yet</p>
                                    <p className="text-xs mt-1 opacity-70">Add your first link to get started</p>
                                  </div>
                                )}
                                {links.length > 5 && (
                                  <div
                                    className="text-center py-2 text-xs text-muted-foreground rounded-lg"
                                    style={{
                                      backgroundColor: `rgba(var(--theme-surface), 0.2)`,
                                      borderColor: `var(--theme-border-secondary)`,
                                      borderWidth: '1px',
                                      borderStyle: 'solid'
                                    }}
                                  >
                                    +{links.length - 5} more {links.length - 5 === 1 ? 'link' : 'links'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="text-center text-xs pt-3 border-t border-white/5">
                            <p
                              className="opacity-60"
                              style={{ color: `rgb(var(--theme-foreground))` }}
                            >
                              Powered by{" "}
                              <span className="font-semibold">
                                <span
                                  style={{ color: `rgb(var(--theme-primary))` }}
                                >
                                  Zombie
                                </span>
                                <span
                                  style={{ color: `rgb(var(--theme-foreground))` }}
                                  className="opacity-80"
                                >
                                  .Digital
                                </span>
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Background Upload - Only show on links tab */}
                      {activeTab === 'links' && (
                        <div
                          className="space-y-3 p-4 rounded-xl backdrop-blur-xl border"
                          style={{
                            background: `linear-gradient(135deg, 
                              rgba(var(--theme-primary), 0.1) 0%, 
                              rgba(var(--theme-secondary), 0.05) 50%, 
                              rgba(var(--theme-accent), 0.1) 100%
                            ), 
                            radial-gradient(circle at 20% 80%, rgba(var(--theme-accent), 0.2), transparent 70%),
                            radial-gradient(circle at 80% 20%, rgba(var(--theme-primary), 0.15), transparent 70%),
                            radial-gradient(circle at 40% 40%, rgba(var(--theme-secondary), 0.1), transparent 70%)`,
                            borderColor: `var(--theme-border-primary)`,
                            boxShadow: `
                              0 8px 32px rgba(var(--theme-primary), 0.15),
                              0 4px 16px rgba(var(--theme-accent), 0.1),
                              inset 0 1px 0 rgba(var(--theme-accent), 0.2)
                            `
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p
                              className="text-sm font-medium"
                              style={{ color: `rgb(var(--theme-foreground))` }}
                            >
                              Background Media
                            </p>
                            {twitchUser.background_media_url && (
                              <button
                                onClick={() => handleBackgroundUpdate({ url: null, type: null })}
                                className="text-xs hover:opacity-80 transition-opacity px-2 py-1 rounded-md"
                                style={{
                                  color: `rgb(var(--theme-accent))`,
                                  backgroundColor: `rgba(var(--theme-accent), 0.1)`
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <BackgroundUpload
                            userId={twitchUser.id}
                            onSuccess={(url, type) => {
                              handleBackgroundUpdate({ url, type })
                            }}
                            showPreview={false}
                          />
                        </div>
                      )}
                    </ThemeWrapper>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}