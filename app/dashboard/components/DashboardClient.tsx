"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TwitchUser } from "@/types/database";
import { UserStats } from "./UserStats";
import { ChevronDownIcon } from "@/components/icons";
import { useState, useEffect, createContext } from "react";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTwitchAuth } from "@/providers/twitch-auth-provider";

export const UserContext = createContext<TwitchUser | null>(null);

interface DashboardClientProps {
  user: TwitchUser;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { providerToken, refreshTwitchToken } = useTwitchAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      if (!providerToken) {
        setIsLoading(true);
        try {
          await refreshTwitchToken();
        } catch (error) {
          console.error("Error refreshing token:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();
  }, [providerToken, refreshTwitchToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="space-y-8">
        <UserStats user={user} />
      </div>
    </UserContext.Provider>
  );
} 