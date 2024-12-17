import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TwitchUser } from "@/types/database";
import { fetchTwitchStats } from "@/utils/twitch-api";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface StatBlockProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
}

function StatBlock({ title, value, subValue, trend, icon, className }: StatBlockProps) {
  return (
    <div className={`ethereal-card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/60">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subValue && (
            <p className="text-sm text-foreground/60 mt-1">{subValue}</p>
          )}
        </div>
        {icon && (
          <div className="text-foreground/40">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`text-sm mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// Icon Components
function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PointsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ChannelStats({ user }: { user: TwitchUser }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchTwitchStats(user.provider_token, user.twitch_id);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load channel statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 text-center text-foreground/70">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="w-full mb-8">
      <h2 className="text-xl font-bold mb-4">Channel Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock
          title="Followers"
          value={stats?.followers?.toLocaleString() ?? 0}
          icon={<UsersIcon />}
        />
        <StatBlock
          title="Subscribers"
          value={stats?.subscribers?.toLocaleString() ?? 0}
          icon={<StarIcon />}
        />
        <StatBlock
          title="Channel Points"
          value={stats?.channelPoints?.activeRewards ?? 0}
          subValue={stats?.channelPoints?.enabled ? "Active Rewards" : "Not Available"}
          icon={<PointsIcon />}
        />
        <StatBlock
          title="Total Views"
          value={stats?.totalViews?.toLocaleString() ?? 0}
          icon={<EyeIcon />}
        />
      </div>
    </motion.div>
  );
}

// Add icon components here... 