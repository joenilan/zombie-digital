import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    console.log('[Test API] Testing database access for canvas:', params.id)
    
    // Test canvas_media_objects access
    const { data: mediaObjects, error: mediaError } = await supabase
      .from('canvas_media_objects')
      .select('*')
      .eq('canvas_id', params.id)
      .order('z_index', { ascending: true })

    if (mediaError) {
      console.error('[Test API] Media objects error:', mediaError)
      return NextResponse.json({ 
        success: false, 
        error: 'Media objects query failed',
        details: mediaError 
      })
    }

    // Test canvas_settings access
    const { data: settings, error: settingsError } = await supabase
      .from('canvas_settings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (settingsError) {
      console.error('[Test API] Settings error:', settingsError)
    }

    console.log('[Test API] Results:', {
      mediaObjectsCount: mediaObjects?.length || 0,
      settingsFound: !!settings
    })

    return NextResponse.json({
      success: true,
      mediaObjectsCount: mediaObjects?.length || 0,
      mediaObjects: mediaObjects,
      settingsFound: !!settings,
      settings: settings
    })

  } catch (error) {
    console.error('[Test API] Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error',
      details: error 
    }, { status: 500 })
  }
} 