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
import { Menu, X } from 'lucide-react';

function MobileNav({ user, pathname }: { user: User | null, pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDashboardSection = pathname.startsWith('/dashboard');
  const isDashboardSocialLinks = pathname === '/dashboard/social-links';
  const isDashboardCanvas = pathname === '/dashboard/canvas' || pathname.startsWith('/dashboard/canvas/');
  const isCanvasSettings = pathname.includes('/canvas/') && pathname.endsWith('/settings');
  const isHome = pathname === '/';

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-glass/50 backdrop-blur-xl border-l border-white/5 p-6 z-50"
            >
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <Link 
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-2 rounded-lg transition-colors",
                    isHome ? "bg-cyber-gradient text-white" : "hover:bg-white/5"
                  )}
                >
                  Home
                </Link>

                {user && (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-4 py-2 rounded-lg transition-colors",
                        isDashboardSection ? "bg-cyber-gradient text-white" : "hover:bg-white/5"
                      )}
                    >
                      Dashboard
                    </Link>

                    {isDashboardSection && (
                      <div className="pl-4 space-y-2 mt-2">
                        <Link
                          href="/dashboard/social-links"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-4 py-2 rounded-lg transition-colors",
                            isDashboardSocialLinks ? "bg-gradient-to-r from-cyber-cyan/50 to-blue-500/50 text-white" : "hover:bg-white/5"
                          )}
                        >
                          Social Links
                        </Link>

                        <Link
                          href="/dashboard/canvas"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-4 py-2 rounded-lg transition-colors",
                            isDashboardCanvas ? "bg-gradient-to-r from-cyber-cyan/50 to-blue-500/50 text-white" : "hover:bg-white/5"
                          )}
                        >
                          Canvas
                        </Link>

                        {isCanvasSettings && (
                          <Link
                            href={pathname}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2 rounded-lg transition-colors bg-gradient-to-r from-cyber-cyan/50 to-blue-500/50 text-white"
                          >
                            Settings
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const isCanvasPage = pathname.startsWith('/canvas/');
  const isDashboardSection = pathname.startsWith('/dashboard');
  const isDashboardSocialLinks = pathname === '/dashboard/social-links';
  const isDashboardCanvas = pathname === '/dashboard/canvas' || pathname.startsWith('/dashboard/canvas/');
  const isCanvasSettings = pathname.includes('/canvas/') && pathname.endsWith('/settings');
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
                        {isCanvasSettings && (
                          <motion.div 
                            className="flex items-center gap-1 ml-2 pl-2 border-l border-foreground/10"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SubNavLink 
                              href={pathname}
                              current={true}
                              layoutId="sub-sub-nav"
                            >
                              Settings
                            </SubNavLink>
                          </motion.div>
                        )}
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
            <MobileNav user={user} pathname={pathname} />
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