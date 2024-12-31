import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { User } from '@supabase/supabase-js';

interface DesktopNavProps {
  user: User | null;
  pathname: string;
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

export function DesktopNav({ user, pathname }: DesktopNavProps) {
  const isDashboardSection = pathname.startsWith('/dashboard');
  const isDashboardSocialLinks = pathname === '/dashboard/social-links';
  const isDashboardCanvas = pathname === '/dashboard/canvas' || pathname.startsWith('/dashboard/canvas/');
  const isCanvasSettings = pathname.includes('/canvas/') && pathname.endsWith('/settings');
  const isHome = pathname === '/' || pathname === '/home';

  return (
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
  );
} 