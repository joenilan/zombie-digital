"use client";

import Link from "next/link";
import TwitchLoginButton from "./TwitchLoginButton";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { SiteNotification } from "./SiteNotification";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClientComponentClient();
  const isCanvasPage = pathname.startsWith('/canvas/');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header className={isCanvasPage ? "fixed top-4 left-4 right-4 z-50" : "sticky top-0 z-50 bg-background/80 backdrop-blur-xl"}>
      <nav className={isCanvasPage ? "h-14 px-4 bg-transparent" : "nav-container px-4"}>
        <div className={isCanvasPage ? "h-full flex items-center justify-between" : "nav-content"}>
          <div className="flex items-center gap-6">
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
                <NavLink href="/dashboard" current={pathname === "/dashboard"}>
                  Dashboard
                </NavLink>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
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