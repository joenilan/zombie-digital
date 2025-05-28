"use client";

import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Search, SortAsc, SortDesc, Eye, EyeOff, MoreHorizontal, ChevronLeft, ChevronRight } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminUsersStore, type Role, type SortField, type SortDirection, type PageSize } from "@/stores/useAdminUsersStore";

interface TwitchUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  site_role: Role;
  created_at: string;
  last_sign_in_at: string;
}

function SensitiveInfo({ text }: { text: string }) {
  const { isVisible, setIsVisible } = useAdminUsersStore()

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

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', sortField, sortDirection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twitch_users')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      return data as TwitchUser[];
    }
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update to the new value
      queryClient.setQueryData(['users'], (old: TwitchUser[] | undefined) => {
        if (!old) return old;
        return old.map(user =>
          user.id === newData.userId
            ? { ...user, site_role: newData.role as Role }
            : user
        );
      });

      toast.loading('Updating role...');

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(`Role updated to ${data.role}`);
    },
    onError: (error: any, newData, context) => {
      // Rollback to the previous value if there's an error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.dismiss();
      toast.error(`Failed to update role: ${error.message}`);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our optimistic update is correct
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handlePageSizeChange = (value: string) => {
    if (value === 'all') {
      setPageSize('all');
    } else {
      setPageSize(Number(value) as Exclude<PageSize, 'all'>);
    }
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
                  {size === 'all' ? 'All' : size} entries
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
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {totalPages > 7 ? (
              // Show truncated page numbers for large sets
              <div className="flex items-center gap-1">
                {[
                  1,
                  currentPage - 1,
                  currentPage,
                  currentPage + 1,
                  totalPages
                ].filter((page, index, array) =>
                  page > 0 &&
                  page <= totalPages &&
                  array.indexOf(page) === index
                ).map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-white/5'
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              // Show all page numbers for small sets
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-white/5'
                    }`}
                >
                  {page}
                </button>
              ))
            )}
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-white/5"
                onClick={() => updateSort('display_name')}
              >
                Display Name
                {sortField === 'display_name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
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
                  <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.display_name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <SensitiveInfo text={user.email} />
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
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'user' })}
                          disabled={user.site_role === 'user'}
                        >
                          Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'moderator' })}
                          disabled={user.site_role === 'moderator'}
                        >
                          Set as Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}
                          disabled={user.site_role === 'admin'}
                        >
                          Set as Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 