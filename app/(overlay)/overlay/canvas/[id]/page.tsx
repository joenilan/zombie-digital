"use client"

import { FlowCanvasV2 } from "@/components/canvas/FlowCanvasV2"

export default function CanvasOverlay({ params }: { params: { id: string } }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      margin: 0,
      padding: 0,
      background: 'none',
      overflow: 'hidden',
      isolation: 'isolate'
    }}>
      <FlowCanvasV2 canvasId={params.id} isOwner={false} />
    </div>
  )
} 