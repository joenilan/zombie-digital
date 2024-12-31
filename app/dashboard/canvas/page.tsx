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
import { motion } from 'framer-motion'

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
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
        <div className="h-8 w-1/3 bg-glass animate-pulse rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-glass animate-pulse rounded-lg" />
          <div className="h-4 w-5/6 bg-glass animate-pulse rounded-lg" />
          <div className="h-4 w-4/6 bg-glass animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Canvas Settings</h1>
            <p className="text-muted-foreground">
              Create and manage your stream overlays.
            </p>
          </div>
          <Link 
            href="/api/canvas/new"
            className="flex items-center gap-2 px-4 py-2 bg-cyber-gradient text-white rounded-md transition-all duration-300 hover:scale-[1.02] shadow-cyber hover:shadow-cyber-hover"
          >
            <PlusCircle size={20} />
            New Canvas
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {canvases.length === 0 && (
            <div className="text-center p-8 bg-background/20 rounded-lg">
              <p className="text-muted-foreground">You haven't created any canvases yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click the "New Canvas" button to get started.</p>
            </div>
          )}
          {canvases.map((canvas, index) => (
            <motion.div 
              key={canvas.id}
              className="flex flex-col gap-4 p-6 rounded-xl bg-glass shadow-glass transition-all duration-300 hover:shadow-cyber border border-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{canvas.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {RESOLUTIONS[canvas.resolution as keyof typeof RESOLUTIONS]?.label || canvas.resolution}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/canvas/${canvas.id}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-cyber-gradient text-white rounded transition-all duration-300 hover:scale-[1.02] shadow-cyber hover:shadow-cyber-hover"
                  >
                    Interact
                  </Link>
                  <Link
                    href={`/dashboard/canvas/${canvas.id}/settings`}
                    className="px-3 py-1.5 bg-background/20 hover:bg-background/40 text-white rounded transition-colors"
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
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <Input 
                    value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/overlay/canvas/${canvas.id}`}
                    readOnly
                    className="font-mono text-sm bg-background/20 w-full"
                    type={visibleUrls.has(canvas.id) ? "text" : "password"}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleUrlVisibility(canvas.id)}
                    className="bg-background/20 hover:bg-background/40"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(canvas.id)}
                    className="bg-background/20 hover:bg-background/40"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenOverlay(canvas.id)}
                    className="bg-background/20 hover:bg-background/40"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 