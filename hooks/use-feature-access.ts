import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUserRole } from './use-user-role'
import type { TwitchUser } from '@/types/auth'

export interface Feature {
  id: string
  feature_id: string
  name: string
  description: string
  path: string | null
  category: string
  icon: string | null
  enabled: boolean
  required_role: 'user' | 'moderator' | 'admin' | 'owner'
  sort_order: number
  user_has_access?: boolean
}

interface UseFeatureAccessReturn {
  features: Feature[]
  isLoading: boolean
  error: Error | null
  hasFeatureAccess: (featureId: string) => boolean
  getFeature: (featureId: string) => Feature | undefined
  getFeaturesByCategory: (category: string) => Feature[]
  refreshFeatures: () => Promise<void>
}

export function useFeatureAccess(user: TwitchUser | null): UseFeatureAccessReturn {
  console.log('[FeatureAccess] Hook called with user:', user)
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userRole } = useUserRole(user)
  const supabase = createClientComponentClient()

  const fetchFeatures = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('feature_states')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError

      // Calculate user access for each feature
      const featuresWithAccess = data?.map(feature => {
        const hasAccess = hasRoleAccess(userRole, feature.required_role) && feature.enabled
        return {
          ...feature,
          user_has_access: hasAccess
        }
      }) || []

      setFeatures(featuresWithAccess)
    } catch (err) {
      console.error('Error fetching features:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userRole !== null) {
      fetchFeatures()
    }
  }, [userRole, supabase])

  const hasRoleAccess = (userRole: string | null, requiredRole: string): boolean => {
    if (!userRole) {
      console.log('[FeatureAccess] No user role provided')
      return false
    }
    
    const roleHierarchy = {
      user: 1,
      moderator: 2,
      admin: 3,
      owner: 4
    }

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
    const hasAccess = userLevel >= requiredLevel

    console.log(`[FeatureAccess] Role check: ${userRole}(${userLevel}) >= ${requiredRole}(${requiredLevel}) = ${hasAccess}`)
    
    return hasAccess
  }

  const hasFeatureAccess = (featureId: string): boolean => {
    const feature = features.find(f => f.feature_id === featureId)
    const hasAccess = feature?.user_has_access || false
    console.log(`[FeatureAccess] Feature ${featureId}: ${hasAccess} (feature found: ${!!feature}, enabled: ${feature?.enabled})`)
    return hasAccess
  }

  const getFeature = (featureId: string): Feature | undefined => {
    return features.find(f => f.feature_id === featureId)
  }

  const getFeaturesByCategory = (category: string): Feature[] => {
    return features.filter(f => f.category === category && f.user_has_access)
  }

  const refreshFeatures = async () => {
    await fetchFeatures()
  }

  return {
    features: features.filter(f => f.user_has_access),
    isLoading,
    error,
    hasFeatureAccess,
    getFeature,
    getFeaturesByCategory,
    refreshFeatures
  }
} 