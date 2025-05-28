import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import PageTransitionLayout from '@/components/PageTransitionLayout'
import { RealtimeLinks } from './realtime-links'
import { BackgroundUpload } from '@/components/background-upload'
import { RealtimeBackground } from './realtime-background'
import { ShareButton } from './share-button'
import { ViewTracker } from './view-tracker'
import { OwnershipChecker } from './ownership-checker'

// Force dynamic rendering since we use cookies to check session state
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    username: string
  }
  searchParams: {
    transparent?: string
  }
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { username } = params
  const isTransparent = searchParams.transparent === 'true'

  // Get user data from public_profiles view (no auth needed) - pure database query
  const { data: profile, error: profileError } = await supabase
    .from('public_profiles')
    .select(`
      user_id,
      username,
      display_name,
      profile_image_url,
      description,
      created_at,
      background_media_url,
      background_media_type,
      twitch_id
    `)
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get public social links (no auth needed) - pure database query
  const { data: initialLinks, error: linksError } = await supabase
    .from('social_tree')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('order_index', { ascending: true })

  return (
    <div className={`min-h-screen py-12 px-4 ${isTransparent ? 'bg-transparent' : ''}`}>
      {/* Client-side ownership checker and conditional rendering */}
      <OwnershipChecker
        profileUserId={profile.user_id}
        username={username}
        profile={profile}
        initialLinks={initialLinks || []}
        isTransparent={isTransparent}
      />
    </div>
  )
}
