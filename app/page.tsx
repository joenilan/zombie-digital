"use client";

import TwitchLoginButton from "@/components/TwitchLoginButton";
import Link from "next/link";
import PageTransitionLayout from "@/components/PageTransitionLayout";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-glass/50 backdrop-blur-xl border border-white/5 transition-all duration-300 hover:shadow-cyber">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <PageTransitionLayout>
        <LoadingSpinner />
      </PageTransitionLayout>
    );
  }

  return (
    <PageTransitionLayout>
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="gradient-brand">Zombie</span>
              <span className="text-foreground/80">.Digital</span>
            </h1>
            <p className="text-2xl text-foreground/90">
              Twitch Management Platform
            </p>
          </div>

          <p className="text-xl text-foreground/80">
            Take control of your Twitch presence with professional management tools, analytics, and automation.
          </p>

          <div className="flex justify-center">
            {isLoading ? (
              <div className="w-48 h-12 bg-background/20 rounded-full animate-pulse" />
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
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-12">
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
          </div>
        </div>
      </div>
    </PageTransitionLayout>
  );
}
