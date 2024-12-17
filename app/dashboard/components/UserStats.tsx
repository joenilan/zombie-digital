import { TwitchUser } from "@/types/database";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UsersIcon, StarIcon, PointsIcon, EyeIcon } from "@/components/icons";
import { fetchTwitchStats } from "@/utils/twitch-api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

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

function MiniStat({ 
  label, 
  value = 0,
  icon, 
  className = "" 
}: { 
  label: string;
  value?: number;
  icon: React.ReactNode;
  className?: string;
}) {
  const displayValue = typeof value === 'number' ? value : 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${className}`}>
      <div className="text-white/90">
        {icon}
      </div>
      <div className="flex gap-1.5 items-baseline">
        <div className="text-base font-semibold text-white">
          {displayValue.toLocaleString()}
        </div>
        <div className="text-sm text-white/70">
          {label}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game }: { game: any }) {
  if (!game || !game.boxArtUrl) return null;

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-background/30">
      <Image
        src={game.boxArtUrl}
        alt={game.name}
        width={300}
        height={400}
        className="object-cover"
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{game.name}</h3>
        {game.title && (
          <p className="text-sm text-foreground/70">{game.title}</p>
        )}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {game.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-background/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface UserStatsProps {
  user: TwitchUser;
  onLoadComplete?: () => void;
}

export function UserStats({ user, onLoadComplete }: UserStatsProps) {
  const [stats, setStats] = useState({
    isAffiliate: false,
    lastGame: null,
    isLive: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const isSystemUser = user.site_role === "owner" || user.site_role === "admin";

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
      } finally {
        setIsLoading(false);
        onLoadComplete?.();
      }
    };

    fetchStats();
  }, [user.twitch_id, user.provider_token, user.raw_user_meta_data.custom_claims.broadcaster_type, onLoadComplete]);

  if (isLoading || (!stats.lastGame && !user.raw_user_meta_data.custom_claims.description)) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <motion.div variants={itemVariants} className="ethereal-card">
        <div className="flex flex-col gap-6">
          {/* Only show game info if there's a game */}
          {stats.lastGame && (stats.isAffiliate || isSystemUser) && (
            <motion.div variants={itemVariants}>
              <GameCard game={stats.lastGame} />
            </motion.div>
          )}

          {/* Description */}
          {user.raw_user_meta_data.custom_claims.description && (
            <motion.div variants={itemVariants} className="p-4 rounded-lg bg-background/30">
              <p className="text-foreground/70">
                {user.raw_user_meta_data.custom_claims.description}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}