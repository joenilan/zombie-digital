import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User } from '@supabase/supabase-js';
import { Home, LayoutDashboard, Link as LinkIcon, Paintbrush, Settings } from 'lucide-react';

interface MobileNavProps {
  user: User | null;
  pathname: string;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 p-2 relative",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <div className="relative">
        {isActive && (
          <motion.div
            layoutId="mobile-nav-highlight"
            className="absolute inset-0 -m-2 bg-gradient-to-r from-cyber-pink/20 to-cyber-cyan/20 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative">{icon}</span>
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export function MobileNav({ user, pathname }: MobileNavProps) {
  const isDashboardSection = pathname.startsWith('/dashboard');
  const isDashboardSocialLinks = pathname === '/dashboard/social-links';
  const isDashboardCanvas = pathname === '/dashboard/canvas' || pathname.startsWith('/dashboard/canvas/');
  const isCanvasSettings = pathname.includes('/canvas/') && pathname.endsWith('/settings');
  const isHome = pathname === '/' || pathname === '/home';
  const isDashboardMain = isDashboardSection && !isDashboardSocialLinks && !isDashboardCanvas && !isCanvasSettings;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-glass/50 backdrop-blur-xl border-t border-white/5 z-50">
      <div className="flex items-center justify-around px-4 py-2">
        <NavItem
          href="/"
          icon={<Home className="w-6 h-6" />}
          label="Home"
          isActive={isHome}
        />
        {user && (
          <>
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard className="w-6 h-6" />}
              label="Dashboard"
              isActive={isDashboardMain}
            />
            <NavItem
              href="/dashboard/social-links"
              icon={<LinkIcon className="w-6 h-6" />}
              label="Links"
              isActive={isDashboardSocialLinks}
            />
            <NavItem
              href="/dashboard/canvas"
              icon={<Paintbrush className="w-6 h-6" />}
              label="Canvas"
              isActive={isDashboardCanvas && !isCanvasSettings}
            />
            {isCanvasSettings && (
              <NavItem
                href={pathname}
                icon={<Settings className="w-6 h-6" />}
                label="Settings"
                isActive={isCanvasSettings}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 