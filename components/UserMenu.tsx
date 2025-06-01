"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChevronDown, LayoutDashboard, Shield, LogOut, User } from "lucide-react";
import type { TwitchUser } from '@/types/auth'

const menuVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function UserMenu({ user }: { user: TwitchUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuthStore();

  const isAdmin = ['owner', 'admin'].includes(user.site_role);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setIsOpen(false);

      // Use the global auth store signOut method
      await signOut();

      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full bg-glass/30 backdrop-blur-xl border border-white/10 
                   hover:bg-glass/50 hover:border-white/20 transition-all duration-300 
                   hover:shadow-glass group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-pink/20 to-cyber-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image
            src={user.profile_image_url}
            alt={user.display_name}
            width={36}
            height={36}
            className="rounded-full relative z-10 border-2 border-white/10 group-hover:border-cyber-pink/50 transition-colors duration-300"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.display_name}&background=random`;
            }}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 mt-3 w-64 z-50 bg-cyber-darker/95 backdrop-blur-xl border border-white/20 
                         rounded-xl shadow-cyber overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyber-pink/5 to-cyber-cyan/5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={user.profile_image_url}
                      alt={user.display_name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-white/20"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.display_name}&background=random`;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    {user.site_role !== 'user' && (
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${user.site_role === 'owner' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30' :
                            user.site_role === 'admin' ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30' :
                              'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'}`}>
                          {user.site_role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {isAdmin && (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                                 hover:from-cyber-pink/10 hover:to-cyber-cyan/10 transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 
                                      group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-200">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                               hover:from-cyber-pink/10 hover:to-cyber-cyan/10 transition-all duration-200 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 
                                    group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-200">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </motion.div>

                {/* Separator */}
                <div className="my-2 mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <motion.div variants={itemVariants}>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gradient-to-r 
                               hover:from-red-500/10 hover:to-pink-500/10 transition-all duration-200 group
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 
                                    group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-200">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 