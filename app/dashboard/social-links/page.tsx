import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SocialLinksManager, type SocialLink } from '@/components/social-links-manager'
import { redirect } from 'next/navigation'

export default async function SocialLinksPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const provider_id = session.user.user_metadata?.sub || 
                     session.user.user_metadata?.provider_id

  // Get the correct user_id from twitch_users
  const { data: twitchUser } = await supabase
    .from('twitch_users')
    .select()
    .eq('twitch_id', provider_id)
    .single()

  if (!twitchUser) {
    redirect('/login')
  }

  // Get social tree links with the correct user_id
  const { data: links } = await supabase
    .from('social_tree')
    .select('*')
    .eq('user_id', twitchUser.id)
    .order('order_index', { ascending: true })

  return (
    <div className="bg-glass rounded-xl shadow-glass p-6 transition-all duration-300 hover:shadow-cyber">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Social Links</h1>
          <p className="text-muted-foreground">
            Manage your social media links that appear on your profile.
          </p>
        </div>
        <SocialLinksManager 
          initialLinks={links as SocialLink[]} 
          twitchUserId={twitchUser.id}
        />
      </div>
    </div>
  )
} 