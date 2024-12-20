"use client";

import { Card } from "@/components/ui/card";
import { 
  UsersIcon, 
  BellIcon, 
  ActivityIcon,
  ShieldIcon,
  SettingsIcon 
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "Loading...",
    icon: UsersIcon,
    href: "/admin/users"
  },
  {
    label: "Active Notifications",
    value: "Loading...",
    icon: BellIcon,
    href: "/admin/notifications"
  },
  {
    label: "System Status",
    value: "Online",
    icon: ActivityIcon,
    href: "/admin/status"
  }
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application settings and users</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 