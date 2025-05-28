'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardCanvasEditPage() {
  const params = useParams()
  const router = useRouter()
  const canvasId = params.id as string

  useEffect(() => {
    // Redirect to the actual canvas editor
    if (canvasId) {
      router.replace(`/canvas/${canvasId}`)
    }
  }, [canvasId, router])

  return <LoadingSpinner text="Redirecting to canvas editor..." />
} 