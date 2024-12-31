import DashboardClient from './components/DashboardClient';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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

  if (sessionError || !session) {
    redirect('/auth/signin');
  }

  const provider_id = session.user.user_metadata?.sub || 
                     session.user.user_metadata?.provider_id;

  const { data: twitchUser, error: twitchError } = await supabase
    .from('twitch_users')
    .select()
    .eq('twitch_id', provider_id)
    .single();

  if (twitchError || !twitchUser) {
    redirect('/auth/signin');
  }

  return (
    <Suspense 
      fallback={
        <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      }
    >
      <DashboardClient user={twitchUser} />
    </Suspense>
  );
} 