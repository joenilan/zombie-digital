'use client'

import { forwardRef } from 'react'

interface DisplayCanvasProps {
  resolution: string
  background_color: string
  show_name_tag: boolean
  auto_fit: boolean
  locked: boolean
  canvasOwner: string
}

export const DisplayCanvas = forwardRef<HTMLDivElement, DisplayCanvasProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        className="w-full h-full flex items-center justify-center bg-gray-900 text-white"
        style={{ backgroundColor: props.background_color }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Canvas Display</h2>
          <p className="text-gray-400">Canvas functionality is being updated</p>
          <p className="text-sm text-gray-500 mt-2">Resolution: {props.resolution}</p>
          {props.show_name_tag && (
            <p className="text-sm text-gray-500">Owner: {props.canvasOwner}</p>
          )}
        </div>
      </div>
    )
  }
) 