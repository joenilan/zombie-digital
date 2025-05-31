import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

const supabase = createClientComponentClient()

export interface AuthError {
  message: string
  status?: number
  code?: string
}

export class AuthErrorHandler {
  private static instance: AuthErrorHandler
  private isHandlingError = false

  static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler()
    }
    return AuthErrorHandler.instance
  }

  async handleAuthError(error: AuthError, context?: string): Promise<boolean> {
    // Prevent multiple simultaneous error handling
    if (this.isHandlingError) {
      return false
    }

    this.isHandlingError = true

    try {
      console.error(`[AuthErrorHandler] ${context || 'Auth error'}:`, error)

      // Check if this is a token-related error
      const isTokenError = 
        error.status === 401 || 
        error.status === 403 ||
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('invalid_refresh_token') ||
        error.message?.includes('JWT expired') ||
        error.message?.includes('Invalid JWT')

      if (isTokenError) {
        console.log('[AuthErrorHandler] Token error detected, attempting recovery')
        
        try {
          // Try to get a fresh session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session) {
            console.log('[AuthErrorHandler] No valid session, forcing sign out')
            await this.forceSignOut('Session expired or invalid')
            return true
          }

          // If we have a session, try to refresh it
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError || !refreshedSession) {
            console.log('[AuthErrorHandler] Session refresh failed, forcing sign out')
            await this.forceSignOut('Unable to refresh session')
            return true
          }

          console.log('[AuthErrorHandler] Session refreshed successfully')
          return false // Error was handled, no need for caller to handle
        } catch (refreshError) {
          console.error('[AuthErrorHandler] Error during session refresh:', refreshError)
          await this.forceSignOut('Authentication error')
          return true
        }
      }

      // For non-auth errors, let the caller handle them
      return false
    } finally {
      this.isHandlingError = false
    }
  }

  private async forceSignOut(reason: string): Promise<void> {
    try {
      console.log(`[AuthErrorHandler] Forcing sign out: ${reason}`)
      
      // Clear the session
      await supabase.auth.signOut()
      
      // Show user-friendly message
      toast.error('Session Expired', {
        description: 'Please sign in again to continue',
        duration: 5000,
      })

      // Redirect to sign in page after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'
        }
      }, 1000)
    } catch (signOutError) {
      console.error('[AuthErrorHandler] Error during forced sign out:', signOutError)
      // Force redirect even if sign out fails
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin'
      }
    }
  }

  // Helper method to check if an error is auth-related
  static isAuthError(error: any): boolean {
    return (
      error?.status === 401 || 
      error?.status === 403 ||
      error?.message?.includes('refresh_token_not_found') ||
      error?.message?.includes('invalid_refresh_token') ||
      error?.message?.includes('JWT expired') ||
      error?.message?.includes('Invalid JWT') ||
      error?.message?.includes('Session expired')
    )
  }
}

// Export singleton instance
export const authErrorHandler = AuthErrorHandler.getInstance()

// Helper function for easy use in components
export async function handleAuthError(error: any, context?: string): Promise<boolean> {
  if (!AuthErrorHandler.isAuthError(error)) {
    return false
  }
  
  return await authErrorHandler.handleAuthError(error, context)
} 