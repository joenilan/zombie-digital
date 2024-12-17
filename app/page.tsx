"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TwitchLoginButton from "@/components/TwitchLoginButton";
import Link from "next/link";
import PageTransitionLayout from "@/components/PageTransitionLayout";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <PageTransitionLayout>
      <div className="container mx-auto px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-12"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="gradient-brand">Zombie</span>
              <span className="gradient-text">.Digital</span>
            </h1>
            <p className="text-2xl text-foreground/90">
              Twitch Management Platform
            </p>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-foreground/80"
          >
            Take control of your Twitch presence with professional management tools, analytics, and automation.
          </motion.p>

          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="w-48 h-12 bg-background/20 rounded-full animate-pulse mx-auto" />
            ) : user ? (
              <Link 
                href="/dashboard" 
                className="ethereal-button inline-flex items-center gap-2"
              >
                Go to Dashboard
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <TwitchLoginButton size="lg" />
            )}
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6 pt-12"
          >
            <FeatureCard
              title="Stream Management"
              description="Control your stream settings, chat, and channel points"
            />
            <FeatureCard
              title="Moderation Tools"
              description="Powerful tools to keep your chat clean and engaging"
            />
            <FeatureCard
              title="Analytics"
              description="Track your growth and understand your audience"
            />
          </motion.div>
        </motion.div>
      </div>
    </PageTransitionLayout>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div variants={itemVariants}>
      <div className="ethereal-card">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-foreground/70">{description}</p>
      </div>
    </motion.div>
  );
}
