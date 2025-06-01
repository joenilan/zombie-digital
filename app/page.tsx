"use client";

import TwitchLoginButton from "@/components/TwitchLoginButton";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import { ArrowRight, Settings, Shield, BarChart3, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard, CyberCard } from "@/components/animations/AnimatedCard";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  scaleIn,
  slideInLeft,
  slideInRight,
  textGlowWithFade,
} from "@/lib/animations";

export default function HomePage() {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="homepage"
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="w-full h-full flex items-center justify-center px-4 relative z-10"
    >
      <motion.div
        key="homepage-content"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="w-full max-w-5xl mx-auto text-center space-y-6"
      >
        {/* Hero Section */}
        <motion.div variants={staggerItem} className="space-y-3">
          <motion.h1
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-none"
          >
            <motion.span
              className="gradient-brand inline-block"
              variants={textGlowWithFade}
            >
              Zombie
            </motion.span>
            <span className="text-foreground">.Digital</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-foreground font-body font-medium"
          >
            Your Digital Presence, <span className="text-cyber-cyan">Simplified</span>
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base text-foreground/80 max-w-xl mx-auto leading-relaxed"
          >
            Take control of your Twitch presence with professional management tools and real-time analytics.
          </motion.p>
        </motion.div>

        {/* CTA Section */}
        <motion.div variants={staggerItem} className="flex justify-center py-2">
          {user ? (
            <motion.div variants={scaleIn}>
              <Button asChild variant="ethereal" icon={<ArrowRight className="w-4 h-4" />}>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div variants={scaleIn}>
              <TwitchLoginButton />
            </motion.div>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-3 gap-3 max-w-2xl mx-auto"
        >
          <motion.div variants={slideInLeft}>
            <StatsCard className="text-center py-3">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-cyber-pink/20 to-purple-500/20">
                <Users className="w-4 h-4 text-cyber-pink" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">500+</h3>
              <p className="text-xs text-foreground/70">Active Users</p>
            </StatsCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <StatsCard className="text-center py-3">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-cyber-cyan/20 to-blue-500/20">
                <TrendingUp className="w-4 h-4 text-cyber-cyan" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">99.5%</h3>
              <p className="text-xs text-foreground/70">Uptime</p>
            </StatsCard>
          </motion.div>

          <motion.div variants={slideInRight}>
            <StatsCard className="text-center py-3">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">&lt;200ms</h3>
              <p className="text-xs text-foreground/70">Response</p>
            </StatsCard>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto"
        >
          <motion.div variants={slideInLeft}>
            <CyberCard className="p-4 h-full">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Stream Management</h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Complete control over your stream settings and channel customization.
              </p>
            </CyberCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <CyberCard className="p-4 h-full">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Social Link Management</h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Centralized hub for all your social media links and online presence.
              </p>
            </CyberCard>
          </motion.div>

          <motion.div variants={slideInRight}>
            <CyberCard className="p-4 h-full">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Analytics & Insights</h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Real-time analytics and detailed insights into your channel performance.
              </p>
            </CyberCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
