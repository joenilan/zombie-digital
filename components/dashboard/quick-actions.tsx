"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface QuickActionsProps {
  username?: string
}

interface Action {
  title: string
  href: string | ((username: string) => string)
  icon: string
  description: string
  requiresUsername?: boolean
  external?: boolean
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
    description: "Manage your links"
  },
  {
    title: "Canvas",
    href: "/dashboard/canvas",
    icon: "🎨",
    description: "Configure your stream canvas",
    requiresUsername: false
  }
]

export function QuickActions({ username }: QuickActionsProps) {
  const pathname = usePathname();
  
  return (
    <div className="bg-glass rounded-xl shadow-glass p-6 transition-all duration-300 hover:shadow-cyber">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-4">
        {actions.map((action) => {
          if (action.requiresUsername && !username) return null;
          
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
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? "bg-glass-dark shadow-cyber-hover border border-cyber-purple/30" 
                  : "bg-background/20 hover:bg-background/30"
              }`}
            >
              <span className="text-xl">{action.icon}</span>
              <div>
                <h3 className="font-medium">{action.title}</h3>
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