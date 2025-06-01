import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { userId, viewerId, referrer, userAgent } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get visitor's IP address for deduplication
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const visitorIp = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Create a session identifier (IP + User Agent hash for basic deduplication)
    const sessionId = Buffer.from(`${visitorIp}-${userAgent || 'unknown'}`).toString('base64').slice(0, 32)

    // Check for recent views from the same session (within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { data: recentViews, error: dedupeError } = await supabase
      .from('profile_view_logs')
      .select('id')
      .eq('profile_id', userId)
      .eq('session_id', sessionId)
      .gte('viewed_at', thirtyMinutesAgo)
      .limit(1)

    console.log('Deduplication check:', {
      sessionId,
      thirtyMinutesAgo,
      recentViews,
      dedupeError,
      hasRecentViews: recentViews && recentViews.length > 0
    })

    // If there's a recent view from this session, don't count it again
    if (recentViews && recentViews.length > 0) {
      console.log('Blocking duplicate view for session:', sessionId)
      return NextResponse.json({ 
        success: true, 
        counted: false, 
        reason: 'Recent view from same session' 
      })
    }

    // First, try to get the existing record
    const { data: existingViews, error: fetchError } = await supabase
      .from('profile_views')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Real error, not just "no rows returned"
      throw fetchError
    }

    // If the record exists, increment the view_count
    if (existingViews) {
      const { error: updateError } = await supabase
        .from('profile_views')
        .update({ 
          view_count: existingViews.view_count + 1,
          last_viewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) throw updateError
    } 
    // Otherwise, create a new record
    else {
      const { error: insertError } = await supabase
        .from('profile_views')
        .insert({
          user_id: userId,
          view_count: 1,
          last_viewed_at: new Date().toISOString()
        })

      if (insertError) throw insertError
    }

    // Log the view detail for analytics
    await supabase
      .from('profile_view_logs')
      .insert({
        profile_id: userId,
        viewer_id: viewerId,
        session_id: sessionId,
        visitor_ip: visitorIp,
        referrer: referrer,
        user_agent: userAgent,
        viewed_at: new Date().toISOString()
      })

    return NextResponse.json({ 
      success: true, 
      counted: true,
      sessionId: sessionId 
    })
  } catch (error) {
    console.error('Error tracking profile view:', error)
    return NextResponse.json(
      { error: 'Failed to track profile view' },
      { status: 500 }
    )
  }
} 