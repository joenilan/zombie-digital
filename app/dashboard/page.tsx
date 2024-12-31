import DashboardClient from './components/DashboardClient';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { StreamInfo } from '@/components/dashboard/stream-info'
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirect } from 'next/navigation';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Session error:', sessionError);
    redirect('/auth/signin');
  }

  if (!session) {
    redirect('/auth/signin');
  }

  const provider_id = session.user.user_metadata?.sub || 
                     session.user.user_metadata?.provider_id;

  const { data: twitchUser, error: twitchError } = await supabase
    .from('twitch_users')
    .select()
    .eq('twitch_id', provider_id)
    .single();

  if (twitchError) {
    console.error('Twitch user error:', twitchError);
    redirect('/auth/signin');
  }

  if (!twitchUser) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSpinner text="Loading stream info..." />}>
        <StreamInfo user={twitchUser} />
      </Suspense>
      <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
        <DashboardClient user={twitchUser} />
      </Suspense>
    </div>
  );
} 