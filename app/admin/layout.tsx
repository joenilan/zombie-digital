import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './components/AdminSidebar';

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

  if (DEBUG) {
    console.log('Session:', {
      session,
      user: session?.user,
      email: session?.user?.email
    });
  }

  if (!session) {
    redirect('/');
  }

  // Get user's role from twitch_users table
  const { data: user, error } = await supabase
    .from("twitch_users")
    .select("*")
    .eq("twitch_id", session.user.user_metadata.provider_id)
    .single();

  if (DEBUG) {
    console.log('User lookup:', {
      user,
      error,
      twitchId: session.user.user_metadata.provider_id,
      site_role: user?.site_role
    });
  }

  if (!user || !['owner', 'admin'].includes(user.site_role)) {
    if (DEBUG) {
      console.log('Access denied:', {
        hasUser: !!user,
        role: user?.site_role,
        isAllowed: user ? ['owner', 'admin'].includes(user.site_role) : false
      });
    }
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-ethereal-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1">
            <div className="ethereal-card">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 