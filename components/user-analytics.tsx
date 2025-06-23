'use client'

import { useEffect, useState } from 'react'
import { umami } from '@/lib/umami'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Users, TrendingUp, Calendar, ExternalLink } from '@/lib/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface UserAnalyticsData {
    totalProfileViews: number
    uniqueVisitors: number
    dailyViews: Array<{ date: string; views: number; visitors: number }>
    recentViews: Array<{
        created_at: string
        referrer_domain?: string
        browser?: string
        os?: string
    }>
    topReferrers: Array<{ domain: string; count: number }>
}

interface UserAnalyticsProps {
    userId: string
    username: string
    websiteId?: string
    initialDays?: number
    isAdminView?: boolean
}

const DATE_RANGE_OPTIONS = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 }
]

export function UserAnalytics({ userId, username, websiteId, initialDays = 30, isAdminView }: UserAnalyticsProps) {
    const [data, setData] = useState<UserAnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDays, setSelectedDays] = useState(initialDays)

    useEffect(() => {
        async function fetchUserAnalytics() {
            try {
                setLoading(true)
                setError(null)

                await umami.initialize(websiteId)

                const startDate = new Date()
                startDate.setDate(startDate.getDate() - selectedDays)

                // Get all page views for this user's profile
                const allPageViews = await umami.getPageViews(websiteId, startDate)

                // Filter to only this user's profile views
                const userProfilePath = `/${username}`
                const profileViews = allPageViews?.filter(view =>
                    view.url_path === userProfilePath
                ) || []

                // Get unique visitors to this profile
                const uniqueSessionIds = new Set(profileViews.map(view => view.session_id))
                const uniqueVisitors = uniqueSessionIds.size

                // Generate daily data for charts
                const dailyData = new Map<string, { views: number; visitors: Set<string> }>()

                // Initialize all days with 0
                for (let i = 0; i < selectedDays; i++) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toISOString().split('T')[0]
                    dailyData.set(dateStr, { views: 0, visitors: new Set() })
                }

                // Count actual views and unique visitors per day for this profile
                profileViews.forEach(view => {
                    const dateStr = view.created_at.split('T')[0]
                    const dayData = dailyData.get(dateStr)
                    if (dayData) {
                        dayData.views += 1
                        dayData.visitors.add(view.session_id)
                    }
                })

                const dailyViews = Array.from(dailyData.entries())
                    .map(([date, data]) => ({
                        date,
                        views: data.views,
                        visitors: data.visitors.size
                    }))
                    .sort((a, b) => a.date.localeCompare(b.date))

                // Get recent views (last 10)
                const recentViews = profileViews
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)

                // Count referrers
                const referrerCounts = new Map<string, number>()
                profileViews.forEach(view => {
                    if (view.referrer_domain && view.referrer_domain !== 'localhost') {
                        referrerCounts.set(view.referrer_domain, (referrerCounts.get(view.referrer_domain) || 0) + 1)
                    }
                })

                const topReferrers = Array.from(referrerCounts.entries())
                    .map(([domain, count]) => ({ domain, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                setData({
                    totalProfileViews: profileViews.length,
                    uniqueVisitors,
                    dailyViews,
                    recentViews,
                    topReferrers
                })
            } catch (err) {
                console.error('Error fetching user analytics:', err)
                setError('Failed to load analytics data')
            } finally {
                setLoading(false)
            }
        }

        fetchUserAnalytics()
    }, [userId, username, websiteId, selectedDays])

    const handleDateRangeChange = (days: number) => {
        setSelectedDays(days)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Date Range Selector Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-glass rounded w-32 animate-pulse"></div>
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-9 bg-glass rounded w-16 animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} variant="glass">
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-glass rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-glass rounded w-3/4"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card variant="glass">
                <CardContent className="p-6 text-center">
                    <p className="text-red-400">{error}</p>
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return (
            <Card variant="glass">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No analytics data available</p>
                </CardContent>
            </Card>
        )
    }

    // Format date for chart display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Format time for recent views
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60))
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Date Range Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">
                        {isAdminView ? `Analytics for @${username}` : 'Profile Analytics'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isAdminView
                            ? `Detailed analytics for ${username}'s profile performance`
                            : 'Track your profile performance over time'
                        }
                    </p>
                </div>

                <div className="flex gap-2">
                    {DATE_RANGE_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={selectedDays === option.value ? "cyber-pink" : "outline"}
                            size="sm"
                            onClick={() => handleDateRangeChange(option.value)}
                            className={`transition-all duration-200 ${selectedDays === option.value
                                ? ''
                                : 'hover:bg-glass/40 hover:border-cyber-pink/50'
                                }`}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalProfileViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {selectedDays} days</p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {selectedDays} days</p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Daily Views</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(data.totalProfileViews / selectedDays).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Per day average</p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.totalProfileViews > 0
                                ? Math.round((data.uniqueVisitors / data.totalProfileViews) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Unique vs total views</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Views Over Time */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Profile Views Over Time</CardTitle>
                        <p className="text-sm text-muted-foreground">Daily views for the last {selectedDays} days</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.dailyViews}>
                                <defs>
                                    <linearGradient id="profileViewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    labelFormatter={(value) => formatDate(value as string)}
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                        border: '1px solid rgba(75, 85, 99, 0.3)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    fill="url(#profileViewsGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Unique Visitors Over Time */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Unique Visitors Over Time</CardTitle>
                        <p className="text-sm text-muted-foreground">Daily unique visitors for the last {selectedDays} days</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.dailyViews}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    labelFormatter={(value) => formatDate(value as string)}
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                        border: '1px solid rgba(75, 85, 99, 0.3)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Recent Profile Views</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {isAdminView
                                ? `Latest 10 visits to @${username}'s profile`
                                : 'Latest 10 visits to your profile'
                            }
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.recentViews.length > 0 ? (
                                data.recentViews.map((view, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-glass/20 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyber-pink"></div>
                                            <div>
                                                <p className="text-sm text-foreground">Profile viewed</p>
                                                <p className="text-xs text-foreground/60">
                                                    {view.referrer_domain && `from ${view.referrer_domain} • `}
                                                    {formatTime(view.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {view.browser && (
                                            <span className="text-xs text-muted-foreground bg-glass/20 px-2 py-1 rounded">
                                                {view.browser}
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No recent views</p>
                                    <p className="text-xs mt-1">
                                        {isAdminView
                                            ? `Views will appear here as people visit @${username}'s profile`
                                            : 'Views will appear here as people visit your profile'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Top Referrers</CardTitle>
                        <p className="text-sm text-muted-foreground">Where your traffic comes from</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topReferrers.length > 0 ? (
                                data.topReferrers.map((referrer, index) => (
                                    <div key={referrer.domain} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                            <div className="flex items-center gap-2">
                                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                                <span className="font-medium">{referrer.domain}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{referrer.count} views</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                    <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No external referrers</p>
                                    <p className="text-xs mt-1">Traffic sources will appear here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 