"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  UsersIcon,
  SettingsIcon,
  ShieldIcon,
  ActivityIcon,
  ToggleLeftIcon
} from "lucide-react";

const adminRoutes = [
  {
    href: "/admin",
    label: "Overview",
    icon: ActivityIcon,
    exact: true
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: BellIcon
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: UsersIcon
  },
  {
    href: "/admin/features",
    label: "Feature Management",
    icon: ToggleLeftIcon
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: SettingsIcon
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isRouteActive = (route: typeof adminRoutes[0]) => {
    if (route.exact) {
      return pathname === route.href;
    }
    return pathname.startsWith(route.href);
  };

  return (
    <nav className="space-y-2 sticky top-4">
      {adminRoutes.map((route) => {
        const isActive = isRouteActive(route);
        const Icon = route.icon;

        return (
          <Link
            key={route.href}
            href={route.href}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-300 group hover:bg-gradient-to-r hover:from-cyber-pink/30 hover:to-cyber-cyan/30
              ${isActive ? 'text-white bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10' : 'text-foreground/60'}
            `}
          >
            <div className="relative z-10 flex items-center gap-3">
              <Icon className={`w-5 h-5 transition-colors duration-300
                ${isActive ? 'text-cyber-pink' : 'group-hover:text-cyber-cyan'}`}
              />
              <span className="font-medium">{route.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
} 