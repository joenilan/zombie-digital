"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const notificationVariants = {
  initial: {
    height: 0,
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
  animate: {
    height: "auto",
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export function SiteNotification({ user }: { user: any | null }) {
  const supabase = createClientComponentClient();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Fetch active notifications
  const { data: notifications } = useQuery({
    queryKey: ['active-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('active', true)
        .order('createdAt', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const activeNotifications = notifications?.filter(notification => {
    // Don't show if dismissed
    if (dismissedIds.has(notification.id)) return false;
    // Don't show auth-only notifications to non-auth users
    if (notification.showOnlyToAuth && !user) return false;
    // Don't show expired notifications
    if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) return false;
    return true;
  });

  if (!activeNotifications?.length) return null;

  return (
    <div>
      <AnimatePresence initial={false}>
        {activeNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
              relative py-3 shadow-lg overflow-hidden
              ${notification.type === "info" && "bg-blue-500/10 border-b border-blue-500/20"}
              ${notification.type === "warning" && "bg-yellow-500/10 border-b border-yellow-500/20"}
              ${notification.type === "error" && "bg-red-500/10 border-b border-red-500/20"}
              ${notification.type === "success" && "bg-green-500/10 border-b border-green-500/20"}
            `}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <p className={`text-sm ${notification.type === "info" && "text-blue-200"
                } ${notification.type === "warning" && "text-yellow-200"}
              ${notification.type === "error" && "text-red-200"}
              ${notification.type === "success" && "text-green-200"}`}>
                {notification.message}
              </p>
              <button
                onClick={() => setDismissedIds(prev => new Set([...prev, notification.id]))}
                className="p-1 hover:bg-white/5 rounded-full transition-colors flex-shrink-0 ml-3"
              >
                <XIcon className="w-4 h-4 opacity-60" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 