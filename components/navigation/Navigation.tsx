"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import Link from "next/link";
import UserMenu from "../UserMenu";
import ThemeToggle from "../ThemeToggle";
import { SiteNotification } from "../SiteNotification";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const isCanvasPage = pathname.startsWith('/canvas/');
  const isOverlay = pathname.startsWith('/overlay');
  const isCanvasView = pathname.startsWith('/canvas/') && !pathname.endsWith('/settings');

  // Don't render navigation on overlay or canvas pages
  if (isOverlay || isCanvasView) return null;

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
    <>
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
              
              <DesktopNav user={user} pathname={pathname} />
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
              <ThemeToggle />
              {user && <UserMenu user={user} />}
            </div>
          </div>
        </nav>
        <SiteNotification user={user} />
      </header>

      <MobileNav user={user} pathname={pathname} />
    </>
  );
} 