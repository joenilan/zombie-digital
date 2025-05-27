import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import PageTransitionLayout from '@/components/PageTransitionLayout'
import { RealtimeLinks } from './realtime-links'
import { BackgroundManager } from '@/components/background-manager'
import { RealtimeBackground } from './realtime-background'
import { ShareButton } from './share-button'
import { ViewTracker } from './view-tracker'

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

  // Get the current user's session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Get user data from public_profiles view
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

  // Get public social links
  const { data: initialLinks, error: linksError } = await supabase
    .from('social_tree')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('order_index', { ascending: true })

  // Check if the current user is the profile owner (handle missing session gracefully)
  const isOwner = !sessionError && session?.user?.id === profile.user_id

  return (
    <div className={`min-h-screen py-12 px-4 ${isTransparent ? 'bg-transparent' : ''}`}>
      {/* Track page view */}
      <ViewTracker userId={profile.user_id} />

      {/* Main Content Card */}
      <div className="max-w-2xl mx-auto relative">
        <div className={`${isTransparent ? '' : 'bg-background/20'} backdrop-blur-xl rounded-xl shadow-glass overflow-hidden border border-white/10`}>
          {/* Card Background */}
          <RealtimeBackground
            userId={profile.user_id}
            initialBackground={{
              url: profile.background_media_url,
              type: profile.background_media_type
            }}
          />

          {/* Glass Overlay */}
          <div className={`absolute inset-0 ${isTransparent ? 'bg-transparent' : 'bg-black/50 backdrop-blur-sm'}`} />

          {/* Content */}
          <div className="relative space-y-8 p-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full ${isTransparent ? '' : 'bg-gradient-to-r from-cyber-pink to-cyber-cyan animate-pulse blur-xl opacity-50'}`}></div>
                <Image
                  src={profile.profile_image_url}
                  alt={profile.display_name}
                  width={130}
                  height={130}
                  className={`rounded-full relative ${isTransparent ? '' : 'border-4 border-background/50'}`}
                  priority
                />
              </div>
              <h1 className={`text-4xl font-bold mb-2 ${isTransparent ? 'text-white' : 'bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink to-cyber-cyan'}`}>
                {profile.display_name}
              </h1>

              {/* Username and Share buttons container */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <p className="text-lg text-muted-foreground">@{profile.username}</p>

                {!isTransparent && (
                  <div className="flex items-center gap-2">
                    <ShareButton username={username} displayName={profile.display_name} />
                  </div>
                )}
              </div>

              {profile.description && (
                <p className="text-muted-foreground max-w-lg">
                  {profile.description}
                </p>
              )}
            </div>

            {/* Background Manager (only shown to profile owner) */}
            {isOwner && !isTransparent && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Profile Background</h2>
                <BackgroundManager
                  userId={profile.user_id}
                  currentBackground={{
                    url: profile.background_media_url,
                    type: profile.background_media_type
                  }}
                />
              </div>
            )}

            {/* Social Links */}
            <div>
              <RealtimeLinks
                userId={profile.user_id}
                initialLinks={initialLinks || []}
                isOwner={isOwner && !isTransparent}
              />
            </div>
          </div>
        </div>

        {/* Footer (outside the card) */}
        {!isTransparent && (
          <div className="text-center text-sm text-muted-foreground/60 pt-8">
            <p>
              Powered by{" "}
              <Link href="/" className="font-bold inline-flex items-center transition-all duration-300 hover:opacity-100 hover:text-foreground">
                <span className="gradient-brand">Zombie</span>
                <span className="text-foreground/80">.Digital</span>
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
