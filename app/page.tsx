"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import TwitchLoginButton from "@/components/TwitchLoginButton";
import Link from "next/link";
import PageTransitionLayout from "@/components/PageTransitionLayout";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, [supabase, router]);

  if (user === undefined) {
    return null; // Initial loading state
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
            {loading ? (
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

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="ethereal-card">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}
