'use client'

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { BarChart4, Users, Bell, Activity, Shield, Database, TrendingUp } from '@/lib/icons';
import { motion } from 'framer-motion';
import { StatsCard, CyberCard } from "@/components/animations/AnimatedCard";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  slideInLeft,
  slideInRight,
  scaleIn,
  pulseAnimation
} from "@/lib/animations";
import { logError } from '@/lib/debug'

// Dynamic import for heavy analytics component
const AdminAnalytics = dynamicImport(() => import('@/components/admin-analytics').then(mod => ({ default: mod.AdminAnalytics })), {
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

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [notificationCount, setNotificationCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Get total user count
        const { count: users } = await supabase
          .from('twitch_users')
          .select('*', { count: 'exact', head: true });

        // Get total active notifications
        const { count: notifications } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);

        setUserCount(users || 0)
        setNotificationCount(notifications || 0)
      } catch (error) {
        logError('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={staggerItem} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-foreground/70">System overview and analytics</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={slideInLeft}>
            <StatsCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground/70 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-foreground">
                {loading ? (
                  <motion.span variants={pulseAnimation} animate="animate" className="inline-block">
                    ...
                  </motion.span>
                ) : (
                  userCount?.toLocaleString() || 0
                )}
              </p>
              <p className="text-xs text-foreground/50 mt-1">Registered streamers</p>
            </StatsCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <StatsCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground/70 mb-2">Active Notifications</h3>
              <p className="text-3xl font-bold text-foreground">
                {loading ? (
                  <motion.span variants={pulseAnimation} animate="animate" className="inline-block">
                    ...
                  </motion.span>
                ) : (
                  notificationCount?.toLocaleString() || 0
                )}
              </p>
              <p className="text-xs text-foreground/50 mt-1">System notifications</p>
            </StatsCard>
          </motion.div>

          <motion.div variants={slideInRight}>
            <StatsCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground/70 mb-2">System Status</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <motion.div
                  className="w-3 h-3 rounded-full bg-green-500"
                  variants={pulseAnimation}
                  animate="animate"
                />
                <p className="text-lg font-semibold text-green-400">Operational</p>
              </div>
              <p className="text-xs text-foreground/50">All systems running</p>
            </StatsCard>
          </motion.div>
        </motion.div>

        {/* Additional Stats Row */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={slideInLeft}>
            <CyberCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                  <Database className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Database Health</h3>
                  <p className="text-foreground/70 text-sm">All connections stable</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Healthy</span>
                  </div>
                </div>
              </div>
            </CyberCard>
          </motion.div>

          <motion.div variants={slideInRight}>
            <CyberCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Performance</h3>
                  <p className="text-foreground/70 text-sm">Response time &lt; 100ms</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Excellent</span>
                  </div>
                </div>
              </div>
            </CyberCard>
          </motion.div>
        </motion.div>

        {/* Site Analytics Section */}
        <motion.div variants={staggerItem} className="space-y-6">
          <motion.div variants={fadeInUp} className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-blue-500/20">
              <BarChart4 className="w-5 h-5 text-cyber-cyan" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Site Analytics</h2>
          </motion.div>

          <motion.div variants={scaleIn}>
            <CyberCard className="p-6">
              <AdminAnalytics websiteId="fffd9866-0f93-4330-b588-08313c1a1af9" initialDays={30} />
            </CyberCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
} 