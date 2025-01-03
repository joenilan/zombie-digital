'use client'

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchTwitchStats } from "@/utils/twitch-api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AlertCircle, Hash, Gamepad2, Type, Code } from "lucide-react";
import { UsersIcon, StarIcon, PointsIcon, ShieldIcon, SparklesIcon } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring, useMotionValue, useTransform, animate } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Verified, Crown } from "lucide-react";
import { useTwitchAuth } from "@/providers/twitch-auth-provider";

interface TwitchStats {
  followers: number;
  isAffiliate: boolean;
  subscribers?: number;
  totalViews?: number;
  channelPoints?: {
    enabled: boolean;
    activeRewards: number;
  };
  lastGame?: {
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
}

function AnimatedCounter({ value }: { value: number }) {
  const springValue = useSpring(0, { stiffness: 100, damping: 30 });
  const rounded = useTransform(springValue, (latest) => Math.round(latest).toLocaleString());
  
  useEffect(() => {
    springValue.set(value);
  }, [springValue, value]);

  return <motion.span>{rounded}</motion.span>;
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
  const [session, setSession] = useState<any>(null);
  const [twitchUser, setTwitchUser] = useState<any>(null);
  const [stats, setStats] = useState<TwitchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { providerToken, refreshTwitchToken, isRefreshing } = useTwitchAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to fetch session");
        setLoading(false);
      }
    }
    fetchSession();
  }, [supabase]);

  useEffect(() => {
    async function fetchTwitchUser() {
      if (!session || !providerToken) return;

      try {
        const providerId = session.user.user_metadata.sub;

        // First get user from database
        const { data: twitchUser, error: twitchError } = await supabase
          .from("twitch_users")
          .select("*")
          .eq("twitch_id", providerId)
          .single();

        if (twitchError) {
          setError(twitchError.message);
          setLoading(false);
          return;
        }

        // Wait for any ongoing token refresh to complete
        if (isRefreshing) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        async function fetchWithRetry(token: string, retryCount = 0): Promise<any> {
          try {
            const response = await fetch(`https://api.twitch.tv/helix/users?id=${providerId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
              }
            });

            if (!response.ok) {
              if (response.status === 401) {
                // Wait for any ongoing refresh to complete
                if (isRefreshing) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  return fetchWithRetry(providerToken!, retryCount);
                }
                
                // Trigger token refresh and wait for it to complete
                await refreshTwitchToken();
                // Wait a bit for the new token to be available
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Use the new token from the context
                return fetchWithRetry(providerToken!, retryCount + 1);
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
          } catch (error) {
            if (error instanceof Error && error.message.includes('sign in again')) {
              throw error;
            }
            
            if (retryCount < 3) {
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              return fetchWithRetry(providerToken!, retryCount + 1);
            }
            throw error;
          }
        }

        const twitchData = await fetchWithRetry(providerToken);
        const twitchUserData = twitchData.data?.[0];

        setTwitchUser({
          ...twitchUser,
          broadcaster_type: twitchUserData?.broadcaster_type || twitchUser.broadcaster_type || 'none'
        });
      } catch (err) {
        console.error("Error fetching Twitch user:", err);
        setError("Failed to fetch Twitch user");
      } finally {
        setLoading(false);
      }
    }

    if (session && providerToken) {
      fetchTwitchUser();
    }
  }, [session, providerToken, isRefreshing]);

  useEffect(() => {
    async function fetchStats() {
      if (!twitchUser || !providerToken) return;

      try {
        // Wait for any ongoing token refresh to complete
        if (isRefreshing) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const twitchStats = await fetchTwitchStats(
          twitchUser.twitch_id,
          providerToken,
          twitchUser.broadcaster_type || "none"
        );
        
        if (twitchStats && typeof twitchStats === 'object') {
          setStats(twitchStats);
        } else {
          setError("Invalid stats data received");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [twitchUser, providerToken, isRefreshing]);

  if (!session) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
        <p className="text-foreground/60">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  if (loading || !stats || !twitchUser) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-red-500/20">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
    >
      {/* User Profile Section */}
      <div className="flex items-start gap-6 mb-8">
        <div className="relative shrink-0">
          <Image
            src={twitchUser.profile_image_url}
            alt={twitchUser.display_name}
            width={96}
            height={96}
            className="rounded-full relative z-10"
            priority
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-purple-500/20 z-20" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-3xl font-bold truncate">{twitchUser.display_name}</h2>
            <div className="flex items-center gap-2">
              <RoleBadge role={twitchUser.site_role} />
              <BroadcasterBadge type={twitchUser.broadcaster_type} />
            </div>
          </div>
          <Link 
            href={`/${twitchUser.username}`}
            className="inline-flex items-center gap-2 text-lg text-foreground/60 hover:text-foreground transition-colors"
          >
            @{twitchUser.username}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div title="Total Followers" className="flex items-center gap-2">
              <UsersIcon />
              <span className="text-sm font-medium text-purple-500">
                <AnimatedCounter value={stats.followers} />
              </span>
            </div>
            {stats.subscribers !== undefined && stats.subscribers > 0 && (twitchUser.broadcaster_type === "partner" || twitchUser.broadcaster_type === "affiliate") && (
              <div title="Active Subscribers" className="flex items-center gap-2">
                <StarIcon />
                <span className="text-sm font-medium text-pink-500">
                  <AnimatedCounter value={stats.subscribers} />
                </span>
              </div>
            )}
            {stats.channelPoints?.enabled && stats.channelPoints.activeRewards > 0 && (twitchUser.broadcaster_type === "partner" || twitchUser.broadcaster_type === "affiliate") && (
              <div title="Channel Points Rewards" className="flex items-center gap-2">
                <PointsIcon />
                <span className="text-sm font-medium text-cyan-500">
                  <AnimatedCounter value={stats.channelPoints.activeRewards} />
                </span>
              </div>
            )}
            {stats.moderators !== undefined && stats.moderators > 0 && (twitchUser.broadcaster_type === "partner" || twitchUser.broadcaster_type === "affiliate") && (
              <div title="Channel Moderators" className="flex items-center gap-2">
                <div className="text-blue-500">
                  <ShieldIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-blue-500">
                  <AnimatedCounter value={stats.moderators} />
                </span>
              </div>
            )}
            {stats.vips !== undefined && stats.vips > 0 && (twitchUser.broadcaster_type === "partner" || twitchUser.broadcaster_type === "affiliate") && (
              <div title="Channel VIPs" className="flex items-center gap-2">
                <div className="text-amber-500">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-amber-500">
                  <AnimatedCounter value={stats.vips} />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stream Info Section */}
      <div className="space-y-8">
        {/* Title */}
        {stats.title && (
          <div className="flex items-start gap-3">
            <div className="mt-1 text-foreground/60">
              <Type size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/60 mb-1">Stream Title</h3>
              <p className="text-lg">{stats.title}</p>
            </div>
          </div>
        )}

        {/* Game */}
        {stats.lastGame && (
          <div className="flex items-start gap-3">
            <div className="mt-1 text-foreground/60">
              <Gamepad2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/60 mb-1">Current Game</h3>
              <div className="flex items-center gap-3">
                <Image
                  src={stats.lastGame.boxArtUrl.replace('{width}', '40').replace('{height}', '53')}
                  alt={stats.lastGame.name}
                  width={40}
                  height={53}
                  className="rounded"
                />
                <p className="text-lg">{stats.lastGame.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {stats.tags && stats.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="mt-1 text-foreground/60">
              <Hash size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/60 mb-1">Stream Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stats.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 