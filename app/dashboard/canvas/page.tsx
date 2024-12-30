'use client'

import React from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Eye, Copy, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'

const RESOLUTIONS = {
  HD: { width: 1280, height: 720, label: 'HD (720p)' },
  FULL_HD: { width: 1920, height: 1080, label: 'Full HD (1080p)' },
  QHD: { width: 2560, height: 1440, label: 'QHD (1440p)' },
  UHD: { width: 3840, height: 2160, label: '4K UHD' },
  ULTRAWIDE_1080P: { width: 2560, height: 1080, label: 'UltraWide 1080p' },
  ULTRAWIDE_1440P: { width: 3440, height: 1440, label: 'UltraWide 1440p' }
} as const

export default function CanvasSettingsPage() {
  const supabase = createClientComponentClient()
  const [canvases, setCanvases] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string>()
  const [visibleUrls, setVisibleUrls] = React.useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  React.useEffect(() => {
    // Show toast for canvas creation/deletion based on URL params
    const status = searchParams.get('status')
    if (status === 'created') {
      toast.success('Canvas created successfully')
    } else if (status === 'deleted') {
      toast.success('Canvas deleted successfully')
    } else if (status === 'failed-to-create') {
      toast.error('Failed to create canvas')
    } else if (status === 'failed-to-delete') {
      toast.error('Failed to delete canvas')
    }
  }, [searchParams])

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/auth/signin'
          return
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
          setError('Could not find your Twitch username.')
          return
        }

        // Get user's canvases
        const { data: canvasData } = await supabase
          .from('canvas_settings')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })

        setCanvases(canvasData || [])
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleCopyUrl = async (canvasId: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/overlay/canvas/${canvasId}`
      await navigator.clipboard.writeText(url)
      toast.success('Overlay URL copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy URL')
    }
  }

  const handleOpenOverlay = (canvasId: string) => {
    window.open(`/overlay/canvas/${canvasId}`, '_blank')
  }

  const toggleUrlVisibility = (canvasId: string) => {
    setVisibleUrls(prev => {
      const next = new Set(prev)
      if (next.has(canvasId)) {
        next.delete(canvasId)
      } else {
        next.add(canvasId)
      }
      return next
    })
  }

  const handleDelete = async (canvasId: string) => {
    if (!window.confirm('Are you sure you want to delete this canvas? This action cannot be undone.')) {
      return
    }

    setIsDeleting(canvasId)
    try {
      const response = await fetch(`/api/canvas/${canvasId}/delete`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete canvas')
      }

      // Remove the canvas from the local state
      setCanvases(prev => prev.filter(c => c.id !== canvasId))
      toast.success('Canvas deleted successfully')
    } catch (err) {
      console.error('Error deleting canvas:', err)
      toast.error('Failed to delete canvas')
    } finally {
      setIsDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

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
          {canvases.length === 0 && (
            <div className="text-center p-8 bg-background/20 rounded-lg">
              <p className="text-muted-foreground">You haven't created any canvases yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click the "New Canvas" button to get started.</p>
            </div>
          )}
          {canvases.map((canvas) => (
            <div 
              key={canvas.id}
              className="flex flex-col gap-4 p-4 bg-background/20 rounded-lg group hover:bg-background/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
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
                    Interact
                  </Link>
                  <Link
                    href={`/dashboard/canvas/${canvas.id}/settings`}
                    className="px-3 py-1.5 bg-background/40 hover:bg-background/60 text-white rounded transition-colors"
                  >
                    Settings
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(canvas.id)}
                    disabled={isDeleting === canvas.id}
                    className="px-3 py-1.5"
                  >
                    {isDeleting === canvas.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input 
                    value=""
                    readOnly
                    className="font-mono text-sm bg-background/20 px-3 absolute inset-0 pointer-events-none opacity-0"
                  />
                  <div 
                    className={`font-mono text-sm absolute inset-0 px-3 flex items-center ${visibleUrls.has(canvas.id) ? '' : 'opacity-50'}`}
                    style={{ 
                      filter: visibleUrls.has(canvas.id) ? 'none' : 'blur(4px)',
                      transition: 'opacity 0.2s ease, filter 0.2s ease'
                    }}
                  >
                    {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/overlay/canvas/${canvas.id}`}
                  </div>
                  <Input 
                    value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/overlay/canvas/${canvas.id}`}
                    readOnly
                    className="font-mono text-sm bg-background/20 px-3 text-transparent"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleUrlVisibility(canvas.id)}
                  title={visibleUrls.has(canvas.id) ? "Hide URL" : "Show URL"}
                  className="shrink-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyUrl(canvas.id)}
                  title="Copy URL"
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenOverlay(canvas.id)}
                  title="Open Overlay"
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
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