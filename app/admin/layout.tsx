import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from './components/AdminLayoutClient';

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic';

const DEBUG = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  // Get user's role from twitch_users table
  const twitchId = session.user.user_metadata.provider_id || session.user.user_metadata.sub;

  const { data: user, error } = await supabase
    .from("twitch_users")
    .select("*")
    .eq("twitch_id", twitchId)
    .single();

  if (!user || !['owner', 'admin'].includes(user.site_role)) {
    redirect('/unauthorized');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
} 