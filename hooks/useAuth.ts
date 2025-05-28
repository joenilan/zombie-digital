import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

export function useAuth() {
  const { initialize, ...authState } = useAuthStore()

  useEffect(() => {
    // Auto-initialize on first use
    if (!authState.isInitialized && !authState.isLoading) {
      initialize()
    }
  }, [initialize, authState.isInitialized, authState.isLoading])

  return authState
} 