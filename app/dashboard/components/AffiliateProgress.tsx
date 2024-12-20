"use client";

import { motion } from "framer-motion";
import { TwitchUser } from "@/types/database";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground/70">{label}</span>
        <span className="text-foreground/90 font-medium">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 bg-background/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            percentage === 100 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : "bg-gradient-to-r from-cyber-cyan to-cyber-pink"
          }`}
        />
      </div>
    </div>
  );
}

interface AffiliateProgressProps {
  user: TwitchUser;
  stats: {
    followers: number;
    streamHours?: number;
    streamDays?: number;
    averageViewers?: number;
  };
}

export function AffiliateProgress({ user, stats }: AffiliateProgressProps) {
  const requirements = {
    followers: 50,
    streamHours: 8,
    streamDays: 7,
    averageViewers: 3
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Path to Affiliate</h3>
      <div className="grid gap-4">
        <ProgressBar 
          value={stats.followers} 
          max={requirements.followers} 
          label="Followers"
        />
        <ProgressBar 
          value={stats.streamHours || 0} 
          max={requirements.streamHours} 
          label="Stream Hours"
        />
        <ProgressBar 
          value={stats.streamDays || 0} 
          max={requirements.streamDays} 
          label="Stream Days"
        />
        <ProgressBar 
          value={stats.averageViewers || 0} 
          max={requirements.averageViewers} 
          label="Average Viewers"
        />
      </div>
      
      {/* Achievement Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Object.entries(requirements).map(([key, target]) => {
          const current = stats[key as keyof typeof stats] || 0;
          const achieved = current >= target;
          
          return (
            <div 
              key={key}
              className={`p-4 rounded-lg text-center transition-all duration-300 ${
                achieved 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-background/20"
              }`}
            >
              <div className={`text-2xl mb-2 ${achieved ? "text-green-500" : "text-foreground/40"}`}>
                {achieved ? "🏆" : "🎯"}
              </div>
              <div className="text-sm font-medium">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={`text-xs ${achieved ? "text-green-500" : "text-foreground/60"}`}>
                {achieved ? "Achieved!" : "In Progress"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 