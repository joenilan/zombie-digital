"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TwitchUser } from "@/types/database";
import { UserStats } from "./UserStats";
import { DataOverview } from "./DataOverview";
import { ChevronDownIcon } from "@/components/icons";
import { useState, useEffect, createContext } from "react";
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Add UserContext
export const UserContext = createContext<TwitchUser | null>(null);

interface DashboardClientProps {
  user: TwitchUser;
}

function DataCard({ title, data }: { title: string; data: any }) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="relative bg-background/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs rounded-md 
                     bg-background/50 dark:bg-background/50 
                     hover:bg-background/80 dark:hover:bg-background/80 
                     text-foreground/50 dark:text-foreground/50
                     hover:text-foreground/90 dark:hover:text-foreground/90
                     transition-all duration-200"
          >
            {copied ? (
              <span className="text-green-500 dark:text-green-400">Copied!</span>
            ) : (
              <span>Copy</span>
            )}
          </button>
        </div>
        <div className="relative bg-background/20 rounded-lg">
          <pre 
            className="overflow-x-auto text-sm text-muted-foreground
                     max-h-[400px] p-4 scrollbar-thin
                     scrollbar-thumb-foreground/10
                     scrollbar-track-transparent
                     hover:scrollbar-thumb-foreground/20"
          >
            <code className="inline-block min-w-full whitespace-pre">
              {jsonString}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [isSystemExpanded, setIsSystemExpanded] = useState(false);
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isSystemUser = user.site_role === "owner" || user.site_role === "admin";

  const handleStatsLoaded = () => {
    setIsStatsLoaded(true);
    setIsInitialLoading(false);
  };

  return (
    <UserContext.Provider value={user}>
      <AnimatePresence mode="wait">
        <div className="space-y-6">
          <div className={isInitialLoading ? 'hidden' : ''}>
            <UserStats 
              user={user} 
              onLoadComplete={handleStatsLoaded}
            />
          </div>
          {isInitialLoading ? (
            <LoadingSpinner text="Loading dashboard..." />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {isStatsLoaded && isSystemUser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full"
                >
                  <div className="ethereal-card relative">
                    <button 
                      onClick={() => setIsSystemExpanded(!isSystemExpanded)}
                      className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors rounded-lg"
                    >
                      <h2 className="text-xl font-semibold">System Data</h2>
                      <motion.div
                        animate={{ rotate: isSystemExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDownIcon className="w-6 h-6 opacity-60" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isSystemExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 p-4 pt-0">
                            <DataCard title="User Data" data={user} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </UserContext.Provider>
  );
} 