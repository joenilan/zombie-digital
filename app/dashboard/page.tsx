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
import { handleAuthError } from '@/utils/auth-error-handler'
import { Card, CardContent, StatCard } from "@/components/ui/card"
import { DashboardLayout } from "@/components/animations/AnimatedLayout";
import { StatsCard } from "@/components/animations/AnimatedCard";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  slideInLeft,
  slideInRight,
  cardAnimations,
  spinAnimation
} from "@/lib/animations";

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
    const timer = setTimeout(() => {
      spring.set(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, spring]);

  return (
    <motion.span
      className={className}
      variants={fadeInUp}
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

        // Use auth error handler for authentication errors
        const authErrorHandled = await handleAuthError({
          status: response.status,
          message: errorText
        }, 'Dashboard stats fetch');

        if (authErrorHandled) {
          return; // Auth error handler will handle the redirect
        }

        throw new Error(`Failed to fetch stats: ${response.status} - ${errorText}`);
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
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    )
  }

  // Show error message if authentication failed
  if (error && error.includes('Authentication failed')) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <motion.div variants={fadeInUp}>
            <Card variant="error">
              <CardContent>
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={20} />
                  <div>
                    <p className="font-medium">Authentication Error</p>
                    <p className="text-sm text-red-400 mt-1">
                      Your session has expired. Please sign out and sign back in to continue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no stats could be loaded
  if (!stats) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <motion.div variants={fadeInUp}>
            <Card variant="warning">
              <CardContent>
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
                      <motion.div variants={refreshing ? spinAnimation : undefined} animate={refreshing ? "animate" : undefined}>
                        <RefreshCw className="w-4 h-4" />
                      </motion.div>
                      {refreshing ? 'Refreshing...' : 'Try Again'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-gray-300">Welcome back! Here's your channel overview.</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              icon={
                <motion.div variants={refreshing ? spinAnimation : undefined} animate={refreshing ? "animate" : undefined}>
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              }
            >
              {refreshing ? 'Refreshing...' : 'Refresh Stats'}
            </Button>
          </motion.div>

          {loading ? (
            <motion.div variants={staggerItem}>
              <SkeletonStats count={8} />
            </motion.div>
          ) : error ? (
            <motion.div variants={staggerItem}>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Stats</h3>
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          ) : stats ? (
            <>
              {/* Main Stats Grid */}
              <motion.div
                variants={staggerItem}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <motion.div variants={slideInLeft}>
                  <StatsCard className="text-center">
                    <UsersIcon className="w-8 h-8 text-cyber-pink mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-foreground/70 mb-2">Total Followers</h3>
                    <AnimatedCounter value={stats.followers} className="text-2xl font-bold text-foreground" />
                  </StatsCard>
                </motion.div>

                {stats.subscribers !== undefined && (
                  <motion.div variants={fadeInUp}>
                    <StatsCard className="text-center">
                      <StarIcon className="w-8 h-8 text-cyber-cyan mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-foreground/70 mb-2">Active Subscribers</h3>
                      <AnimatedCounter value={stats.subscribers} className="text-2xl font-bold text-foreground" />
                    </StatsCard>
                  </motion.div>
                )}

                {stats.totalViewCount !== undefined && (
                  <motion.div variants={fadeInUp}>
                    <StatsCard className="text-center">
                      <Hash className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-foreground/70 mb-2">Total Views</h3>
                      <AnimatedCounter value={stats.totalViewCount} className="text-2xl font-bold text-foreground" />
                    </StatsCard>
                  </motion.div>
                )}

                <motion.div variants={slideInRight}>
                  <StatsCard className="text-center">
                    <Verified className={`w-8 h-8 text-${stats.isAffiliate ? 'yellow' : 'gray'}-400 mx-auto mb-4`} />
                    <h3 className="text-sm font-medium text-foreground/70 mb-2">Status</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.broadcasterType === 'partner' ? 'Partner' : stats.broadcasterType === 'affiliate' ? 'Affiliate' : 'Creator'}
                    </p>
                  </StatsCard>
                </motion.div>
              </motion.div>

              {/* Secondary Stats Grid */}
              <motion.div
                variants={staggerItem}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {stats.moderators !== undefined && (
                  <motion.div variants={slideInLeft}>
                    <StatsCard className="text-center">
                      <ShieldIcon className="w-8 h-8 text-green-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-foreground/70 mb-2">Active Moderators</h3>
                      <AnimatedCounter value={stats.moderators} className="text-2xl font-bold text-foreground" />
                    </StatsCard>
                  </motion.div>
                )}

                {stats.vips !== undefined && (
                  <motion.div variants={fadeInUp}>
                    <StatsCard className="text-center">
                      <SparklesIcon className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-foreground/70 mb-2">VIP Members</h3>
                      <AnimatedCounter value={stats.vips} className="text-2xl font-bold text-foreground" />
                    </StatsCard>
                  </motion.div>
                )}

                {stats.channelPoints && (
                  <motion.div variants={fadeInUp}>
                    <StatsCard className="text-center">
                      <PointsIcon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-foreground/70 mb-2">Active Rewards</h3>
                      <AnimatedCounter value={stats.channelPoints.activeRewards} className="text-2xl font-bold text-foreground" />
                    </StatsCard>
                  </motion.div>
                )}

                <motion.div variants={slideInRight}>
                  <StatsCard className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 ${stats.isLive ? 'bg-red-500' : 'bg-gray-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${stats.isLive ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
                    </div>
                    <h3 className="text-sm font-medium text-foreground/70 mb-2">Stream Status</h3>
                    <p className="text-2xl font-bold text-foreground">{stats.isLive ? 'LIVE' : 'Offline'}</p>
                  </StatsCard>
                </motion.div>
              </motion.div>

              {/* Additional Info Cards */}
              {stats.lastGame && (
                <motion.div variants={staggerItem}>
                  <StatsCard className="p-6">
                    <div className="flex items-center gap-4">
                      <Gamepad2 className="w-8 h-8 text-cyber-pink" />
                      <div>
                        <h3 className="text-sm font-medium text-foreground/70">
                          {stats.isLive ? 'Currently Playing' : 'Last Played'}
                        </h3>
                        <p className="text-xl font-semibold text-foreground">{stats.lastGame.name}</p>
                      </div>
                    </div>
                  </StatsCard>
                </motion.div>
              )}

              {stats.title && (
                <motion.div variants={staggerItem}>
                  <StatsCard className="p-6">
                    <div className="flex items-center gap-4">
                      <Type className="w-8 h-8 text-cyber-cyan" />
                      <div>
                        <h3 className="text-sm font-medium text-foreground/70">
                          {stats.isLive ? 'Stream Title' : 'Last Stream Title'}
                        </h3>
                        <p className="text-xl font-semibold text-foreground">{stats.title}</p>
                      </div>
                    </div>
                  </StatsCard>
                </motion.div>
              )}

              {/* Debug Information (Owner Only) */}
              {user?.site_role === 'owner' && (
                <motion.div variants={staggerItem}>
                  <div className="bg-glass/30 backdrop-blur-xl rounded-xl border border-white/5 p-4">
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
                  </div>
                </motion.div>
              )}
            </>
          ) : null}
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 