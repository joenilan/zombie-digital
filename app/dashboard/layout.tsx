import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/utils/permissions';
import { SideNav } from '@/components/dashboard/side-nav'
import { QuickActions } from '@/components/dashboard/quick-actions'
import ContentTransition from '@/components/dashboard/ContentTransition'

export default async function DashboardLayout({
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

  const provider_id = session.user.user_metadata?.sub || 
                     session.user.user_metadata?.provider_id;

  const { data: user } = await supabase
    .from('twitch_users')
    .select()
    .eq('twitch_id', provider_id)
    .single();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-ethereal-dark px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-cyber-gradient">
            Dashboard
          </h1>
        </div>
        <SideNav user={user} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-last lg:order-first">
            <QuickActions username={user.username} />
          </div>
          <div className="lg:col-span-3 order-first lg:order-last">
            <ContentTransition>
              {children}
            </ContentTransition>
          </div>
        </div>
      </div>
    </div>
  );
} 