"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";

interface NotificationForm {
  message: string;
  type: "info" | "warning" | "error" | "success";
  showOnlyToAuth: boolean;
  expiresAt?: Date | null;
}

interface Notification extends NotificationForm {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset } = useForm<NotificationForm>({
    defaultValues: {
      message: "",
      type: "info",
      showOnlyToAuth: false,
      expiresAt: null
    }
  });

  // Get the current user's Twitch ID when component mounts
  useEffect(() => {
    async function getTwitchUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Auth Session:', session?.user);

        if (session?.user) {
          // Get the user's Twitch ID from the session metadata
          const twitchId = session.user.user_metadata?.provider_id;
          console.log('Looking up user with Twitch ID:', twitchId);

          // Find user by Twitch ID
          const { data: twitchUser, error } = await supabase
            .from('twitch_users')
            .select('*')
            .eq('twitch_id', twitchId)
            .single();

          if (error) {
            console.error('Error finding user:', error);
            return;
          }

          if (twitchUser) {
            console.log('Found user by Twitch ID:', twitchUser);
            setUserId(twitchUser.id);
          } else {
            console.error('No matching Twitch user found for ID:', twitchId);
            toast.error('User not properly authenticated');
          }
        } else {
          console.error('No session found');
          toast.error('Please sign in');
        }
      } catch (error) {
        console.error('Error in getTwitchUser:', error);
        toast.error('Error getting user data');
      }
    }

    getTwitchUser();
  }, [supabase]);

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (notification: NotificationForm) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }

      console.log('Creating notification with:', {
        ...notification,
        createdBy: userId
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          message: notification.message,
          type: notification.type,
          showOnlyToAuth: notification.showOnlyToAuth,
          expiresAt: notification.expiresAt,
          createdBy: userId,
          active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully created notification:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created');
      reset();
    },
    onError: (error: any) => {
      console.error('Detailed error:', error);
      toast.error(error.message || 'Failed to create notification');
    }
  });

  const onSubmit = (data: NotificationForm) => {
    if (!userId) {
      toast.error("Not authenticated");
      return;
    }
    createMutation.mutate(data);
  };

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete notification');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('notifications')
        .update({ active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification');
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification Management</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Message
          </label>
          <input
            type="text"
            {...register("message", { required: true })}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
            placeholder="Enter notification message..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type
          </label>
          <select
            {...register("type")}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("showOnlyToAuth")}
            className="rounded border-white/10"
          />
          <label className="text-sm font-medium">
            Show only to authenticated users
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Expires At (optional)
          </label>
          <input
            type="datetime-local"
            {...register("expiresAt")}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Notification'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Active Notifications</h2>
        {isLoading ? (
          <div>Loading notifications...</div>
        ) : notifications?.length === 0 ? (
          <div>No notifications found</div>
        ) : (
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg bg-background/50 border border-white/10 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      notification.type === 'info' ? 'bg-blue-500/20 text-blue-300' :
                      notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                      notification.type === 'error' ? 'bg-red-500/20 text-red-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {notification.type}
                    </span>
                    <span className="text-sm text-white/60">
                      {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="mt-1">{notification.message}</p>
                  {notification.expiresAt && (
                    <p className="text-sm text-white/60 mt-1">
                      Expires: {format(new Date(notification.expiresAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ 
                      id: notification.id, 
                      active: !notification.active 
                    })}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={notification.active ? 'Deactivate' : 'Activate'}
                  >
                    {notification.active ? <Check size={18} /> : <X size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this notification?')) {
                        deleteMutation.mutate(notification.id);
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 