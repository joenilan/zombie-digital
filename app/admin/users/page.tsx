"use client";

import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart4,
  UserCircle,
  Settings,
  Calendar,
  ArrowUpRight,
  RefreshCcw,
  MoreHorizontal,
  X,
  ExternalLink,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminUsersStore, type Role, type SortField, type SortDirection, type PageSize } from "@/stores/useAdminUsersStore";
import dynamic from 'next/dynamic'

interface TwitchUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  site_role: Role;
  created_at: string;
  last_sign_in_at: string;
  twitch_id: string;
}

interface UserStats {
  socialLinksCount: number;
  profileViews: number;
  lastActivity: string;
  accountAge: number;
}

// Dynamic import for heavy analytics component
const UserAnalyticsDynamic = dynamic(() => import('@/components/user-analytics').then(mod => ({ default: mod.UserAnalytics })), {
  loading: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-glass/50 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-glass/50 animate-pulse rounded-xl" />
    </div>
  ),
  ssr: false
})

// Individual user email visibility component
function SensitiveInfo({ text, userId }: { text: string; userId: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className={isVisible ? "" : "blur-sm select-none"}>
        {isVisible ? text : "••••••••"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-6 w-6 p-0"
      >
        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </Button>
    </div>
  );
}

// User analytics dialog component
function UserAnalyticsDialog({ user }: { user: TwitchUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                   hover:from-cyber-pink/10 hover:to-cyber-cyan/10 transition-all duration-200 group cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 
                        group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-200">
            <BarChart4 className="h-4 w-4" />
          </div>
          <span className="font-medium">View Analytics</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={user.profile_image_url || '/placeholder-avatar.png'}
                alt={user.display_name}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">{user.display_name}</div>
              <div className="text-sm text-muted-foreground">@{user.username}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <UserAnalyticsDynamic
            userId={user.twitch_id}
            username={user.username}
            websiteId="fffd9866-0f93-4330-b588-08313c1a1af9"
            initialDays={30}
            isAdminView={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User details dialog component
function UserDetailsDialog({ user, userStats }: { user: TwitchUser; userStats?: UserStats }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                   hover:from-cyber-pink/10 hover:to-cyber-cyan/10 transition-all duration-200 group cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 
                        group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-200">
            <UserCircle className="h-4 w-4" />
          </div>
          <span className="font-medium">View Details</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={user.profile_image_url || '/placeholder-avatar.png'}
                alt={user.display_name}
                width={50}
                height={50}
                className="rounded-full"
              />
            </div>
            <div>
              <div className="text-xl font-semibold">{user.display_name}</div>
              <div className="text-sm text-muted-foreground">@{user.username}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <SensitiveInfo text={user.email} userId={user.id} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <Badge variant={
                      user.site_role === 'owner' ? 'warning' :
                        user.site_role === 'admin' ? 'destructive' :
                          user.site_role === 'moderator' ? 'default' :
                            'secondary'
                    }>
                      {user.site_role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{format(new Date(user.created_at), 'PPP')}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'PPP') : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-glass/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyber-pink">{userStats.socialLinksCount}</div>
                    <div className="text-sm text-muted-foreground">Social Links</div>
                  </div>
                  <div className="text-center p-4 bg-glass/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyber-cyan">{userStats.profileViews}</div>
                    <div className="text-sm text-muted-foreground">Profile Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/${user.username}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/dashboard/social-links`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Social Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const supabaseAdmin = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export default function UsersPage() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const {
    search,
    sortField,
    sortDirection,
    roleFilter,
    currentPage,
    pageSize,
    setSearch,
    setSortField,
    setSortDirection,
    setRoleFilter,
    setCurrentPage,
    setPageSize,
    updateSort
  } = useAdminUsersStore()

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', sortField, sortDirection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twitch_users')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      return data as TwitchUser[];
    }
  });

  // Fetch user stats for enhanced info
  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      if (!users) return {};

      const stats: Record<string, UserStats> = {};

      // Get social links count for each user
      const { data: socialLinksData } = await supabase
        .from('social_tree')
        .select('user_id');

      // Get profile views for each user
      const { data: profileViewsData } = await supabase
        .from('profile_views')
        .select('user_id, view_count');

      // Process stats for each user
      users.forEach(user => {
        const socialLinksCount = socialLinksData?.filter(link => link.user_id === user.id).length || 0;
        const profileViews = profileViewsData?.find(view => view.user_id === user.id)?.view_count || 0;

        stats[user.id] = {
          socialLinksCount,
          profileViews,
          lastActivity: user.last_sign_in_at || user.created_at,
          accountAge: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
        };
      });

      return stats;
    },
    enabled: !!users
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(user => {
      const matchesSearch = search.toLowerCase() === '' ||
        user.display_name.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.site_role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const paginatedUsers = useMemo(() => {
    if (pageSize === 'all') return filteredUsers;

    const startIndex = (currentPage - 1) * Number(pageSize);
    return filteredUsers.slice(startIndex, startIndex + Number(pageSize));
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.ceil(filteredUsers.length / Number(pageSize));
  }, [filteredUsers.length, pageSize]);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      }).then(res => res.json());

      if (error) throw error;
      return data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });
      const previousUsers = queryClient.getQueryData(['admin-users']);

      queryClient.setQueryData(['admin-users'], (old: TwitchUser[] | undefined) => {
        if (!old) return old;
        return old.map(user =>
          user.id === newData.userId
            ? { ...user, site_role: newData.role as Role }
            : user
        );
      });

      toast.loading('Updating role...');
      return { previousUsers };
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(`Role updated to ${data.role}`);
    },
    onError: (error: any, newData, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['admin-users'], context.previousUsers);
      }
      toast.dismiss();
      toast.error(`Failed to update role: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const handlePageSizeChange = (value: string) => {
    if (value === 'all') {
      setPageSize('all');
    } else {
      setPageSize(Number(value) as Exclude<PageSize, 'all'>);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-brand">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive user account management with analytics and detailed insights
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyber-pink/10 text-cyber-pink">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {users?.filter(u => u.site_role === 'admin').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {users?.filter(u => u.last_sign_in_at &&
                    new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active (7d)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(userStats || {}).reduce((sum, stats) => sum + stats.profileViews, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, username, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as Role | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100, 'all'].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size === 'all' ? 'All' : size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {pageSize === 'all' ? 'all' : `${Math.min(((currentPage - 1) * Number(pageSize)) + 1, filteredUsers.length)}-${Math.min(currentPage * Number(pageSize), filteredUsers.length)}`} of {filteredUsers.length} entries
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))
            ) : (
              <div className="flex items-center gap-1">
                {[1, currentPage - 1, currentPage, currentPage + 1, totalPages]
                  .filter((page, index, array) =>
                    page > 0 && page <= totalPages && array.indexOf(page) === index
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => updateSort('username')}
                >
                  Username
                  {sortField === 'username' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => updateSort('created_at')}
                >
                  Created
                  {sortField === 'created_at' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-white/10 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.profile_image_url || '/placeholder-avatar.png'}
                          alt={user.display_name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium">{user.display_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-glass/20 px-2 py-1 rounded">
                        @{user.username}
                      </code>
                    </TableCell>
                    <TableCell>
                      <SensitiveInfo text={user.email} userId={user.id} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.site_role === 'owner' ? 'warning' :
                          user.site_role === 'admin' ? 'destructive' :
                            user.site_role === 'moderator' ? 'default' :
                              'secondary'
                      }>
                        {user.site_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userStats?.[user.id] && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-cyber-cyan" />
                            <span>{userStats[user.id].profileViews}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-cyber-pink" />
                            <span>{userStats[user.id].socialLinksCount}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {userStats?.[user.id]?.accountAge} days ago
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full bg-glass/30 backdrop-blur-xl border border-white/10 
                                     hover:bg-glass/50 hover:border-white/20 transition-all duration-300 
                                     hover:shadow-glass group"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-64 bg-cyber-darker/95 backdrop-blur-xl border border-white/20 
                                   rounded-xl shadow-cyber overflow-hidden p-0"
                        >
                          {/* User Info Header */}
                          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyber-pink/5 to-cyber-cyan/5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Image
                                  src={user.profile_image_url || '/placeholder-avatar.png'}
                                  alt={user.display_name}
                                  width={40}
                                  height={40}
                                  className="rounded-full border-2 border-white/20"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.display_name}</p>
                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                <div className="mt-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                    ${user.site_role === 'owner' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30' :
                                      user.site_role === 'admin' ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30' :
                                        user.site_role === 'moderator' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30' :
                                          'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30'}`}>
                                    {user.site_role}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <UserDetailsDialog user={user} userStats={userStats?.[user.id]} />
                            <UserAnalyticsDialog user={user} />

                            {/* Separator */}
                            <div className="my-2 mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                            <DropdownMenuItem
                              onClick={() => window.open(`/${user.username}`, '_blank')}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                                       hover:from-cyber-pink/10 hover:to-cyber-cyan/10 transition-all duration-200 group cursor-pointer"
                            >
                              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 
                                            group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-200">
                                <ExternalLink className="h-4 w-4" />
                              </div>
                              <span className="font-medium">View Profile</span>
                            </DropdownMenuItem>

                            {/* Separator */}
                            <div className="my-2 mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                            <DropdownMenuItem
                              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'user' })}
                              disabled={user.site_role === 'user'}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                                       hover:from-gray-500/10 hover:to-slate-500/10 transition-all duration-200 group cursor-pointer
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="p-1.5 rounded-lg bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 
                                            group-hover:from-gray-500/30 group-hover:to-slate-500/30 transition-all duration-200">
                                <UserCircle className="h-4 w-4" />
                              </div>
                              <span className="font-medium">Set as User</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'moderator' })}
                              disabled={user.site_role === 'moderator'}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                                       hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-200 group cursor-pointer
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 
                                            group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-200">
                                <Settings className="h-4 w-4" />
                              </div>
                              <span className="font-medium">Set as Moderator</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}
                              disabled={user.site_role === 'admin'}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gradient-to-r 
                                       hover:from-red-500/10 hover:to-pink-500/10 transition-all duration-200 group cursor-pointer
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 
                                            group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-200">
                                <Settings className="h-4 w-4" />
                              </div>
                              <span className="font-medium">Set as Admin</span>
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 