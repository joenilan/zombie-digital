import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic';

export default async function CanvasPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Get the user's metadata which includes Twitch information
  const { data: userData } = await supabase.auth.getUser()
  const twitchId = userData.user?.user_metadata?.provider_id

  // Get user's profile from the TwitchUser table using Twitch ID
  const { data: currentUser } = await supabase
    .from('twitch_users')
    .select('username')
    .eq('twitch_id', twitchId)
    .single()

  if (!currentUser?.username) {
    redirect('/dashboard')
  }

  // Redirect to the user's canvas page
  redirect(`/${currentUser.username}/canvas`)
} 