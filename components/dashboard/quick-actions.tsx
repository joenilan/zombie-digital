"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { useFeatureAccess } from '@/hooks/use-feature-access'
import type { TwitchUser } from '@/types/auth'

interface QuickActionsProps {
  username?: string
  user?: TwitchUser | null
}

interface Action {
  title: string
  href: string | ((username: string) => string)
  icon: string
  description: string
  requiresUsername?: boolean
  external?: boolean
  requiresCanvasAccess?: boolean
  badge?: string
  featureId?: string
}

const actions: Action[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "📊",
    description: "View your dashboard"
  },
  {
    title: "Social Links",
    href: "/dashboard/social-links",
    icon: "🔗",
    description: "Manage your links",
    featureId: "SOCIALS"
  },
  {
    title: "Canvas",
    href: "/dashboard/canvas",
    icon: "🎨",
    description: "Configure your stream canvas",
    requiresUsername: false,
    requiresCanvasAccess: true,
    badge: "Alpha",
    featureId: "CANVAS"
  }
]

export function QuickActions({ username, user }: QuickActionsProps) {
  const pathname = usePathname();
  const { hasCanvasAccess, isLoading } = useUserRole(user || null);
  const { hasFeatureAccess, isLoading: featuresLoading } = useFeatureAccess(user || null);

  return (
    <div className="bg-glass rounded-xl shadow-glass p-6 transition-all duration-300 hover:shadow-cyber">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-4">
        {actions.map((action) => {
          if (action.requiresUsername && !username) return null;
          if (action.featureId && (!hasFeatureAccess(action.featureId) || featuresLoading)) return null;
          if (action.requiresCanvasAccess && (!hasFeatureAccess('CANVAS') || featuresLoading)) return null;

          const href = typeof action.href === 'function'
            ? action.href(username!)
            : action.href;

          const isActive = !action.external && pathname === action.href;

          const LinkComponent = action.external ? 'a' : Link;

          return (
            <LinkComponent
              key={action.title}
              href={href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${isActive
                ? "bg-glass-dark shadow-cyber-hover border border-cyber-purple/30"
                : "bg-background/20 hover:bg-background/30"
                }`}
            >
              <span className="text-xl">{action.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{action.title}</h3>
                  {action.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </LinkComponent>
          );
        })}
      </div>
    </div>
  )
} 