import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/debug'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user?.user_metadata?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's profile ID using the same logic as the auth store
    const twitchId = session.user.user_metadata.sub
    
    const { data: twitchUser, error: userError } = await supabase
      .from('twitch_users')
      .select('id')
      .eq('twitch_id', twitchId)
      .single()

    if (userError || !twitchUser) {
      logError(`User lookup error: Twitch ID: ${twitchId}`, userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = twitchUser.id
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get total views
    const { data: totalViews } = await supabase
      .from('profile_views')
      .select('view_count')
      .eq('user_id', userId)
      .single()

    // Get daily views for the last N days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: dailyViews } = await supabase
      .from('profile_view_logs')
      .select('viewed_at')
      .eq('profile_id', userId)
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: true })

    // Process daily views into chart data
    const viewsByDay = new Map<string, number>()
    
    // Initialize all days with 0 views
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      viewsByDay.set(dateStr, 0)
    }

    // Count actual views
    dailyViews?.forEach(view => {
      const dateStr = view.viewed_at.split('T')[0]
      viewsByDay.set(dateStr, (viewsByDay.get(dateStr) || 0) + 1)
    })

    const chartData = Array.from(viewsByDay.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Get top referrers
    const { data: referrerData } = await supabase
      .from('profile_view_logs')
      .select('referrer')
      .eq('profile_id', userId)
      .gte('viewed_at', startDate.toISOString())
      .not('referrer', 'is', null)

    const referrerCounts = new Map<string, number>()
    referrerData?.forEach(({ referrer }) => {
      if (referrer) {
        try {
          const domain = new URL(referrer).hostname
          referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1)
        } catch {
          // Invalid URL, use as-is
          referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1)
        }
      }
    })

    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get recent views (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentViews } = await supabase
      .from('profile_view_logs')
      .select('viewed_at')
      .eq('profile_id', userId)
      .gte('viewed_at', sevenDaysAgo.toISOString())

    const recentViewCount = recentViews?.length || 0

    // Calculate growth percentage
    const { data: previousWeekViews } = await supabase
      .from('profile_view_logs')
      .select('viewed_at')
      .eq('profile_id', userId)
      .gte('viewed_at', new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .lt('viewed_at', sevenDaysAgo.toISOString())

    const previousWeekCount = previousWeekViews?.length || 0
    const growthPercentage = previousWeekCount > 0 
      ? ((recentViewCount - previousWeekCount) / previousWeekCount) * 100 
      : recentViewCount > 0 ? 100 : 0

    return NextResponse.json({
      totalViews: totalViews?.view_count || 0,
      recentViews: recentViewCount,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
      chartData,
      topReferrers,
      period: `${days} days`
    })

  } catch (error) {
    logError('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 