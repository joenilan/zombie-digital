import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });

  // Get total user count
  const { count: userCount } = await supabase
    .from('twitch_users')
    .select('*', { count: 'exact', head: true });

  // Get total active notifications
  const { count: notificationCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">System statistics and quick actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>Users</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount || 0}</p>
            <p className="text-sm text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Active Notifications</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{notificationCount || 0}</p>
            <p className="text-sm text-muted-foreground">Currently active notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>System Status</CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm">All systems operational</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 