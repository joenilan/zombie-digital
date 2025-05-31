"use client";

import TwitchLoginButton from "@/components/TwitchLoginButton";
import Link from "next/link";
import PageTransitionLayout from "@/components/PageTransitionLayout";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Settings, Shield, BarChart3 } from "lucide-react";

function FeatureCard({ title, description, icon, delay = 0 }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group p-4 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 
                 hover:bg-glass/50 hover:border-white/20 transition-all duration-300 
                 hover:shadow-[0_8px_32px_rgba(145,70,255,0.15)]"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 
                        group-hover:from-cyber-pink/30 group-hover:to-purple-500/30 transition-all duration-300">
          {icon}
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default function HomePage() {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <PageTransitionLayout>
        <div className="fixed inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageTransitionLayout>
    );
  }

  return (
    <PageTransitionLayout>
      <div className="homepage-container fixed inset-0 flex flex-col overflow-hidden">
        {/* Navigation spacer */}
        <div className="h-14 flex-shrink-0" />

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto text-center space-y-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none">
                <span className="gradient-brand">Zombie</span>
                <span className="text-foreground/80">.Digital</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-medium">
                Twitch Management Platform
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm md:text-base text-foreground/80 max-w-2xl mx-auto leading-relaxed"
            >
              Take control of your Twitch presence with professional management tools, analytics, and automation.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              {user ? (
                <Link href="/dashboard" className="ethereal-button inline-flex items-center gap-2 text-sm md:text-base px-6 py-3">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <TwitchLoginButton />
              )}
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              <FeatureCard
                icon={<Settings className="w-4 h-4" />}
                title="Stream Management"
                description="Control your stream settings, chat, and channel points"
                delay={0.1}
              />
              <FeatureCard
                icon={<Shield className="w-4 h-4" />}
                title="Moderation Tools"
                description="Powerful tools to keep your chat clean and engaging"
                delay={0.2}
              />
              <FeatureCard
                icon={<BarChart3 className="w-4 h-4" />}
                title="Analytics"
                description="Track your growth and understand your audience"
                delay={0.3}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </PageTransitionLayout>
  );
}
