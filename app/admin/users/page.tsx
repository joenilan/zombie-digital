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
import { Shield, ShieldAlert, ShieldCheck, User, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TwitchUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  site_role: "owner" | "admin" | "moderator" | "user";
  created_at: string;
  last_sign_in_at: string;
}

type Role = "owner" | "admin" | "moderator" | "user";
type SortField = 'display_name' | 'username' | 'created_at' | 'last_sign_in_at';
type SortDirection = 'asc' | 'desc';
type PageSize = 5 | 10 | 25 | 50 | 100 | 'all';

const roleConfig: Record<Role, { icon: any; color: string }> = {
  owner: { icon: ShieldCheck, color: "text-yellow-500" },
  admin: { icon: ShieldAlert, color: "text-red-500" },
  moderator: { icon: Shield, color: "text-orange-500" },
  user: { icon: User, color: "text-gray-500" }
};

function SensitiveInfo({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={`transition-all duration-200 truncate ${
          isVisible ? "" : "blur-[4px] select-none"
        }`}
      >
        {text}
      </div>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        title={isVisible ? "Hide sensitive data" : "Show sensitive data"}
      >
        {isVisible ? (
          <EyeOff className="w-3 h-3 opacity-60" />
        ) : (
          <Eye className="w-3 h-3 opacity-60" />
        )}
      </button>
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

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

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
      console.log('Attempting role update:', { userId, role });
      
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
            onValueChange={(value) => {
              setPageSize(value === 'all' ? 'all' : Number(value) as PageSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100, 'all'].map((size) => (
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                      className={`
                        min-w-[32px] h-8 px-2 rounded-lg
                        ${currentPage === page ? 'bg-white/10' : 'hover:bg-white/5'}
                      `}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              // Show all page numbers for small sets
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      min-w-[32px] h-8 px-2 rounded-lg
                      ${currentPage === page ? 'bg-white/10' : 'hover:bg-white/5'}
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { field: 'display_name', label: 'Name' },
          { field: 'username', label: 'Username' },
          { field: 'created_at', label: 'Joined' },
          { field: 'last_sign_in_at', label: 'Last Sign In' },
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => {
              if (sortField === field) {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(field as SortField);
                setSortDirection('asc');
              }
            }}
            className={`
              flex items-center gap-2 px-3 py-1 rounded-lg text-sm
              transition-colors hover:bg-white/5
              ${sortField === field ? 'text-cyber-pink' : 'text-muted-foreground'}
            `}
          >
            {label}
            {sortField === field && (
              sortDirection === 'asc' ? 
                <SortAsc className="w-4 h-4" /> : 
                <SortDesc className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div>Loading users...</div>
      ) : !filteredUsers?.length ? (
        <div>No users found</div>
      ) : (
        <div className="grid gap-4">
          {paginatedUsers.map((user) => (
            <div 
              key={user.id}
              className="flex flex-col gap-4 p-4 bg-glass rounded-xl shadow-glass hover:shadow-cyber transition-all duration-300"
            >
              {/* User Info */}
              <div className="flex items-start gap-3">
                <Image
                  src={user.profile_image_url}
                  alt={user.display_name}
                  width={40}
                  height={40}
                  className="rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{user.display_name}</div>
                  <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
                  <div className="text-sm text-muted-foreground">
                    <SensitiveInfo text={user.email} />
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <div className="text-muted-foreground">Joined</div>
                  <div>{format(new Date(user.created_at), 'PP')}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Last Sign In</div>
                  <div>{format(new Date(user.last_sign_in_at), 'PP')}</div>
                </div>
              </div>

              {/* Role Management */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <Badge variant={
                  user.site_role === 'owner' ? 'default' :
                  user.site_role === 'admin' ? 'destructive' :
                  user.site_role === 'moderator' ? 'warning' :
                  'secondary'
                }>
                  {user.site_role}
                </Badge>

                {user.site_role !== 'owner' && (
                  <Select
                    value={user.site_role}
                    onValueChange={(newRole) => {
                      console.log('Role change requested:', newRole);
                      updateRoleMutation.mutate({ 
                        userId: user.id, 
                        role: newRole 
                      });
                    }}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {React.createElement(roleConfig[user.site_role as Role].icon, {
                            className: `w-4 h-4 ${roleConfig[user.site_role as Role].color}`
                          })}
                          <span>{updateRoleMutation.isPending ? 'Updating...' : user.site_role}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {["admin", "moderator", "user"].map((role) => (
                        <SelectItem 
                          key={role} 
                          value={role}
                          disabled={updateRoleMutation.isPending}
                        >
                          <div className="flex items-center gap-2">
                            {React.createElement(roleConfig[role as Role].icon, {
                              className: `w-4 h-4 ${roleConfig[role as Role].color}`
                            })}
                            <span>{role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your criteria
        </div>
      )}
    </div>
  );
} 