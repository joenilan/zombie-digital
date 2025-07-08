'use client'

import { useEffect, useState } from 'react'
import { umami } from '@/lib/umami'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Users, TrendingUp } from '@/lib/icons'
import { logError } from '@/lib/debug'

interface AnalyticsData {
    totalPageViews: number
    uniqueVisitors: number
    profileViews: number
    topPages: Array<{ path: string; count: number }>
}

interface UmamiAnalyticsProps {
    websiteId?: string
    days?: number
}

export function UmamiAnalytics({ websiteId, days = 30 }: UmamiAnalyticsProps) {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true)
                setError(null)

                await umami.initialize(websiteId)

                const startDate = new Date()
                startDate.setDate(startDate.getDate() - days)

                const [pageViews, uniqueVisitors, topPages] = await Promise.all([
                    umami.getPageViews(websiteId, startDate),
                    umami.getUniqueVisitors(websiteId, startDate),
                    umami.getTopPages(websiteId, startDate, undefined, 5)
                ])

                // Count profile views from page views
                const profileViews = pageViews?.filter(view =>
                    view.url_path && view.url_path.match(/^\/[^\/]+$/) && view.url_path !== '/'
                ).length || 0

                setData({
                    totalPageViews: pageViews?.length || 0,
                    uniqueVisitors: uniqueVisitors || 0,
                    profileViews,
                    topPages: topPages || []
                })
            } catch (err) {
                logError('Error fetching analytics:', err)
                setError('Failed to load analytics data')
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [websiteId, days])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
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

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalPageViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {days} days</p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {days} days</p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.profileViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {days} days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Pages */}
            {data.topPages.length > 0 && (
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
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