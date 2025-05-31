import { useAuthStore } from '@/stores/useAuthStore'

export function useAuth() {
  const authState = useAuthStore()
  return authState
} 