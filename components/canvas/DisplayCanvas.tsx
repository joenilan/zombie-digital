'use client'

import { forwardRef } from 'react'
import { ThreeCanvas } from './ThreeCanvas'
import { ThreeCanvasTest } from './ThreeCanvasTest'

interface DisplayCanvasProps {
  resolution: string
  background_color: string
  show_name_tag: boolean
  auto_fit: boolean
  locked: boolean
  canvasOwner: string
}

export const DisplayCanvas = forwardRef<any, DisplayCanvasProps>(
  (props, ref) => {
    return <ThreeCanvasTest ref={ref} {...props} />
  }
) 