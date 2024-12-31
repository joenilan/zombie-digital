"use client";

import Link from "next/link";
import TwitchLoginButton from "./TwitchLoginButton";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import { SiteNotification } from "./SiteNotification";
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const isCanvasPage = pathname.startsWith('/canvas/');

  useEffect(() => {
    // Initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: session?.user?.id, error });
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      }
    };
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Debug log when user state changes
  useEffect(() => {
    console.log('User state changed:', user?.id);
  }, [user]);

  return (
    <header className={isCanvasPage ? "fixed top-4 left-4 right-4 z-50 pointer-events-none" : "sticky top-0 z-50 bg-background/80 backdrop-blur-xl"}>
      <nav className={isCanvasPage ? "h-14 px-4 bg-transparent" : "nav-container px-4"}>
        <div className={isCanvasPage ? "h-full flex items-center justify-between" : "nav-content"}>
          <div className="flex items-center gap-6 pointer-events-auto">
            <Link 
              href="/" 
              className="text-lg font-bold"
            >
              <span className="gradient-brand">Zombie</span>
              <span className="text-foreground/80">.Digital</span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-1">
              <NavLink href="/" current={pathname === "/"}>
                Home
              </NavLink>
              {user && (
                <>
                  <NavLink href="/dashboard" current={pathname === "/dashboard"}>
                    Dashboard
                  </NavLink>
                  <NavLink href="/dashboard/social-links" current={pathname === "/dashboard/social-links"}>
                    Social Links
                  </NavLink>
                  <NavLink href="/dashboard/canvas" current={pathname === "/dashboard/canvas"}>
                    Canvas
                  </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <ThemeToggle />
            {user ? (
              <UserMenu user={user} />
            ) : (
              <TwitchLoginButton />
            )}
          </div>
        </div>
      </nav>
      <SiteNotification user={user} />
    </header>
  );
}

function NavLink({ href, current, children }: { 
  href: string; 
  current: boolean; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative px-3 py-1.5 text-sm font-medium transition-colors group"
    >
      <span className={`relative z-10 transition-colors duration-200 ${
        current ? 'text-white' : 'text-foreground/70 group-hover:text-foreground'
      }`}>
        {children}
      </span>
      {current && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-cyber-gradient rounded-md shadow-cyber"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        />
      )}
    </Link>
  );
} 