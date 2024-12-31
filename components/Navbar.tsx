"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { SiteNotification } from "./SiteNotification";
import { User } from '@supabase/supabase-js';
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const isCanvasPage = pathname.startsWith('/canvas/');
  const isDashboardSection = pathname.startsWith('/dashboard');
  const isDashboardSocialLinks = pathname === '/dashboard/social-links';
  const isDashboardCanvas = pathname === '/dashboard/canvas' || pathname.startsWith('/dashboard/canvas/');
  const isHome = pathname === '/';

  useEffect(() => {
    // Initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      }
    };
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

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
              <NavLink href="/" current={isHome} layoutId="main-nav">
                Home
              </NavLink>
              {user && (
                <div className="flex items-center">
                  <NavLink href="/dashboard" current={isDashboardSection} layoutId="main-nav">
                    Dashboard
                  </NavLink>
                  <AnimatePresence mode="wait">
                    {isDashboardSection && (
                      <motion.div 
                        className="flex items-center gap-1 ml-2 pl-2 border-l border-foreground/10"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SubNavLink 
                          href="/dashboard/social-links" 
                          current={isDashboardSocialLinks}
                          layoutId="sub-nav"
                        >
                          Social Links
                        </SubNavLink>
                        <SubNavLink 
                          href="/dashboard/canvas" 
                          current={isDashboardCanvas}
                          layoutId="sub-nav"
                        >
                          Canvas
                        </SubNavLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <ThemeToggle />
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </nav>
      <SiteNotification user={user} />
    </header>
  );
}

function NavLink({ href, current, children, layoutId = "nav-highlight" }: { 
  href: string; 
  current: boolean; 
  children: React.ReactNode;
  layoutId?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-3 py-2 transition-colors duration-200",
        current ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {current && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 bg-gradient-to-r from-cyber-pink to-purple-500/80 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30,
            duration: 0.2
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

function SubNavLink({ href, current, children, layoutId = "subnav-highlight" }: { 
  href: string; 
  current: boolean; 
  children: React.ReactNode;
  layoutId?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-3 py-1.5 transition-colors duration-200",
        current ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {current && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/50 to-blue-500/50 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30,
            duration: 0.2
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
} 