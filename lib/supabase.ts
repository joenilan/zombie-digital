import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Single Supabase client instance to prevent conflicts
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

// Export the client for convenience
export const supabase = getSupabaseClient() 