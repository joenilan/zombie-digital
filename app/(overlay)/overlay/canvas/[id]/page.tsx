"use client"

import { useEffect, useState } from "react"

interface MediaObject {
  id: string
  url: string
  position_x: number
  position_y: number
  width: number
  height: number
  rotation: number
  z_index: number
}

export default function CanvasOverlay({ params }: { params: { id: string } }) {
  const [mediaObjects, setMediaObjects] = useState<MediaObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    console.log('[Overlay] Page loading for canvas:', params.id)

    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/canvas/${params.id}/test-access`)
        const result = await response.json()

        if (result.success) {
          setMediaObjects(result.mediaObjects || [])
          console.log('[Overlay] Loaded media objects:', result.mediaObjects)
        } else {
          setError('Failed to load data: ' + result.error)
        }
      } catch (err) {
        setError('Error loading data: ' + err)
        console.error('[Overlay] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,0,0,0.8)',
        color: 'white',
        fontSize: '18px'
      }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      margin: 0,
      padding: 0,
      background: 'transparent',
      overflow: 'hidden'
    }}>
      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999
      }}>
        Loaded {mediaObjects.length} images
      </div>

      {/* Render images */}
      {mediaObjects.map((obj) => (
        <img
          key={obj.id}
          src={obj.url}
          alt="Canvas media"
          style={{
            position: 'absolute',
            left: `${obj.position_x}px`,
            top: `${obj.position_y}px`,
            width: `${obj.width}px`,
            height: `${obj.height}px`,
            transform: `rotate(${obj.rotation || 0}deg)`,
            zIndex: obj.z_index || 0,
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  )
} 