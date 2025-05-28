'use client'

import { useEffect, useCallback } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SkeletonStats } from "@/components/ui/skeleton";
import { AlertCircle, Hash, Gamepad2, Type, Code, RefreshCw } from "lucide-react";
import { UsersIcon, StarIcon, PointsIcon, ShieldIcon, SparklesIcon } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Verified, Crown } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardStore } from "@/stores/useDashboardStore";

interface TwitchStats {
  followers: number;
  isAffiliate: boolean;
  subscribers?: number;
  totalViewCount?: number;
  channelPoints?: {
    enabled: boolean;
    activeRewards: number;
  };
  lastGame: {
    id: string;
    name: string;
    boxArtUrl: string;
  } | null;
  isLive: boolean;
  title?: string;
  description?: string;
  tags?: string[];
  moderators?: number;
  vips?: number;
  createdAt?: string;
  broadcasterType?: string;
}

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 60,
    damping: 12,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    // Add a small delay to make the animation more noticeable
    const timer = setTimeout(() => {
      spring.set(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, spring]);

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {display}
    </motion.span>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return <Badge variant="destructive" className="ml-2">Admin</Badge>;
    case "owner":
      return <Badge variant="destructive" className="ml-2">Owner</Badge>;
    case "moderator":
      return <Badge variant="default" className="ml-2 bg-blue-500">Moderator</Badge>;
    default:
      return null;
  }
}

function BroadcasterBadge({ type }: { type: string }) {
  if (type === "partner") {
    return (
      <Badge variant="secondary" className="ml-2 bg-purple-500/10 text-purple-500 flex items-center gap-1">
        <Verified className="w-3 h-3" />
        Partner
      </Badge>
    );
  }
  if (type === "affiliate") {
    return (
      <Badge variant="secondary" className="ml-2 bg-pink-500/10 text-pink-500 flex items-center gap-1">
        <Crown className="w-3 h-3" />
        Affiliate
      </Badge>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user, isLoading, isInitialized } = useAuthStore();
  const {
    stats,
    loading,
    error,
    refreshing,
    setStats,
    setLoading,
    setError,
    setRefreshing
  } = useDashboardStore();

  const fetchStats = useCallback(async () => {
    if (!user?.twitch_id) return;

    try {
      // First, update the broadcaster type if it's not set
      if (!user.broadcaster_type || user.broadcaster_type === 'none') {
        const updateResponse = await fetch('/api/twitch/update-broadcaster-type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.twitch_id }),
        });

        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
        } else {
          console.warn('Failed to update broadcaster type:', updateResponse.status);
        }
      }

      // Then fetch the stats
      const response = await fetch(`/api/twitch/stats?userId=${user.twitch_id}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats API error:', response.status, errorText);

        if (response.status === 401) {
          throw new Error('Authentication failed - please sign out and sign back in');
        } else {
          throw new Error(`Failed to fetch stats: ${response.status} - ${errorText}`);
        }
      }

      const twitchStats = await response.json();

      if (twitchStats && typeof twitchStats === 'object') {
        setStats(twitchStats);
        setError(null);
      } else {
        throw new Error('Invalid stats data received');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStats(null);
    }
  }, [user?.twitch_id, user?.broadcaster_type, setStats, setError]);

  useEffect(() => {
    async function updateBroadcasterTypeAndFetchStats() {
      if (!user?.twitch_id) return;
      setLoading(true);
      setError(null);

      await fetchStats();
      setLoading(false);
    }

    if (isInitialized && user) {
      updateBroadcasterTypeAndFetchStats();
    }
  }, [user?.twitch_id, isInitialized, fetchStats, setLoading, setError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // Show loading while auth is initializing or stats are loading
  if (!isInitialized || isLoading || loading || !user) {
    return <LoadingSpinner />
  }

  // Show error message if authentication failed
  if (error && error.includes('Authentication failed')) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-red-500/20">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Authentication Error</p>
            <p className="text-sm text-red-400 mt-1">
              Your session has expired. Please sign out and sign back in to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no stats could be loaded
  if (!stats) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-yellow-500/20">
        <div className="flex items-center gap-2 text-yellow-500">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Unable to load Twitch stats</p>
            <p className="text-sm text-yellow-400 mt-1">
              {error || 'Please try refreshing the page.'}
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="mt-3 gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Try Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-300">Welcome back! Here's your channel overview.</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{
                  duration: 1,
                  repeat: refreshing ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              {refreshing ? 'Refreshing...' : 'Refresh Stats'}
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <SkeletonStats count={8} />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Stats</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </motion.div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Followers */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <UsersIcon className="w-8 h-8 text-cyber-pink" />
                  </motion.div>
                  <Badge variant="secondary" className="bg-cyber-pink/20 text-cyber-pink border-cyber-pink/30">
                    Followers
                  </Badge>
                </div>
                <div className="space-y-2">
                  <AnimatedCounter value={stats.followers} className="text-3xl font-bold text-white" />
                  <p className="text-gray-400 text-sm">Total Followers</p>
                  {stats.followers === 0 && (
                    <p className="text-gray-500 text-xs">Start streaming to gain followers!</p>
                  )}
                </div>
              </motion.div>

              {/* Subscribers */}
              {stats.subscribers !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <StarIcon className="w-8 h-8 text-cyber-cyan" />
                    </motion.div>
                    <Badge variant="secondary" className="bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30">
                      Subscribers
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter value={stats.subscribers} className="text-3xl font-bold text-white" />
                    <p className="text-gray-400 text-sm">Active Subscribers</p>
                    {stats.subscribers === 0 && (
                      <p className="text-gray-500 text-xs">Grow your community to gain subscribers!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Total Views */}
              {stats.totalViewCount !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                      <Hash className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    <Badge variant="secondary" className="bg-purple-400/20 text-purple-400 border-purple-400/30">
                      Views
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter value={stats.totalViewCount} className="text-3xl font-bold text-white" />
                    <p className="text-gray-400 text-sm">Total Channel Views</p>
                    {stats.totalViewCount === 0 && (
                      <p className="text-gray-500 text-xs">Start streaming to gain views!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Broadcaster Status */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.4,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    {stats.isAffiliate ? (
                      <Crown className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <Verified className="w-8 h-8 text-gray-400" />
                    )}
                  </motion.div>
                  <Badge
                    variant="secondary"
                    className={`${stats.broadcasterType === 'partner'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : stats.broadcasterType === 'affiliate'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                  >
                    {stats.broadcasterType === 'partner' ? 'Partner' :
                      stats.broadcasterType === 'affiliate' ? 'Affiliate' : 'Creator'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">
                    {stats.broadcasterType === 'partner' ? 'Partner' :
                      stats.broadcasterType === 'affiliate' ? 'Affiliate' : 'Creator'}
                  </p>
                  <p className="text-gray-400 text-sm">Broadcaster Status</p>
                </div>
              </motion.div>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Moderators */}
              {stats.moderators !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <ShieldIcon className="w-8 h-8 text-green-400" />
                    </motion.div>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-400 border-green-400/30">
                      Moderators
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter value={stats.moderators} className="text-3xl font-bold text-white" />
                    <p className="text-gray-400 text-sm">Active Moderators</p>
                    {stats.moderators === 0 && (
                      <p className="text-gray-500 text-xs">Assign trusted viewers as moderators!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIPs */}
              {stats.vips !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    >
                      <SparklesIcon className="w-8 h-8 text-amber-400" />
                    </motion.div>
                    <Badge variant="secondary" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                      VIPs
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter value={stats.vips} className="text-3xl font-bold text-white" />
                    <p className="text-gray-400 text-sm">VIP Members</p>
                    {stats.vips === 0 && (
                      <p className="text-gray-500 text-xs">Recognize special community members as VIPs!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Channel Points */}
              {stats.channelPoints && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.7,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      <PointsIcon className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <Badge variant="secondary" className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                      Rewards
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter value={stats.channelPoints.activeRewards} className="text-3xl font-bold text-white" />
                    <p className="text-gray-400 text-sm">Active Rewards</p>
                    {stats.channelPoints.activeRewards === 0 && stats.isAffiliate && (
                      <p className="text-gray-500 text-xs">Create channel point rewards to engage viewers!</p>
                    )}
                    {!stats.isAffiliate && (
                      <p className="text-gray-500 text-xs">Become an affiliate to unlock channel points!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Live Status */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.8,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6 hover:shadow-cyber-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.isLive ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${stats.isLive ? 'bg-white animate-pulse' : 'bg-gray-300'
                      }`} />
                  </motion.div>
                  <Badge
                    variant="secondary"
                    className={`${stats.isLive
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                  >
                    {stats.isLive ? 'LIVE' : 'Offline'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">
                    {stats.isLive ? 'LIVE' : 'Offline'}
                  </p>
                  <p className="text-gray-400 text-sm">Stream Status</p>
                </div>
              </motion.div>
            </div>

            {/* Current Game/Category */}
            {stats.lastGame && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6"
              >
                <div className="flex items-center gap-6">
                  {/* Game Box Art */}
                  <div className="relative w-20 h-28 flex-shrink-0">
                    {stats.lastGame.boxArtUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={stats.lastGame.boxArtUrl.replace('{width}', '144').replace('{height}', '192')}
                          alt={`${stats.lastGame.name} box art`}
                          fill
                          className="object-cover rounded-lg border border-white/10"
                          onError={(e) => {
                            // Hide the image and show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="fallback-icon absolute inset-0 bg-glass/30 rounded-lg border border-white/10 items-center justify-center hidden"
                        >
                          <Gamepad2 className="w-8 h-8 text-cyber-pink/60" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-glass/30 rounded-lg border border-white/10 flex items-center justify-center">
                        <Gamepad2 className="w-8 h-8 text-cyber-pink/60" />
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="w-6 h-6 text-cyber-pink" />
                      <Badge variant="secondary" className="bg-cyber-pink/20 text-cyber-pink border-cyber-pink/30">
                        {stats.isLive ? 'Currently Playing' : 'Last Played'}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {stats.lastGame.name}
                    </h3>
                    <p className="text-gray-400 text-sm">Game Category</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stream Title */}
            {stats.title && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6"
              >
                <div className="flex items-center gap-4">
                  <Type className="w-8 h-8 text-cyber-cyan" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {stats.isLive ? 'Stream Title' : 'Last Stream Title'}
                    </h3>
                    <p className="text-gray-300">{stats.title}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Debug Information (Owner Only) */}
            {user?.site_role === 'owner' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-glass/30 backdrop-blur-xl rounded-xl border border-white/5 p-4 mt-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-400">Debug Information</h3>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">Owner Only</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500">Broadcaster Type:</p>
                    <p className="text-gray-300">{stats.broadcasterType || 'none'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Is Affiliate:</p>
                    <p className="text-gray-300">{stats.isAffiliate ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated:</p>
                    <p className="text-gray-300">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">User ID:</p>
                    <p className="text-gray-300">{user?.twitch_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Channel Points Enabled:</p>
                    <p className="text-gray-300">{stats.channelPoints?.enabled ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Live Status:</p>
                    <p className="text-gray-300">{stats.isLive ? 'Live' : 'Offline'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
} 