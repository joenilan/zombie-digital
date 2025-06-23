'use client'

import { useEffect, useState } from 'react'
import { umami } from '@/lib/umami'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Users, TrendingUp, Calendar } from '@/lib/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface AnalyticsData {
    totalPageViews: number
    uniqueVisitors: number
    profileViews: number
    topPages: Array<{ path: string; count: number }>
    dailyViews: Array<{ date: string; views: number; visitors: number }>
}

interface AdminAnalyticsProps {
    websiteId?: string
    initialDays?: number
}

const DATE_RANGE_OPTIONS = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 }
]

export function AdminAnalytics({ websiteId, initialDays = 30 }: AdminAnalyticsProps) {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDays, setSelectedDays] = useState(initialDays)

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true)
                setError(null)

                await umami.initialize(websiteId)

                const startDate = new Date()
                startDate.setDate(startDate.getDate() - selectedDays)

                const [pageViews, uniqueVisitors, topPages] = await Promise.all([
                    umami.getPageViews(websiteId, startDate),
                    umami.getUniqueVisitors(websiteId, startDate),
                    umami.getTopPages(websiteId, startDate, undefined, 10)
                ])

                // Count profile views from page views
                const profileViews = pageViews?.filter(view =>
                    view.url_path && view.url_path.match(/^\/[^\/]+$/) && view.url_path !== '/'
                ).length || 0

                // Generate daily data for charts
                const dailyData = new Map<string, { views: number; visitors: Set<string> }>()

                // Initialize all days with 0
                for (let i = 0; i < selectedDays; i++) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toISOString().split('T')[0]
                    dailyData.set(dateStr, { views: 0, visitors: new Set() })
                }

                // Count actual views and unique visitors per day
                pageViews?.forEach(view => {
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

                setData({
                    totalPageViews: pageViews?.length || 0,
                    uniqueVisitors: uniqueVisitors || 0,
                    profileViews,
                    topPages: topPages || [],
                    dailyViews
                })
            } catch (err) {
                console.error('Error fetching analytics:', err)
                setError('Failed to load analytics data')
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [websiteId, selectedDays])

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

    return (
        <div className="space-y-6">
            {/* Header with Date Range Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Site Analytics</h2>
                    <p className="text-sm text-muted-foreground">Overall website performance and traffic</p>
                </div>

                <div className="flex gap-2">
                    {DATE_RANGE_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={selectedDays === option.value ? "cyber-cyan" : "outline"}
                            size="sm"
                            onClick={() => handleDateRangeChange(option.value)}
                            className={`transition-all duration-200 ${selectedDays === option.value
                                ? ''
                                : 'hover:bg-glass/40 hover:border-cyber-cyan/50'
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
                        <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalPageViews.toLocaleString()}</div>
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
                        <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.profileViews.toLocaleString()}</div>
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
                            {Math.round(data.totalPageViews / selectedDays).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Per day average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Page Views Over Time */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Page Views Over Time</CardTitle>
                        <p className="text-sm text-muted-foreground">Daily views for the last {selectedDays} days</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.dailyViews}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#viewsGradient)"
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

            {/* Top Pages */}
            {data.topPages.length > 0 && (
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                        <p className="text-sm text-muted-foreground">Most visited pages in the last {selectedDays} days</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topPages.map((page, index) => (
                                <div key={page.path} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                        <span className="font-medium">{page.path}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{page.count} views</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 