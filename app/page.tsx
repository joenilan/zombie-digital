"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import TwitchLoginButton from "@/components/TwitchLoginButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="px-6 py-16">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="gradient-brand">
            Zombie
          </span>
          <span className="text-foreground">.Digital</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-foreground/90 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your Digital Presence, <span className="text-cyber-cyan">Simplified</span>
        </motion.p>

        <motion.p
          className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Take control of your Twitch presence with professional management tools,
          real-time analytics, and seamless social link management.
        </motion.p>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {user ? (
            <Button asChild size="lg" className="bg-cyber-pink hover:bg-cyber-pink/80 shadow-cyber hover:shadow-cyber-hover transition-all duration-300">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          ) : (
            <TwitchLoginButton />
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <motion.div
            className="bg-glass/50 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-glass hover:shadow-cyber transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-cyber-pink/20 group-hover:bg-cyber-pink/30 transition-colors duration-300">
              <Users className="w-6 h-6 text-cyber-pink" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">500+</div>
            <div className="text-sm text-foreground/60">Active Users</div>
          </motion.div>

          <motion.div
            className="bg-glass/50 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-glass hover:shadow-cyber transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-cyber-cyan/20 group-hover:bg-cyber-cyan/30 transition-colors duration-300">
              <TrendingUp className="w-6 h-6 text-cyber-cyan" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">99.5%</div>
            <div className="text-sm text-foreground/60">Uptime</div>
          </motion.div>

          <motion.div
            className="bg-glass/50 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-glass hover:shadow-cyber transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">&lt;200ms</div>
            <div className="text-sm text-foreground/60">Response</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
