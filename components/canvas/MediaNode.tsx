'use client'

import React from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import Image from 'next/image'
import { Trash2 } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/action-button'
import { TooltipProvider } from '@/components/ui/tooltip'

interface MediaNodeData {
  url: string
  type: 'image' | 'video'
  width: number
  height: number
  rotation: number
  id: string
  onDelete?: (id: string) => void
}

export function MediaNode({ data }: NodeProps<MediaNodeData>) {
  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} />
      {data.type === 'image' ? (
        <Image
          src={data.url}
          alt="Media"
          width={data.width}
          height={data.height}
          style={{ transform: `rotate(${data.rotation}deg)` }}
          className="rounded-lg shadow-lg"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      ) : (
        <video
          src={data.url}
          width={data.width}
          height={data.height}
          style={{ transform: `rotate(${data.rotation}deg)` }}
          className="rounded-lg shadow-lg"
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      <Handle type="source" position={Position.Bottom} />
      {data.onDelete && (
        <TooltipProvider>
          <DeleteButton
            size="icon"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => data.onDelete?.(data.id)}
            tooltip="Delete media"
          >
            <Trash2 className="h-4 w-4" />
          </DeleteButton>
        </TooltipProvider>
      )}
    </div>
  )
} 