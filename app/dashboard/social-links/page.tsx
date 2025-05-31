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
            className="lg:col-span-2 p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 
                       hover:bg-glass/40 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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

              <Button
                variant="outline"
                className="gap-2 bg-glass/30 border-white/10 hover:bg-glass/50 hover:border-white/20 
                          backdrop-blur-xl transition-all duration-300"
                onClick={handleOpenProfile}
              >
                <Eye className="w-4 h-4" />
                View Profile
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <CopyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60" />
                  <Input
                    value={profileUrl}
                    readOnly
                    className="pl-10 pr-24 bg-glass/20 border-white/10 backdrop-blur-xl 
                              focus:bg-glass/30 focus:border-white/20 transition-all duration-300"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopyUrl}
                      className="h-8 w-8 hover:bg-glass/30 transition-all duration-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <QRDialog username={twitchUser.username} />
                  </div>
                </div>

                <Button
                  className="ethereal-button gap-2"
                  onClick={handleOpenProfile}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Profile
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 
                       hover:bg-glass/40 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4 text-foreground">Quick Stats</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg bg-glass/20 border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-pink/20 to-purple-500/20">
                    <LinkIcon className="w-4 h-4 text-cyber-pink" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Social Links</p>
                    <p className="text-lg font-semibold text-foreground">{links.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-glass/20 border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-blue-500/20">
                    <Eye className="w-4 h-4 text-cyber-cyan" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Profile Views</p>
                    <p className="text-lg font-semibold text-foreground">{profileViews !== null ? profileViews : "--"}</p>
                  </div>
                </div>
              </div>
            </div>
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
            Social Links
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
            Profile Appearance
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
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">Manage Your Links</h2>
                <p className="text-foreground/70 max-w-2xl mx-auto">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">Profile Background</h2>
                <p className="text-foreground/70 max-w-2xl mx-auto">
                  Customize your profile's visual appearance with background images and themes.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Background Settings</h3>
                    <BackgroundUpload
                      userId={twitchUser.id}
                      showPreview={true}
                      onSuccess={(url, type) => {
                        updateBackground({ url, type })
                      }}
                    />
                  </div>

                  <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Profile Settings</h3>
                    <p className="text-foreground/70 mb-6">
                      Additional profile customization options will be available soon.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-xl bg-glass/20 border border-white/5 flex items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">Custom Theme</h4>
                          <p className="text-sm text-foreground/60">Set colors for your profile page</p>
                        </div>
                        <div className="text-foreground/50">Coming soon</div>
                      </div>

                      <div className="p-4 rounded-xl bg-glass/20 border border-white/5 flex items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">Link Animations</h4>
                          <p className="text-sm text-foreground/60">Add animations to your links</p>
                        </div>
                        <div className="text-foreground/50">Coming soon</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Live Preview</h3>

                  <div className="relative">
                    <div className="aspect-[9/16] max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-white/10 bg-glass/20 backdrop-blur-xl">
                      <div
                        className="w-full h-full relative"
                        style={{
                          backgroundImage: twitchUser.background_media_url
                            ? `url(${twitchUser.background_media_url})`
                            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(145, 70, 255, 0.3), rgba(103, 232, 249, 0.3))',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                          <div className="mb-4">
                            <Image
                              src={twitchUser.profile_image_url || '/placeholder-avatar.png'}
                              alt="Profile"
                              width={60}
                              height={60}
                              className="rounded-full mx-auto border-2 border-white/20"
                            />
                          </div>

                          <h4 className="text-white font-semibold mb-1">
                            {twitchUser.display_name || twitchUser.username}
                          </h4>
                          <p className="text-white/80 text-sm mb-4">@{twitchUser.username}</p>

                          <div className="space-y-2">
                            {links.slice(0, 3).map((link, index) => (
                              <div key={link.id} className="block w-full p-2 bg-white/10 backdrop-blur-sm rounded-xl text-center">
                                <span className="text-white text-xs font-medium">{link.title}</span>
                              </div>
                            ))}
                            {links.length === 0 && (
                              <div className="block w-full p-2 bg-glass/50 rounded-xl text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-white/50 flex-shrink-0" />
                                  <span className="text-xs text-white/70">Add your first link</span>
                                </div>
                              </div>
                            )}
                            {links.length > 3 && (
                              <div className="text-center">
                                <span className="text-xs text-white/70">+{links.length - 3} more links</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/60 text-center mt-3">
                      Live preview of your public profile
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground">Profile Analytics</h2>
                <p className="text-foreground/70 max-w-2xl mx-auto">
                  Track engagement with your profile and understand your audience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 hover:bg-glass/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-blue-500/20">
                      <Eye className="w-5 h-5 text-cyber-cyan" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Total Profile Views</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-foreground">
                      {analyticsLoading ? "..." : (analyticsData?.totalViews || profileViews || "0")}
                    </div>
                    <div className="text-sm text-cyber-cyan flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      All time
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 hover:bg-glass/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <BarChart4 className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Views</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-foreground">
                      {analyticsLoading ? "..." : (analyticsData?.recentViews || "0")}
                    </div>
                    <div className={`text-sm flex items-center ${analyticsData?.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {analyticsData?.growthPercentage ? `${analyticsData.growthPercentage > 0 ? '+' : ''}${analyticsData.growthPercentage}%` : 'Last 7 days'}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 hover:bg-glass/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-pink/20 to-purple-500/20">
                      <LinkIcon className="w-5 h-5 text-cyber-pink" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Social Links</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-foreground">{links.length}</div>
                    <div className="text-sm text-foreground/60 flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Active links
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Views Over Time</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-glass/30 border-white/10 hover:bg-glass/50 hover:border-white/20 backdrop-blur-xl"
                      onClick={() => {
                        setAnalyticsData(null)
                        fetchAnalytics()
                        toast.info("Refreshing analytics...", {
                          description: "Your analytics data is being updated.",
                        })
                      }}
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="h-[350px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 rounded-full blur-lg"></div>
                    <div className="relative flex items-center justify-center w-full h-full rounded-full bg-glass/20 backdrop-blur-xl border border-white/10">
                      <BarChart4 className="w-8 h-8 text-cyber-pink" />
                    </div>
                  </div>

                  <h3 className="text-xl font-medium mb-2 text-foreground">Detailed Analytics Coming Soon</h3>

                  <p className="text-foreground/70 max-w-md mb-2">
                    We're working on detailed charts to show your profile views over time and other engagement metrics.
                  </p>

                  <p className="text-sm text-foreground/60">
                    Your views are being tracked now and will be displayed in charts soon!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Top Traffic Sources</h3>
                  <p className="text-foreground/60 text-sm mb-4">Where your profile visitors come from</p>
                  <div className="h-[200px] flex flex-col items-center justify-center text-center">
                    <p className="text-foreground/50">Coming soon</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Link Click Analytics</h3>
                  <p className="text-foreground/60 text-sm mb-4">Which links get the most engagement</p>
                  <div className="h-[200px] flex flex-col items-center justify-center text-center">
                    <p className="text-foreground/50">Coming soon</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 