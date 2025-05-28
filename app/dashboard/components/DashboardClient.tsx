"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TwitchUser } from "@/types/database";
import { ChevronDownIcon } from "@/components/icons";
import { createContext } from "react";

export const UserContext = createContext<TwitchUser | null>(null);

interface DashboardClientProps {
  user: TwitchUser;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  return (
    <UserContext.Provider value={user}>
      <div className="space-y-8">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h2>
          <p className="text-muted-foreground">Your dashboard is ready!</p>
        </div>
      </div>
    </UserContext.Provider>
  );
} 