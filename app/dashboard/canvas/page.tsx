'use client'

import React, { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, EyeOff, Trash2, Settings, ExternalLink, Calendar, Users, Layers } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { toast } from 'sonner'

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
    } catch (err) {
      console.error('Error fetching canvases:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load canvases'
      setCanvasesError(errorMessage)
      toast.error('Failed to load canvases', {
        description: errorMessage
      })
    } finally {
      setCanvasesLoading(false)
    }
  }

  const toggleUrlVisibility = (canvasId: string) => {
    if (visibleUrls.has(canvasId)) {
      removeVisibleUrl(canvasId)
    } else {
      addVisibleUrl(canvasId)
    }
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
      console.error('Error deleting canvas:', err)
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
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-red-500/20">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
            <p className="text-muted-foreground">{canvasesError}</p>
            <Button onClick={fetchCanvases} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Canvas Studio</h1>
              <p className="text-gray-300">Create and manage your interactive canvases for streaming overlays.</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/dashboard/canvas/new">
                <Plus className="w-4 h-4" />
                New Canvas
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Canvas Grid */}
        {canvases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No canvases yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first canvas to start building interactive streaming overlays.
              </p>
              <Button asChild>
                <Link href="/dashboard/canvas/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Canvas
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canvases.map((canvas, index) => (
              <motion.div
                key={canvas.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-glass/50 backdrop-blur-xl border-white/5 hover:shadow-cyber-hover transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{canvas.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {canvas.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Badge variant={canvas.is_public ? "default" : "secondary"} className="ml-2">
                        {canvas.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Canvas Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(canvas.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {canvas.is_public ? 'Public' : 'Private'}
                      </div>
                    </div>

                    {/* Canvas URL */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Canvas URL</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUrlVisibility(canvas.id)}
                          className="h-6 w-6 p-0"
                        >
                          {visibleUrls.has(canvas.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {visibleUrls.has(canvas.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs font-mono bg-muted/20 p-2 rounded border break-all"
                        >
                          {`${window.location.origin}/overlay/canvas/${canvas.id}`}
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/dashboard/canvas/${canvas.id}`}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Edit
                        </Link>
                      </Button>

                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/canvas/${canvas.id}/settings`}>
                          <Settings className="w-3 h-3" />
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCanvas(canvas.id)}
                        disabled={isDeleting === canvas.id}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        {isDeleting === canvas.id ? (
                          <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
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