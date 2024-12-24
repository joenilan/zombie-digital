'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { ThreeCanvasTest } from './ThreeCanvasTest'

interface EditableCanvasProps {
  resolution: string
  background_color: string
  show_name_tag: boolean
  auto_fit: boolean
  locked: boolean
  canvasOwner: string
}

export const EditableCanvas = forwardRef<any, EditableCanvasProps>(
  (props, ref) => {
    const canvasRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        canvasRef.current?.zoomIn()
      },
      zoomOut: () => {
        canvasRef.current?.zoomOut()
      },
      zoomToFit: () => {
        canvasRef.current?.zoomToFit()
      },
      resetView: () => {
        canvasRef.current?.resetView()
      },
    }))

    return <ThreeCanvasTest ref={canvasRef} {...props} />
  }
) 