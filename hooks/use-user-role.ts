import { useEffect, useState } from 'react'
import type { TwitchUser } from '@/types/auth'

export type UserRole = 'user' | 'moderator' | 'admin' | 'owner'

interface UseUserRoleReturn {
  userRole: UserRole | null
  isAdmin: boolean
  isOwner: boolean
  isLoading: boolean
  hasCanvasAccess: boolean
}

export function useUserRole(user: TwitchUser | null): UseUserRoleReturn {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('[UserRole] User changed:', user)
    if (!user) {
      console.log('[UserRole] No user, setting role to null')
      setUserRole(null)
      setIsLoading(false)
      return
    }

    // Since we already have the user data with site_role, no need to fetch
    console.log('[UserRole] Setting role from user.site_role:', user.site_role)
    setUserRole(user.site_role as UserRole)
    setIsLoading(false)
  }, [user])

  const isAdmin = userRole === 'admin' || userRole === 'owner'
  const isOwner = userRole === 'owner'
  const hasCanvasAccess = isAdmin || isOwner

  console.log('[UserRole] Current state:', { userRole, isAdmin, isOwner, hasCanvasAccess })

  return {
    userRole,
    isAdmin,
    isOwner,
    isLoading,
    hasCanvasAccess
  }
} 