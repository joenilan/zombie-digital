"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TwitchUser } from '@/types/auth'

const menuVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-white/5"
      >
        <div className="relative w-8 h-8">
          <Image
            src={user.profile_image_url}
            alt={user.display_name}
            width={32}
            height={32}
            className="rounded-full"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.display_name}&background=random`;
            }}
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-purple-500/20" />
        </div>
        <span className="hidden md:inline-block text-sm">{user.display_name}</span>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden md:block opacity-60"
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-48 py-2 bg-glass-dark backdrop-blur-xl border border-white/10 rounded-lg shadow-lg"
          >
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
                <div className="my-2 border-t border-white/10" />
              </>
            )}

            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 