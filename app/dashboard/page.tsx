import DashboardClient from './components/DashboardClient';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { StreamInfo } from '@/components/dashboard/stream-info'
import { Suspense } from 'react';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const provider_id = session.user.user_metadata?.sub || 
                     session.user.user_metadata?.provider_id;

  const { data: twitchUser } = await supabase
    .from('twitch_users')
    .select()
    .eq('twitch_id', provider_id)
    .single();

  if (!twitchUser) {
    return <div>No user data found</div>;
  }

  return (
    <div className="space-y-6">
      <Suspense>
        <StreamInfo user={twitchUser} />
        <DashboardClient user={twitchUser} />
      </Suspense>
    </div>
  );
} 