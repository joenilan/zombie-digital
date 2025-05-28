'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Eye, Copy, ExternalLink, Trash2, Loader2, Paintbrush } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useFeatureAccess } from '@/hooks/use-feature-access'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/useAuthStore'
import { SkeletonForm } from '@/components/ui/skeleton'

interface Canvas {
  id: string
  name: string
  resolution: string
  user_id: string
  created_at: string
}

const RESOLUTIONS = {
  '1920x1080': { label: '1920x1080 (Full HD)', width: 1920, height: 1080 },
  '1280x720': { label: '1280x720 (HD)', width: 1280, height: 720 },
  '1366x768': { label: '1366x768 (WXGA)', width: 1366, height: 768 },
  '1600x900': { label: '1600x900 (HD+)', width: 1600, height: 900 },
  '2560x1440': { label: '2560x1440 (QHD)', width: 2560, height: 1440 },
  '3840x2160': { label: '3840x2160 (4K UHD)', width: 3840, height: 2160 }
}

export default function CanvasSettingsPage() {
  const { user: authUser, session, isLoading: authLoading, isInitialized } = useAuthStore()
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [visibleUrls, setVisibleUrls] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { hasFeatureAccess, isLoading: featuresLoading } = useFeatureAccess(authUser)

  // Handle success message from URL params
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'canvas-created') {
      toast.success('Canvas created successfully!')
      // Remove the success param from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('success')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  // Auth is handled by dashboard layout - no need for redirect logic here

  // Load canvas data
  React.useEffect(() => {
    async function fetchData() {
      if (!authUser) return

      try {
        setLoading(true)

        // Get user's canvases
        const { data: canvasData } = await supabase
          .from('canvas_settings')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        setCanvases(canvasData || [])
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (isInitialized && authUser) {
      fetchData()
    }
  }, [authUser?.id, isInitialized, supabase])

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

  // Auth is handled by dashboard layout - user is guaranteed to exist here

  // Feature access check
  if (!featuresLoading && !hasFeatureAccess('CANVAS')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-glass border-amber-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-400 flex items-center justify-center gap-2">
              <Paintbrush className="w-5 h-5" />
              Feature Not Available
            </CardTitle>
            <CardDescription>
              The Canvas feature is not available for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Access Restricted
            </div>
            <p className="text-sm text-muted-foreground">
              Contact an administrator if you believe this is an error.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <SkeletonForm />
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Canvas Settings</h1>
          <p className="text-gray-300">Create and manage your stream overlays.</p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Manage Your Canvases</h2>
                <p className="text-muted-foreground">
                  Create and configure stream overlays for your broadcasts.
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

            <div className="grid grid-cols-1 gap-4">
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
      </div>
    </div>
  )
} 