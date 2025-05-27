import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { userId, viewerId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if profile_views table exists, if not create it
    const { error: tableCheckError } = await supabase.rpc('check_if_table_exists', {
      table_name: 'profile_views'
    })

    if (tableCheckError) {
      // Create the table if it doesn't exist
      await supabase.rpc('create_profile_views_table')
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
          last_viewed_at: new Date().toISOString()
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

    // Log the view detail for analytics if viewerId is provided
    if (viewerId) {
      await supabase
        .from('profile_view_logs')
        .insert({
          profile_id: userId,
          viewer_id: viewerId,
          viewed_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking profile view:', error)
    return NextResponse.json(
      { error: 'Failed to track profile view' },
      { status: 500 }
    )
  }
} 