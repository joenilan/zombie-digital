'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { DeleteButton, CopyButton, ViewButton, QRButton, EditButton } from '@/components/ui/action-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, EyeOff, Trash2, Settings, ExternalLink, Calendar, Users, Layers, Copy, BarChart3, X } from '@/lib/icons'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle } from '@/lib/icons'
import { TooltipProvider } from '@/components/ui/tooltip'
import { logError } from '@/lib/debug'

export default function CanvasPage() {
  const { user } = useAuthStore()
  const {
    canvases,
    canvasesLoading,
    canvasesError,
    visibleUrls,
    isDeleting,
    setCanvases,
    setCanvasesLoading,
    setCanvasesError,
    addVisibleUrl,
    removeVisibleUrl,
    setIsDeleting
  } = useCanvasStore()

  const supabase = createClientComponentClient()
  const [widgetCounts, setWidgetCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (user) {
      fetchCanvases()
    }
  }, [user])

  const fetchCanvases = async () => {
    if (!user) return

    try {
      setCanvasesLoading(true)
      setCanvasesError(null)

      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setCanvases(data || [])

      // Fetch widget counts for each canvas
      if (data && data.length > 0) {
        await fetchWidgetCounts(data.map(c => c.id))
      }
    } catch (err) {
      logError('Error fetching canvases:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load canvases'
      setCanvasesError(errorMessage)
      toast.error('Failed to load canvases', {
        description: errorMessage
      })
    } finally {
      setCanvasesLoading(false)
    }
  }

  const fetchWidgetCounts = async (canvasIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('canvas_media_objects')
        .select('canvas_id')
        .in('canvas_id', canvasIds)

      if (error) throw error

      const counts: Record<string, number> = {}
      canvasIds.forEach(id => counts[id] = 0)

      data?.forEach(obj => {
        counts[obj.canvas_id] = (counts[obj.canvas_id] || 0) + 1
      })

      setWidgetCounts(counts)
    } catch (err) {
      logError('Error fetching widget counts:', err)
    }
  }

  const toggleUrlVisibility = (canvasId: string) => {
    if (visibleUrls.has(canvasId)) {
      removeVisibleUrl(canvasId)
    } else {
      addVisibleUrl(canvasId)
    }
  }

  const copyOverlayUrl = async (canvasId: string) => {
    const url = `${window.location.origin}/overlay/canvas/${canvasId}`
    await navigator.clipboard.writeText(url)
    toast.success('Overlay URL copied', {
      description: 'Link copied to clipboard',
    })
  }

  const openOverlay = (canvasId: string) => {
    const url = `${window.location.origin}/overlay/canvas/${canvasId}`
    window.open(url, '_blank')
  }

  const deleteCanvas = async (canvasId: string) => {
    if (!user) return

    try {
      setIsDeleting(canvasId)

      const { error } = await supabase
        .from('canvases')
        .delete()
        .eq('id', canvasId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Remove from local state
      setCanvases(canvases.filter(canvas => canvas.id !== canvasId))

      toast.success('Canvas deleted successfully')
    } catch (err) {
      logError('Error deleting canvas:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete canvas'
      toast.error('Failed to delete canvas', {
        description: errorMessage
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (canvasesLoading) {
    return <LoadingSpinner text="Loading canvases..." />
  }

  if (canvasesError) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <Card variant="error">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-4">{canvasesError}</p>
              <Button onClick={fetchCanvases} className="ethereal-button">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="gradient-brand">Canvas</span>
            <span className="text-foreground/90"> Studio</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-3 font-medium">
            Interactive Streaming Overlays
          </p>
          <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Create and manage interactive canvases for your streaming overlays with widgets, images, and real-time elements
          </p>

          <Button asChild className="ethereal-button px-8 py-4 text-lg">
            <Link href="/dashboard/canvas/new" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Canvas
            </Link>
          </Button>
        </motion.div>

        {/* Canvas Grid */}
        {canvases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16"
          >
            <Card variant="glass" className="max-w-md mx-auto">
              <CardContent className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 rounded-full blur-lg"></div>
                  <div className="relative flex items-center justify-center w-full h-full rounded-full bg-glass/20 backdrop-blur-xl border border-white/10">
                    <Layers className="w-8 h-8 text-cyber-pink" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No canvases yet</h3>
                <p className="text-foreground/70 mb-6">
                  Create your first canvas to start building interactive streaming overlays.
                </p>
                <Button asChild className="ethereal-button">
                  <Link href="/dashboard/canvas/new" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Canvas
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canvases.map((canvas, index) => (
              <motion.div
                key={canvas.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="glass-interactive" className="group hover:shadow-[0_8px_32px_rgba(145,70,255,0.15)]">
                  <CardContent>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-white transition-colors duration-300 truncate">
                          {canvas.name}
                        </h3>
                        <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300 line-clamp-2">
                          {canvas.description || 'No description provided'}
                        </p>
                      </div>
                      <Badge
                        variant={canvas.is_public ? "default" : "secondary"}
                        className={`ml-2 ${canvas.is_public ? 'bg-green-500/20 text-green-400' : 'bg-glass/30 text-foreground/70'}`}
                      >
                        {canvas.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-glass/20 border border-white/5">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Layers className="w-3 h-3 text-cyber-pink" />
                        </div>
                        <div className="text-lg font-semibold text-foreground">{widgetCounts[canvas.id] || 0}</div>
                        <div className="text-xs text-foreground/60">Widgets</div>
                      </div>

                      <div className="text-center p-2 rounded-lg bg-glass/20 border border-white/5">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="w-3 h-3 text-cyber-cyan" />
                        </div>
                        <div className="text-xs font-semibold text-foreground">
                          {new Date(canvas.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-foreground/60">Created</div>
                      </div>

                      <div className="text-center p-2 rounded-lg bg-glass/20 border border-white/5">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <UserCircle className="w-3 h-3 text-purple-400" />
                        </div>
                        <div className="text-xs font-semibold text-foreground">
                          {canvas.is_public ? 'Public' : 'Private'}
                        </div>
                        <div className="text-xs text-foreground/60">Access</div>
                      </div>
                    </div>

                    {/* Overlay URL */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Overlay URL</span>
                        <TooltipProvider>
                          <ViewButton
                            size="icon"
                            onClick={() => toggleUrlVisibility(canvas.id)}
                            tooltip={visibleUrls.has(canvas.id) ? "Hide URL" : "Show URL"}
                            className="h-8 w-8"
                          >
                            {visibleUrls.has(canvas.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </ViewButton>
                        </TooltipProvider>
                      </div>

                      {visibleUrls.has(canvas.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex gap-2">
                            <Input
                              value={`${window.location.origin}/overlay/canvas/${canvas.id}`}
                              readOnly
                              className="text-xs font-mono bg-glass/20 border-white/10 text-foreground/80"
                            />
                            <TooltipProvider>
                              <CopyButton
                                size="icon"
                                onClick={() => copyOverlayUrl(canvas.id)}
                                tooltip="Copy overlay URL"
                                className="px-3"
                              >
                                <Copy className="w-4 h-4" />
                              </CopyButton>
                            </TooltipProvider>
                          </div>
                          <TooltipProvider>
                            <ViewButton
                              size="default"
                              onClick={() => openOverlay(canvas.id)}
                              tooltip="Open overlay in new window"
                              className="w-full"
                              icon={<ExternalLink className="w-4 h-4" />}
                            >
                              Open Overlay in New Window
                            </ViewButton>
                          </TooltipProvider>
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button asChild variant="cyber-pink" size="default" className="flex-1">
                        <Link href={`/dashboard/canvas/${canvas.id}`} className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Interact
                        </Link>
                      </Button>

                      <Button asChild variant="cyber-orange" size="default" className="px-3">
                        <Link href={`/dashboard/canvas/${canvas.id}/settings`}>
                          <Settings className="w-4 h-4" />
                        </Link>
                      </Button>

                      <TooltipProvider>
                        <DeleteButton
                          size="icon"
                          onClick={() => deleteCanvas(canvas.id)}
                          tooltip="Delete canvas"
                        >
                          <X className="w-4 h-4" />
                        </DeleteButton>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 