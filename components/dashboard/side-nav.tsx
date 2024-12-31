"use client"

import { UserHeader } from "./user-header"
import type { TwitchUser } from "@/types/database"
import { useState, useEffect } from "react"
import { fetchTwitchStats } from "@/utils/twitch-api"
import { 
  UsersIcon, 
  StarIcon, 
  PointsIcon, 
  ShieldIcon, 
  CrownIcon, 
  SparklesIcon 
} from "@/components/icons"
import Image from "next/image"
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@/components/icons"
import { TWITCH_API_URL, TWITCH_ENDPOINTS } from "@/utils/twitch-constants";

interface SideNavProps {
  user: TwitchUser
}

function AnimatedNumber({ value }: { value: number }) {
  const springConfig = { stiffness: 50, damping: 15, duration: 1.2 };
  const motionValue = useSpring(0, springConfig);
  
  useEffect(() => {
    // Start from 0 and animate to the target value
    motionValue.set(0);
    setTimeout(() => {
      motionValue.set(value);
    }, 100); // Small delay to ensure animation triggers after mount
  }, [motionValue, value]);

  const displayValue = useTransform(motionValue, (latest) => {
    const progress = latest / value;
    if (progress < 0.8) {
      const randomRange = (1 - progress) * 50;
      return Math.floor(latest + Math.random() * randomRange).toLocaleString();
    }
    return Math.floor(latest).toLocaleString();
  });

  return <motion.span>{displayValue}</motion.span>;
}

function StatsCard({ icon, title, value, description }: { 
  icon: React.ReactNode;
  title: string;
  value: number;
  description?: string;
}) {
  return (
    <div className="flex flex-col p-6 rounded-xl bg-glass shadow-glass transition-all duration-300 hover:shadow-cyber">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl text-foreground/80">{icon}</div>
        <h3 className="font-medium text-lg">{title}</h3>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">
          <AnimatedNumber value={value} />
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function RoleCard({ icon, title, users, count }: { 
  icon: React.ReactNode;
  title: string;
  users?: Array<{ user_name: string; profile_image_url?: string; }>;
  count?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col p-6 rounded-xl bg-glass shadow-glass transition-all duration-300 hover:shadow-cyber">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className="text-2xl text-foreground/80">{icon}</div>
        <h3 className="font-medium text-lg flex-1">{title}</h3>
        <ChevronDownIcon 
          className={`transition-transform duration-200 text-foreground/60 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      <div className="mt-2">
        <div className="text-xl font-semibold">
          {users ? `${users.length} users` : `${count?.toLocaleString() ?? 0}`}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && users && users.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-4"
          >
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar -mx-6 px-6">
              <div className="space-y-2 divide-y divide-white/10">
                {users.map((user) => (
                  <div 
                    key={user.user_name}
                    className="flex items-center gap-3 py-2"
                  >
                    {user.profile_image_url ? (
                      <Image
                        src={user.profile_image_url}
                        alt={user.user_name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-sm text-white/70">
                          {user.user_name[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.user_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SideNav({ user }: SideNavProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    followers: 0,
    subscribers: 0,
    channelPoints: {
      enabled: false,
      activeRewards: 0
    },
    isLive: false,
    isAffiliate: false
  });

  const [roleStats, setRoleStats] = useState<{
    moderators: Array<any>;
    vips: Array<any>;
    subscribers: number;
  }>({
    moderators: [],
    vips: [],
    subscribers: 0
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        if (!user.provider_token) return;
        
        // Fetch main stats
        const data = await fetchTwitchStats(
          user.twitch_id,
          user.provider_token,
          user.raw_user_meta_data.custom_claims.broadcaster_type
        );
        
        // Fetch role stats
        const [modsResponse, vipsResponse] = await Promise.all([
          fetch(
            `${TWITCH_API_URL}${TWITCH_ENDPOINTS.MODERATORS}?broadcaster_id=${user.twitch_id}&first=100`,
            {
              headers: {
                'Authorization': `Bearer ${user.provider_token}`,
                'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
              }
            }
          ),
          fetch(
            `${TWITCH_API_URL}${TWITCH_ENDPOINTS.VIPS}?broadcaster_id=${user.twitch_id}&first=100`,
            {
              headers: {
                'Authorization': `Bearer ${user.provider_token}`,
                'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
              }
            }
          )
        ]);

        const [modsData, vipsData] = await Promise.all([
          modsResponse.json(),
          vipsResponse.json()
        ]);

        const userIds = [...modsData.data, ...vipsData.data].map((u: any) => u.user_id);
        
        let userProfiles = {};
        if (userIds.length > 0) {
          const usersResponse = await fetch(
            `${TWITCH_API_URL}${TWITCH_ENDPOINTS.USERS}?id=${userIds.join('&id=')}`,
            {
              headers: {
                'Authorization': `Bearer ${user.provider_token}`,
                'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
              }
            }
          );
          const usersData = await usersResponse.json();
          userProfiles = Object.fromEntries(
            usersData.data.map((u: any) => [u.id, u.profile_image_url])
          );
        }

        // Update all stats at once
        setStats({
          followers: data.followers || 0,
          subscribers: data.subscribers || 0,
          channelPoints: {
            enabled: data.channelPoints?.enabled || false,
            activeRewards: data.channelPoints?.activeRewards || 0
          },
          isLive: data.isLive || false,
          isAffiliate: data.isAffiliate || false
        });

        setRoleStats({
          moderators: modsData.data.map((mod: any) => ({
            ...mod,
            profile_image_url: userProfiles[mod.user_id]
          })),
          vips: vipsData.data.map((vip: any) => ({
            ...vip,
            profile_image_url: userProfiles[vip.user_id]
          })),
          subscribers: data.subscribers || 0
        });

        // Small delay before showing numbers to ensure smooth animation
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setIsLoading(false);
      }
    };

    fetchAllStats();
  }, [user]);

  const isSystemUser = user.site_role === "owner" || user.site_role === "admin";
  const showAffiliateStats = stats.isAffiliate || isSystemUser;

  return (
    <div className="grid gap-6">
      {/* Profile Section with Stats */}
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            {stats.isLive && <div className="live-ring" />}
            <Image
              src={user.profile_image_url}
              alt={user.display_name}
              width={96}
              height={96}
              className="rounded-full relative z-10"
              priority
            />
            <div className="absolute inset-0 rounded-full ring-2 ring-purple-500/20 z-20" />
            {stats.isLive && (
              <div className="live-badge z-30">
                <div className="live-dot" />
                LIVE
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold truncate mb-2">{user.display_name}</h2>
            <a 
              href={`/${user.username}`}
              className="inline-flex items-center gap-2 text-lg text-foreground/60 hover:text-foreground transition-colors"
            >
              @{user.username}
            </a>
            
            {/* Compact Stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2" title="Total Followers">
                <UsersIcon size={16} />
                <span className="text-sm font-medium text-purple-500">
                  {!isLoading && <AnimatedNumber value={stats.followers} />}
                  {isLoading && "0"}
                </span>
              </div>

              {showAffiliateStats && (
                <>
                  <div className="flex items-center gap-2" title="Active Subscribers">
                    <StarIcon size={16} />
                    <span className="text-sm font-medium text-pink-500">
                      {!isLoading && <AnimatedNumber value={stats.subscribers} />}
                      {isLoading && "0"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" title="Channel Points Rewards">
                    <PointsIcon size={16} />
                    <span className="text-sm font-medium text-cyan-500">
                      {!isLoading && <AnimatedNumber value={stats.channelPoints?.activeRewards || 0} />}
                      {isLoading && "0"}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2" title="Channel Moderators">
                <ShieldIcon size={16} />
                <span className="text-sm font-medium text-blue-500">
                  {!isLoading && <AnimatedNumber value={roleStats.moderators.length} />}
                  {isLoading && "0"}
                </span>
              </div>

              <div className="flex items-center gap-2" title="Channel VIPs">
                <SparklesIcon size={16} />
                <span className="text-sm font-medium text-amber-500">
                  {!isLoading && <AnimatedNumber value={roleStats.vips.length} />}
                  {isLoading && "0"}
                </span>
              </div>
            </div>

            <style jsx>{`
              :global(.text-purple-500 svg) { color: #A855F7; }
              :global(.text-pink-500 svg) { color: #EC4899; }
              :global(.text-cyan-500 svg) { color: #06B6D4; }
              :global(.text-blue-500 svg) { color: #3B82F6; }
              :global(.text-amber-500 svg) { color: #F59E0B; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
} 