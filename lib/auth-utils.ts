import { supabase } from '@/lib/supabase'

export const authUtils = {
  async getCurrentSession() {
    return await supabase.auth.getSession()
  },

  async validateAndRefreshSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async signOut() {
    return await supabase.auth.signOut()
  }
} 