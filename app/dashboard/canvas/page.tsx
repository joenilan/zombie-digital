import React from 'react'
import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Canvas Settings',
  description: 'Configure your stream canvas settings',
}

const RESOLUTIONS = {
  HD: { width: 1280, height: 720, label: 'HD (720p)' },
  FULL_HD: { width: 1920, height: 1080, label: 'Full HD (1080p)' },
  QHD: { width: 2560, height: 1440, label: 'QHD (1440p)' },
  UHD: { width: 3840, height: 2160, label: '4K UHD' },
  ULTRAWIDE_1080P: { width: 2560, height: 1080, label: 'UltraWide 1080p' },
  ULTRAWIDE_1440P: { width: 3440, height: 1440, label: 'UltraWide 1440p' }
} as const

export default async function CanvasSettingsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Get the user's metadata which includes Twitch information
  const { data: userData } = await supabase.auth.getUser()
  const twitchId = userData.user?.user_metadata?.provider_id

  // Get user's profile from the TwitchUser table using Twitch ID
  const { data: currentUser } = await supabase
    .from('twitch_users')
    .select('id, site_role, username, display_name')
    .eq('twitch_id', twitchId)
    .single()

  if (!currentUser?.username) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p>Could not find your Twitch username.</p>
        </div>
      </main>
    )
  }

  // Get user's canvases
  const { data: canvases } = await supabase
    .from('canvas_settings')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Canvas Settings</h1>
          <Link 
            href="/api/canvas/new"
            className="flex items-center gap-2 px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-md transition-colors"
          >
            <PlusCircle size={20} />
            New Canvas
          </Link>
        </div>

        <div className="bg-glass rounded-xl shadow-glass p-6">
          <h2 className="text-xl font-semibold mb-4">Your Canvases</h2>
          <div className="grid grid-cols-1 gap-4">
            {canvases?.length === 0 && (
              <div className="text-center p-8 bg-background/20 rounded-lg">
                <p className="text-muted-foreground">You haven't created any canvases yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Click the "New Canvas" button to get started.</p>
              </div>
            )}
            {canvases?.map((canvas) => (
              <div 
                key={canvas.id}
                className="flex items-center justify-between p-4 bg-background/20 rounded-lg group hover:bg-background/30 transition-all duration-300"
              >
                <div>
                  <h3 className="font-medium">{canvas.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {RESOLUTIONS[canvas.resolution as keyof typeof RESOLUTIONS]?.label || canvas.resolution}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/canvas/${canvas.id}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-cyber-purple/20 hover:bg-cyber-purple/40 text-white rounded transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/canvas/${canvas.id}/settings`}
                    className="px-3 py-1.5 bg-background/40 hover:bg-background/60 text-white rounded transition-colors"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-glass rounded-xl shadow-glass p-6">
          <h2 className="text-xl font-semibold mb-4">OBS Setup</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To use a canvas in OBS:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Add a new Browser Source in OBS</li>
              <li>Set the URL to your canvas link</li>
              <li>Set the width and height to match your chosen resolution</li>
              <li>Enable "Control audio via OBS"</li>
              <li>Refresh the browser source if needed</li>
            </ol>
          </div>
        </div>
      </div>
  )
} 