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
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { ChevronDownIcon } from "@/components/icons"
import { TWITCH_API_URL, TWITCH_ENDPOINTS } from "@/utils/twitch-constants";

function RoleBadge({ role }: { role: string }) {
  const colors = {
    owner: "from-yellow-500 to-orange-500",
    admin: "from-purple-500 to-pink-500",
    moderator: "from-blue-500 to-cyan-500",
    user: "from-gray-500 to-gray-600",
  }[role.toLowerCase()];

  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      bg-gradient-to-r ${colors} text-white shadow-sm
    `}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function AccountTypeBadge({ type }: { type: string }) {
  const colors = {
    partner: "from-purple-500 to-blue-500",
    affiliate: "from-purple-500 to-pink-500",
    default: "from-gray-500 to-gray-600",
  }[type.toLowerCase()] || "from-gray-500 to-gray-600";

  const label = type || "Regular";

  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      bg-gradient-to-r ${colors} text-white shadow-sm
    `}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: number
  description?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const springConfig = { 
    stiffness: 50,  // Reduced stiffness for slower animation
    damping: 15,    // Reduced damping for more bounce
    duration: 1.2   // Longer duration
  };
  const motionValue = useSpring(0, springConfig);
  
  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  const displayValue = useTransform(motionValue, (latest) => {
    // Calculate progress (0 to 1)
    const progress = latest / value;
    
    // More scrambling at the start, less towards the end
    if (progress < 0.8) {
      // Bigger random range at the start
      const randomRange = (1 - progress) * 50;
      return Math.floor(latest + Math.random() * randomRange).toLocaleString();
    }
    
    // Clean finish for the last 20%
    return Math.floor(latest).toLocaleString();
  });

  return <motion.span>{displayValue}</motion.span>;
}

function StatsCard({ icon, title, value, description }: StatsCardProps) {
  return (
    <div className="flex flex-col p-6 rounded-xl bg-glass shadow-glass transition-all duration-300 hover:shadow-cyber">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-medium text-lg">{title}</h3>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">
          <AnimatedNumber value={value} />
        </div>
        {description && (
          <p className="text-sm text-muted-foreground/80">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface SideNavProps {
  user: TwitchUser
}

interface RoleStats {
  moderators: Array<{
    user_id: string;
    user_name: string;
    user_login: string;
    profile_image_url?: string;
  }>;
  vips: Array<{
    user_id: string;
    user_name: string;
    user_login: string;
    profile_image_url?: string;
  }>;
  subscribers: number;
}

function RoleCard({ 
  icon, 
  title, 
  users, 
  count 
}: { 
  icon: React.ReactNode; 
  title: string; 
  users?: Array<{ 
    user_name: string;
    profile_image_url?: string;
  }>;
  count?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col p-6 rounded-xl bg-glass shadow-glass transition-all duration-300 hover:shadow-cyber">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 mb-2 w-full text-left"
      >
        <div className="text-2xl">{icon}</div>
        <h3 className="font-medium text-lg">{title}</h3>
        <ChevronDownIcon className={`ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <div className="mt-2">
        <div className="text-2xl font-bold">
          {users ? `${users.length} users` : `${count?.toLocaleString() ?? 0}`}
        </div>
      </div>

      {isExpanded && users && users.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden mt-4"
        >
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar -mx-6 px-6">
            <div className="space-y-3 divide-y divide-white/10">
              {users.map((user) => (
                <div 
                  key={user.user_name}
                  className="flex items-center gap-3 py-3"
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
    </div>
  );
}

export function SideNav({ user }: SideNavProps) {
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

  const [roleStats, setRoleStats] = useState<RoleStats>({
    moderators: [],
    vips: [],
    subscribers: 0
  });

  const isSystemUser = user.site_role === "owner" || user.site_role === "admin";
  const showAffiliateStats = stats.isAffiliate || isSystemUser;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user.provider_token) {
          console.error('No provider token available');
          return;
        }

        const data = await fetchTwitchStats(
          user.twitch_id,
          user.provider_token,
          user.raw_user_meta_data.custom_claims.broadcaster_type
        );
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user.twitch_id, user.provider_token, user.raw_user_meta_data.custom_claims.broadcaster_type]);

  useEffect(() => {
    const fetchRoleStats = async () => {
      try {
        // Fetch moderators
        const modsResponse = await fetch(
          `${TWITCH_API_URL}${TWITCH_ENDPOINTS.MODERATORS}?broadcaster_id=${user.twitch_id}&first=100`,
          {
            headers: {
              'Authorization': `Bearer ${user.provider_token}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
            }
          }
        );
        const modsData = await modsResponse.json();

        // Fetch VIPs
        const vipsResponse = await fetch(
          `${TWITCH_API_URL}${TWITCH_ENDPOINTS.VIPS}?broadcaster_id=${user.twitch_id}&first=100`,
          {
            headers: {
              'Authorization': `Bearer ${user.provider_token}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
            }
          }
        );
        const vipsData = await vipsResponse.json();

        // Fetch user profiles for mods and VIPs
        const userIds = [...modsData.data, ...vipsData.data].map(u => u.user_id);
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
        const userProfiles = Object.fromEntries(
          usersData.data.map((u: any) => [u.id, u.profile_image_url])
        );

        setRoleStats({
          moderators: modsData.data.map((mod: any) => ({
            ...mod,
            profile_image_url: userProfiles[mod.user_id]
          })) || [],
          vips: vipsData.data.map((vip: any) => ({
            ...vip,
            profile_image_url: userProfiles[vip.user_id]
          })) || [],
          subscribers: stats.subscribers || 0
        });
      } catch (error) {
        console.error("Error fetching role stats:", error);
      }
    };

    if (user.provider_token) {
      fetchRoleStats();
    }
  }, [user.twitch_id, user.provider_token, stats.subscribers]);

  // Calculate grid columns based on number of visible stats
  const visibleStatsCount = showAffiliateStats ? 3 : 1;
  const gridColsClass = {
    1: "grid-cols-1",
    3: "md:grid-cols-3"
  }[visibleStatsCount];

  return (
    <div className="space-y-6">
      <div className="bg-glass rounded-xl shadow-glass p-6 transition-all duration-300 hover:shadow-cyber">
        <div className="flex items-center gap-4">
          <div className="relative">
            {stats.isLive && <div className="live-ring" />}
            <Image
              src={user.profile_image_url}
              alt={user.display_name}
              width={80}
              height={80}
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
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{user.display_name}</h2>
              <RoleBadge role={user.site_role} />
              <AccountTypeBadge type={user.raw_user_meta_data.custom_claims.broadcaster_type} />
            </div>
            <a 
              href={`/${user.username}`}
              className="text-foreground/60 hover:text-foreground transition-colors relative z-10"
            >
              @{user.username}
            </a>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
        <div className={visibleStatsCount === 1 ? "col-span-full" : ""}>
          <StatsCard
            icon={<UsersIcon size={24} />}
            title="Followers"
            value={stats.followers}
            description="Total followers on Twitch"
          />
        </div>
        {showAffiliateStats && (
          <>
            <StatsCard
              icon={<StarIcon size={24} />}
              title="Subscribers"
              value={stats.subscribers || 0}
              description="Active subscribers"
            />
            <StatsCard
              icon={<PointsIcon size={24} />}
              title="Channel Points"
              value={stats.channelPoints?.activeRewards || 0}
              description="Points redeemed today"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          icon={<ShieldIcon />}
          title="Moderators"
          users={roleStats.moderators}
        />
        <RoleCard
          icon={<SparklesIcon />}
          title="VIPs"
          users={roleStats.vips}
        />
        <RoleCard
          icon={<CrownIcon />}
          title="Subscribers"
          count={roleStats.subscribers}
        />
      </div>
    </div>
  )
} 