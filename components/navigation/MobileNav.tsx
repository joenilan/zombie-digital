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
        "flex flex-col items-center justify-center gap-1 p-3 relative w-16 h-16 transition-all duration-300",
        isActive 
          ? "dark:text-cyber-cyan dark:drop-shadow-[0_0_8px_rgba(103,232,249,0.5)] text-cyber-pink drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" 
          : "text-muted-foreground hover:text-cyber-pink/80 dark:hover:text-cyber-cyan/80"
      )}
    >
      <motion.div 
        className="relative w-5 h-5 flex items-center justify-center"
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <span className="relative text-xs font-medium">{label}</span>
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
  const isOverlay = pathname.startsWith('/overlay');
  const isCanvasPage = pathname.startsWith('/canvas/') && !isCanvasSettings;

  // Don't render navigation on overlay or canvas pages
  if (isOverlay || isCanvasPage) return null;

  // Determine which nav items to show
  const navItems = [
    { href: "/", icon: <Home className="w-4 h-4" />, label: "Home", isActive: isHome },
    ...(user ? [
      { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", isActive: isDashboardMain },
      { href: "/dashboard/social-links", icon: <LinkIcon className="w-4 h-4" />, label: "Links", isActive: isDashboardSocialLinks },
      { href: "/dashboard/canvas", icon: <Paintbrush className="w-4 h-4" />, label: "Canvas", isActive: isDashboardCanvas && !isCanvasSettings },
      ...(isCanvasSettings ? [
        { href: pathname, icon: <Settings className="w-4 h-4" />, label: "Settings", isActive: isCanvasSettings }
      ] : [])
    ] : [])
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-glass/50 backdrop-blur-xl border-t border-white/5 z-50 pb-safe">
      <div className="flex items-center justify-evenly py-2">
        {navItems.map((item, index) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
          />
        ))}
      </div>
    </div>
  );
} 