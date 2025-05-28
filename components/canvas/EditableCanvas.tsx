'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

interface EditableCanvasProps {
  resolution: string
  background_color: string
  show_name_tag: boolean
  auto_fit: boolean
  locked: boolean
  canvasOwner: string
}

interface EditableCanvasRef {
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  resetView: () => void
}

export const EditableCanvas = forwardRef<EditableCanvasRef, EditableCanvasProps>(
  (props, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        console.log('Zoom in functionality will be implemented')
      },
      zoomOut: () => {
        console.log('Zoom out functionality will be implemented')
      },
      zoomToFit: () => {
        console.log('Zoom to fit functionality will be implemented')
      },
      resetView: () => {
        console.log('Reset view functionality will be implemented')
      },
    }))

    return (
      <div
        ref={canvasRef}
        className="w-full h-full flex items-center justify-center bg-gray-900 text-white"
        style={{ backgroundColor: props.background_color }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Editable Canvas</h2>
          <p className="text-gray-400">Canvas editing functionality is being updated</p>
          <p className="text-sm text-gray-500 mt-2">Resolution: {props.resolution}</p>
          {props.show_name_tag && (
            <p className="text-sm text-gray-500">Owner: {props.canvasOwner}</p>
          )}
        </div>
      </div>
    )
  }
) 