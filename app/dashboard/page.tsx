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
  const [showDebug, setShowDebug] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchSession() {
      try {
        console.log("Fetching user session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Fetched session:", session);
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
      if (!session) return;

      try {
        console.log("Session:", session);
        const providerId = session.user.user_metadata.sub;
        console.log("Provider ID:", providerId);

        // First get user from database to get the provider token
        const { data: twitchUser, error: twitchError } = await supabase
          .from("twitch_users")
          .select("*")
          .eq("twitch_id", providerId)
          .single();

        console.log("Twitch User:", twitchUser);
        console.log("Twitch Error:", twitchError);

        if (twitchError) {
          setError(twitchError.message);
          setLoading(false);
          return;
        }

        // Then get user data from Twitch API using the provider token
        const twitchResponse = await fetch(`https://api.twitch.tv/helix/users?id=${providerId}`, {
          headers: {
            'Authorization': `Bearer ${twitchUser.provider_token}`,
            'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          }
        });

        if (!twitchResponse.ok) {
          throw new Error('Failed to fetch Twitch user data');
        }

        const twitchData = await twitchResponse.json();
        const twitchUserData = twitchData.data?.[0];
        console.log("Twitch API User Data:", twitchUserData);

        // Combine the data, prioritizing the API response for broadcaster_type
        setTwitchUser({
          ...twitchUser,
          broadcaster_type: twitchUserData?.broadcaster_type || twitchUser.broadcaster_type || 'none'
        });
      } catch (err) {
        console.error("Error fetching Twitch user:", err);
        setError("Failed to fetch Twitch user");
        setLoading(false);
      }
    }
    fetchTwitchUser();
  }, [session, supabase]);

  useEffect(() => {
    async function fetchStats() {
      if (!twitchUser) return;

      try {
        console.log("Loading Twitch stats...");
        console.log("User ID:", twitchUser.twitch_id);
        console.log("Provider Token:", twitchUser.provider_token.slice(0, 10) + "...");
        console.log("Broadcaster Type:", twitchUser.broadcaster_type);

        const twitchStats = await fetchTwitchStats(
          twitchUser.twitch_id,
          twitchUser.provider_token,
          twitchUser.broadcaster_type || "none"
        );

        console.log("Raw Twitch Stats:", JSON.stringify(twitchStats, null, 2));
        
        if (twitchStats && typeof twitchStats === 'object') {
          setStats(twitchStats);
        } else {
          setError("Invalid stats data received");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
        setLoading(false);
      }
    }
    fetchStats();
  }, [twitchUser]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[200px]">
        <LoadingSpinner />
        <p>Loading dashboard data...</p>
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

  if (!session || !stats || !twitchUser) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
        <p className="text-foreground/60">
          {!session ? 'Please sign in to view your dashboard.' : 'No stats available.'}
        </p>
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

      <div className="space-y-6">
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
          <div className="flex items-start gap-4">
            {stats.lastGame.boxArtUrl && (
              <Image
                src={stats.lastGame.boxArtUrl.replace('{width}', '100').replace('{height}', '133')}
                alt={stats.lastGame.name}
                width={100}
                height={133}
                className="rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-foreground/60">
                  <Gamepad2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground/60 mb-1">Current Game</h3>
                  <p className="text-lg">{stats.lastGame.name}</p>
                </div>
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
              <h3 className="text-sm font-medium text-foreground/60 mb-2">Stream Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stats.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-glass/30 backdrop-blur-md text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Debug Information - Only shown for admins/owners */}
        {twitchUser.site_role && ['owner', 'admin'].includes(twitchUser.site_role) && (
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground/60">Debug Information</h3>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-glass/30 hover:bg-glass/50 transition-colors"
              >
                <Code size={16} />
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
            {showDebug && (
              <pre className="whitespace-pre-wrap text-sm overflow-auto bg-glass/30 p-4 rounded-lg">
                {JSON.stringify(stats, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
} 