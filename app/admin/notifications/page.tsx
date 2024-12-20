"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface NotificationForm {
  message: string;
  type: "info" | "warning" | "error" | "success";
  showOnlyToAuth: boolean;
  expiresAt?: Date | null;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  const [newNotification, setNewNotification] = useState<NotificationForm>({
    message: "",
    type: "info",
    showOnlyToAuth: false,
    expiresAt: null
  });

  // Fetch active notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('active', true)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (notification: NotificationForm) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created');
      setNewNotification({
        message: "",
        type: "info",
        showOnlyToAuth: false,
        expiresAt: null
      });
    },
    onError: (error) => {
      toast.error('Failed to create notification');
      console.error('Error creating notification:', error);
    }
  });

  // Delete (deactivate) notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification removed');
    },
    onError: () => {
      toast.error('Failed to remove notification');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newNotification);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification Management</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Message
          </label>
          <input
            type="text"
            value={newNotification.message}
            onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
            placeholder="Enter notification message..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Type
            </label>
            <select
              value={newNotification.type}
              onChange={(e) => setNewNotification(prev => ({ 
                ...prev, 
                type: e.target.value as NotificationForm["type"]
              }))}
              className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Visibility
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newNotification.showOnlyToAuth}
                onChange={(e) => setNewNotification(prev => ({
                  ...prev,
                  showOnlyToAuth: e.target.checked
                }))}
                className="rounded border-white/10"
              />
              <span className="text-sm">Show only to authenticated users</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="ethereal-button"
        >
          Create Notification
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Notifications</h2>
        {isLoading ? (
          <p>Loading notifications...</p>
        ) : notifications?.length === 0 ? (
          <p className="text-muted-foreground">No active notifications</p>
        ) : (
          notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border flex items-center justify-between ${
                notification.type === "info" && "bg-blue-500/10 border-blue-500/20"
              } ${notification.type === "warning" && "bg-yellow-500/10 border-yellow-500/20"}
              ${notification.type === "error" && "bg-red-500/10 border-red-500/20"}
              ${notification.type === "success" && "bg-green-500/10 border-green-500/20"}`}
            >
              <div>
                <p>{notification.message}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.showOnlyToAuth ? "Authenticated users only" : "Public"}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(notification.id)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 