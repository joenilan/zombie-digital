import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PageTransitionLayout from '@/components/PageTransitionLayout'
import { RealtimeLinks } from './realtime-links'

interface PageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { username } = params

  // Get the current user's session
  const { data: { session } } = await supabase.auth.getSession()

  // Get public profile data
  const { data: profile, error: profileError } = await supabase
    .from('public_profiles')
    .select(`
      username,
      display_name,
      profile_image_url,
      description,
      created_at,
      user_id
    `)
    .eq('username', username)
    .single()

  // Log the results to help debug
  console.log('Username searched:', username)
  console.log('Profile data:', profile)
  console.log('Profile error:', profileError)

  if (!profile) {
    console.log('Profile not found, redirecting to 404')
    notFound()
  }

  // Add debug logs for ownership check AFTER we have the profile
  console.log('Current user ID:', session?.user?.id)
  console.log('Profile user_id:', profile.user_id)
  console.log('Is owner?:', session?.user?.id === profile.user_id)

  // Get public social links
  const { data: initialLinks, error: linksError } = await supabase
    .from('social_tree')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('order_index', { ascending: true })

  console.log('Social links:', initialLinks)
  console.log('Links error:', linksError)

  // Check if the current user is the profile owner
  const isOwner = session?.user?.id === profile.user_id

  return (
    <PageTransitionLayout>
      <div className="min-h-screen bg-ethereal-dark py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-cyan animate-pulse blur-xl opacity-50"></div>
              <Image
                src={profile.profile_image_url}
                alt={profile.display_name}
                width={130}
                height={130}
                className="rounded-full relative border-4 border-background/50"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink to-cyber-cyan">
              {profile.display_name}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">@{profile.username}</p>
            {profile.description && (
              <p className="text-muted-foreground max-w-lg">
                {profile.description}
              </p>
            )}
          </div>

          {/* Social Links with Realtime Updates */}
          <RealtimeLinks 
            userId={profile.user_id} 
            initialLinks={initialLinks || []} 
            isOwner={isOwner}
          />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground/60 pt-8">
            <p>Powered by Twitch App</p>
          </div>
        </div>
      </div>
    </PageTransitionLayout>
  )
}
