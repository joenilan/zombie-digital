'use client'

import { useCallback, useRef, useState, useEffect, useMemo, memo } from 'react'
import ReactFlow, {
  Node,
  NodeChange,
  useNodesState,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  PanOnScrollMode,
  useStore,
  NodePositionChange
} from 'reactflow'
import 'reactflow/dist/style.css'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { SuccessButton, DeleteButton, ViewButton } from '@/components/ui/action-button'
import { TooltipProvider } from '@/components/ui/tooltip'

interface FlowCanvasV2Props {
  canvasId: string
  isOwner: boolean
  userId?: string
}

// Move ImageNode component completely outside
const ImageNode = memo(({ data, selected, id, onResize, onRotate }: {
  data: { url: string, width?: number, height?: number, rotation?: number },
  selected: boolean,
  id: string,
  onResize?: (width: number, height: number) => void,
  onRotate?: (rotation: number) => void
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startDims, setStartDims] = useState({ width: 0, height: 0 })
  const [startRotation, setStartRotation] = useState(0)
  const [dimensions, setDimensions] = useState({ width: data.width || 0, height: data.height || 0 })
  const nodeRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Load natural dimensions when image loads
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight
      if (!data.width || !data.height) {
        setDimensions({ width: naturalWidth, height: naturalHeight })
        onResize?.(naturalWidth, naturalHeight)
      }
    }
    img.src = data.url
  }, [data.url, data.width, data.height, onResize])

  // Get dimensions from state or props
  const width = data.width || dimensions.width
  const height = data.height || dimensions.height
  const rotation = data.rotation || 0

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault() // Prevent drag start
    e.stopPropagation() // Prevent event bubbling
    setIsResizing(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartDims({ width, height })
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Set pointer-events to none on the parent node to prevent dragging
    if (nodeRef.current?.parentElement) {
      nodeRef.current.parentElement.style.pointerEvents = 'none'
    }
  }

  const handleRotateStart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent drag start
    e.stopPropagation() // Prevent event bubbling
    setIsRotating(true)
    const rect = nodeRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const startAngle = Math.atan2(
        e.clientY - centerY,
        e.clientX - centerX
      ) * 180 / Math.PI
      setStartRotation(rotation - startAngle)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Set pointer-events to none on the parent node to prevent dragging
    if (nodeRef.current?.parentElement) {
      nodeRef.current.parentElement.style.pointerEvents = 'none'
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && nodeRef.current) {
      const dx = e.clientX - startPos.x
      const dy = e.clientY - startPos.y
      const newWidth = Math.max(50, startDims.width + dx)
      const newHeight = Math.max(50, startDims.height + dy)
      setDimensions({ width: newWidth, height: newHeight })
      onResize?.(newWidth, newHeight)
    }

    if (isRotating && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const currentAngle = Math.atan2(
        e.clientY - centerY,
        e.clientX - centerX
      ) * 180 / Math.PI
      const newRotation = (startRotation + currentAngle + 360) % 360
      onRotate?.(newRotation)
    }
  }, [isResizing, isRotating, startPos, startDims, startRotation, onResize, onRotate])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setIsRotating(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Restore pointer-events on the parent node
    if (nodeRef.current?.parentElement) {
      nodeRef.current.parentElement.style.pointerEvents = 'auto'
    }
  }, [handleMouseMove])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div
      ref={nodeRef}
      className="relative group"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: isResizing || isRotating ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
    >
      <img
        ref={imageRef}
        src={data.url}
        alt="media"
        className="absolute inset-0 w-full h-full object-fill"
        draggable={false}
      />

      {/* Resize handles - only show when selected and not rotating */}
      {selected && !isRotating && width > 0 && height > 0 && (
        <>
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full -top-1.5 -left-1.5 cursor-nw-resize z-10 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            onTouchStart={(e) => e.stopPropagation()}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full -top-1.5 -right-1.5 cursor-ne-resize z-10 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            onTouchStart={(e) => e.stopPropagation()}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize z-10 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            onTouchStart={(e) => e.stopPropagation()}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1.5 -right-1.5 cursor-se-resize z-10 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            onTouchStart={(e) => e.stopPropagation()}
          />
        </>
      )}

      {/* Rotate handle - only show when selected and not resizing */}
      {selected && !isResizing && width > 0 && height > 0 && (
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full -top-8 left-1/2 -translate-x-1/2 cursor-pointer z-10 hover:scale-125 transition-transform"
          onMouseDown={handleRotateStart}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          </svg>
        </div>
      )}
    </div>
  )
})

// Context menu types
interface BaseContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

interface CanvasContextMenuProps extends BaseContextMenuProps {
  onUpload: () => void
}

interface NodeContextMenuProps extends BaseContextMenuProps {
  onDelete: () => void
}

// Canvas context menu (for uploading)
const CanvasContextMenu = ({ x, y, onUpload, onClose }: CanvasContextMenuProps) => (
  <div
    className="fixed border border-white/10 rounded-lg shadow-lg py-1 z-50"
    style={{
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      backgroundColor: 'rgb(24 24 27)'
    }}
  >
    <TooltipProvider>
      <SuccessButton
        onClick={() => {
          onUpload()
          onClose()
        }}
        size="sm"
        tooltip="Upload an image to the canvas"
        className="w-full px-4 py-2 text-sm justify-start rounded-none"
      >
        Upload Image
      </SuccessButton>
    </TooltipProvider>
  </div>
)

// Node context menu (for deleting)
const NodeContextMenu = ({ x, y, onDelete, onClose }: NodeContextMenuProps) => (
  <div
    className="fixed border border-white/10 rounded-lg shadow-lg py-1 z-50"
    style={{
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      backgroundColor: 'rgb(24 24 27)'
    }}
  >
    <TooltipProvider>
      <DeleteButton
        onClick={() => {
          onDelete()
          onClose()
        }}
        size="sm"
        tooltip="Delete this image"
        className="w-full px-4 py-2 text-sm justify-start rounded-none"
      >
        Delete Image
      </DeleteButton>
    </TooltipProvider>
  </div>
)

// Confirmation dialog
interface ConfirmDialogProps {
  onConfirm: () => void
  onCancel: () => void
  count: number
}

const ConfirmDialog = ({ onConfirm, onCancel, count }: ConfirmDialogProps) => (
  <div className="fixed inset-0 z-50">
    <div
      className="fixed inset-0"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onCancel}
    />
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="border border-white/10 rounded-lg shadow-lg p-6 max-w-md mx-4"
        style={{ backgroundColor: 'rgb(24 24 27)' }}
      >
        <h3 className="text-lg font-semibold mb-4">Delete {count > 1 ? `${count} Images` : 'Image'}</h3>
        <p className="text-zinc-400 mb-6">
          Are you sure you want to delete {count > 1 ? 'these images' : 'this image'}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <TooltipProvider>
            <ViewButton
              onClick={onCancel}
              tooltip="Cancel deletion"
            >
              Cancel
            </ViewButton>
            <DeleteButton
              onClick={onConfirm}
              tooltip="Confirm deletion"
            >
              Delete
            </DeleteButton>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </div>
)

// OBS Viewport overlay component
const OBSViewport = () => {
  const transform = useStore((state) => state.transform)
  const scale = transform[2] || 1
  const [x, y] = transform

  return (
    <>
      {/* OBS Frame - fixed 1920x1080 viewport that scales with zoom */}
      <div
        className="absolute border-2 border-purple-500/50 pointer-events-none"
        style={{
          width: `${1920 * scale}px`,
          height: `${1080 * scale}px`,
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          transformOrigin: '0 0',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="absolute -top-6 left-0 bg-purple-500/50 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
          OBS Viewport (1920x1080)
        </div>
      </div>
    </>
  )
}

// Update BoundaryBox component to match OBS viewport style
const BoundaryBox = () => {
  const transform = useStore((state) => state.transform)
  const scale = transform[2] || 1
  const [x, y] = transform

  // Increase padding to create a roughly 10000x10000 canvas
  const PADDING = 4000
  const width = 1920 + (PADDING * 2)  // 9920px total width
  const height = 1080 + (PADDING * 2)  // 9080px total height

  return (
    <div
      className="absolute border-2 border-purple-500/50 pointer-events-none"
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        position: 'absolute',
        left: `${x - PADDING * scale}px`,
        top: `${y - PADDING * scale}px`,
        transformOrigin: '0 0'
      }}
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-500/50 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
        Boundary ({width}x{height})
      </div>
    </div>
  )
}

function Flow({ canvasId, isOwner, userId }: FlowCanvasV2Props) {
  // Use the same client for both owner and non-owner
  const supabase = createClientComponentClient()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastBroadcastRef = useRef<number>(0)
  const BROADCAST_THROTTLE = 16 // ~60fps

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [uploadPosition, setUploadPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedNodeForDelete, setSelectedNodeForDelete] = useState<string | null>(null)
  const [contextMenuType, setContextMenuType] = useState<'canvas' | 'node' | null>(null)
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])

  // Add transform state for non-owner views
  const nodeTransformsRef = useRef<Record<string, { x: number; y: number }>>({})

  // Add dragId ref at the top of the component with other refs
  const dragIdRef = useRef<string | null>(null)

  // Update canvas bounds with larger padding
  const PADDING = 4000
  const CANVAS_BOUNDS = {
    minX: -PADDING,
    maxX: 1920 + PADDING,
    minY: -PADDING,
    maxY: 1080 + PADDING
  }

  const handlers = useMemo(() => ({
    onResize: async (nodeId: string, width: number, height: number) => {
      // Update local state
      setNodes((nds) => nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              width,
              height
            }
          }
        }
        return node
      }))

      // Broadcast through Supabase Realtime
      const now = Date.now()
      if (now - lastBroadcastRef.current >= BROADCAST_THROTTLE) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'resize',
          payload: {
            id: nodeId,
            width,
            height
          }
        })
        lastBroadcastRef.current = now
      }

      // Save to database
      try {
        await supabase
          .from('canvas_media_objects')
          .update({
            width,
            height
          })
          .eq('id', nodeId)
      } catch (error) {
        console.error('Error updating dimensions:', error)
      }
    },
    onRotate: async (nodeId: string, rotation: number) => {
      // Update local state
      setNodes((nds) => nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              rotation
            }
          }
        }
        return node
      }))

      // Broadcast through Supabase Realtime
      const now = Date.now()
      if (now - lastBroadcastRef.current >= BROADCAST_THROTTLE) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'rotate',
          payload: {
            id: nodeId,
            rotation
          }
        })
        lastBroadcastRef.current = now
      }

      // Save to database
      try {
        await supabase
          .from('canvas_media_objects')
          .update({
            rotation
          })
          .eq('id', nodeId)
      } catch (error) {
        console.error('Error updating rotation:', error)
      }
    }
  }), [setNodes, supabase])

  // Create nodeTypes with access to handlers
  const nodeTypes = useMemo(() => ({
    imageNode: (props: any) => (
      <div style={{ zIndex: props.data.zIndex || 0 }}>
        <ImageNode
          {...props}
          onResize={(width, height) => handlers.onResize(props.id, width, height)}
          onRotate={(rotation) => handlers.onRotate(props.id, rotation)}
        />
      </div>
    )
  }), [handlers])

  // Handle node click for layer ordering
  const handleNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    if (!isOwner) return

    // Get current max zIndex
    const maxZIndex = Math.max(...nodes.map(n => n.data.zIndex || 0))
    const newZIndex = maxZIndex + 1

    // Update local state
    setNodes((nds) => nds.map(n => {
      if (n.id === node.id) {
        return {
          ...n,
          data: {
            ...n.data,
            zIndex: newZIndex
          }
        }
      }
      return n
    }))

    // Update database
    try {
      const { error } = await supabase
        .from('canvas_media_objects')
        .update({ z_index: newZIndex })
        .eq('id', node.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating layer order:', error)
    }
  }, [nodes, canvasId, isOwner, supabase])

  // Update handleNodesChange to account for node dimensions
  const handleNodesChange = useCallback(
    async (changes: NodeChange[]) => {
      // Process changes and enforce boundaries
      const boundedChanges = changes.map(change => {
        if (change.type === 'position' && 'position' in change && change.position) {
          const node = nodes.find(n => n.id === change.id)
          if (!node) return change

          // Get node dimensions
          const nodeWidth = node.data.width || 0
          const nodeHeight = node.data.height || 0

          // Calculate bounds accounting for node dimensions
          return {
            ...change,
            position: {
              x: Math.max(CANVAS_BOUNDS.minX, Math.min(CANVAS_BOUNDS.maxX - nodeWidth, change.position.x)),
              y: Math.max(CANVAS_BOUNDS.minY, Math.min(CANVAS_BOUNDS.maxY - nodeHeight, change.position.y))
            }
          }
        }
        return change
      })

      // Always update React Flow state immediately for smooth movement
      onNodesChange(boundedChanges)

      // Process position changes
      for (const change of boundedChanges) {
        if (change.type === 'position') {
          const node = nodes.find(n => n.id === change.id)
          if (!node) continue

          // Handle drag end
          if ('dragging' in change && change.dragging === false) {
            try {
              console.log('Saving final position to database...')

              // First, send a final position update with dragId to ensure all clients are in sync
              if (dragIdRef.current) {
                const finalPayload = {
                  id: node.id,
                  position: {
                    x: Math.round(node.position.x),
                    y: Math.round(node.position.y)
                  },
                  dragId: dragIdRef.current,
                  final: true
                }
                console.log('[FlowCanvas] Sending final position broadcast:', finalPayload)
                channelRef.current?.send({
                  type: 'broadcast',
                  event: 'position',
                  payload: finalPayload
                })
              }

              // Save to database
              const { error } = await supabase
                .from('canvas_media_objects')
                .update({
                  position_x: Math.round(node.position.x),
                  position_y: Math.round(node.position.y)
                })
                .eq('id', change.id)

              if (error) {
                console.error('Error saving position to database:', error)
              }

              // Reset dragId and remove any transition styles
              dragIdRef.current = null
              setNodes((nds) => nds.map(n => {
                if (n.id === change.id) {
                  const { style, ...rest } = n
                  return {
                    ...rest,
                    style: {
                      ...style,
                      transition: 'none'
                    }
                  }
                }
                return n
              }))
            } catch (error) {
              console.error('Error updating position in database:', error)
            }
          }

          // During dragging, broadcast position through Supabase Realtime
          if ('dragging' in change && change.dragging === true) {
            const now = Date.now()
            if (now - lastBroadcastRef.current >= BROADCAST_THROTTLE) {
              // Generate a unique ID for this dragging session if we don't have one
              if (!dragIdRef.current) {
                dragIdRef.current = crypto.randomUUID()
              }

              // Broadcast position through existing channel
              const broadcastPayload = {
                id: node.id,
                position: {
                  x: Math.round(node.position.x),
                  y: Math.round(node.position.y)
                },
                dragId: dragIdRef.current,
                final: false
              }
              console.log('[FlowCanvas] Sending position broadcast:', broadcastPayload)
              channelRef.current?.send({
                type: 'broadcast',
                event: 'position',
                payload: broadcastPayload
              })
              lastBroadcastRef.current = now
            }
          }
        }
      }
    },
    [canvasId, onNodesChange, supabase, nodes]
  )

  // Update useEffect for subscription handling
  useEffect(() => {
    console.log(`[FlowCanvas] Component mounted - canvasId: ${canvasId}, isOwner: ${isOwner}`)
    console.log(`[FlowCanvas] useEffect running, about to call loadNodes`)

    let channel: ReturnType<typeof supabase.channel> | null = null
    let isSubscribed = false

    const loadNodes = async () => {
      console.log(`[Overlay] Loading nodes for canvas ${canvasId}, isOwner: ${isOwner}`)

      try {
        // For overlay (non-owner), use API route to avoid client auth issues
        if (!isOwner) {
          console.log('[Overlay] Using API route for data fetching')

          try {
            const response = await fetch(`/api/canvas/${canvasId}/test-access`)
            console.log('[Overlay] API response status:', response.status)

            const result = await response.json()
            console.log('[Overlay] API response data:', result)

            if (!result.success) {
              console.error('[Overlay] API route error:', result.error)
              return
            }

            const mediaObjects = result.mediaObjects
            console.log(`[Overlay] Loaded ${mediaObjects?.length || 0} media objects via API:`, mediaObjects)

            const loadedNodes = mediaObjects.map((obj: any) => ({
              id: obj.id,
              type: 'imageNode',
              position: { x: obj.position_x, y: obj.position_y },
              data: {
                url: obj.url,
                width: obj.width,
                height: obj.height,
                rotation: obj.rotation,
                zIndex: obj.z_index || 0
              },
              draggable: isOwner,
              selectable: isOwner
            }))

            console.log(`[Overlay] Setting ${loadedNodes.length} nodes:`, loadedNodes)
            setNodes(loadedNodes)

            // Debug: Check if nodes were set
            setTimeout(() => {
              console.log(`[Overlay] Nodes state after setting:`, loadedNodes.length)
            }, 100)

            return
          } catch (fetchError) {
            console.error('[Overlay] Fetch error:', fetchError)
            return
          }
        }

        // For owner, use direct Supabase client
        const { data: mediaObjects, error } = await supabase
          .from('canvas_media_objects')
          .select('*')
          .eq('canvas_id', canvasId)
          .order('z_index', { ascending: true })

        if (error) {
          console.error('[Overlay] Error loading nodes:', error)
          return
        }

        console.log(`[Overlay] Loaded ${mediaObjects?.length || 0} media objects:`, mediaObjects)

        const loadedNodes = mediaObjects.map(obj => ({
          id: obj.id,
          type: 'imageNode',
          position: { x: obj.position_x, y: obj.position_y },
          data: {
            url: obj.url,
            width: obj.width,
            height: obj.height,
            rotation: obj.rotation,
            zIndex: obj.z_index || 0
          },
          draggable: isOwner,
          selectable: isOwner
        }))

        console.log(`[Overlay] Setting ${loadedNodes.length} nodes:`, loadedNodes)
        setNodes(loadedNodes)

        // Debug: Check if nodes were set
        setTimeout(() => {
          console.log(`[Overlay] Nodes state after setting:`, loadedNodes.length)
        }, 100)
      } catch (error) {
        console.error('[Overlay] Unexpected error in loadNodes:', error)
      }
    }

    const setupChannel = async () => {
      try {
        // Clean up any existing channel
        if (channelRef.current) {
          await channelRef.current.unsubscribe()
          channelRef.current = null
        }

        // Create new channel with unique ID to avoid conflicts
        const channelId = `canvas_${canvasId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        channel = supabase.channel(channelId)
        channelRef.current = channel

        console.log(`[FlowCanvas] Creating channel: ${channelId}`)

        // Set up channel handlers
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'canvas_media_objects',
              filter: `canvas_id=eq.${canvasId}`
            },
            (payload) => {
              if (!isSubscribed) return
              console.log('[FlowCanvas] Received database update:', payload)

              switch (payload.eventType) {
                case 'INSERT':
                  const newNode = {
                    id: payload.new.id,
                    type: 'imageNode',
                    position: { x: payload.new.position_x, y: payload.new.position_y },
                    data: {
                      url: payload.new.url,
                      width: payload.new.width,
                      height: payload.new.height,
                      rotation: payload.new.rotation,
                      zIndex: payload.new.z_index || 0
                    },
                    draggable: isOwner,
                    selectable: isOwner
                  }
                  setNodes((nds) => nds.concat(newNode))
                  break
                case 'DELETE':
                  setNodes((nds) => nds.filter(node => node.id !== payload.old.id))
                  break
                case 'UPDATE':
                  setNodes((nds) => nds.map(node => {
                    if (node.id === payload.new.id) {
                      return {
                        ...node,
                        position: {
                          x: payload.new.position_x,
                          y: payload.new.position_y
                        },
                        data: {
                          ...node.data,
                          width: payload.new.width,
                          height: payload.new.height,
                          rotation: payload.new.rotation,
                          zIndex: payload.new.z_index || 0
                        }
                      }
                    }
                    return node
                  }))
                  break
              }
            }
          )
          .on(
            'broadcast',
            { event: 'position' },
            ({ payload }) => {
              if (!isSubscribed) return
              console.log('[FlowCanvas] Received position broadcast:', payload)
              // Update all views except the one doing the dragging
              if (payload.dragId !== dragIdRef.current) {
                setNodes((nds) => nds.map(node => {
                  if (node.id === payload.id) {
                    return {
                      ...node,
                      position: payload.position,
                      style: {
                        ...node.style,
                        transition: payload.final ? 'none' : 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }
                  }
                  return node
                }))
              }
            }
          )
          .on(
            'broadcast',
            { event: 'resize' },
            ({ payload }) => {
              if (!isSubscribed) return
              setNodes((nds) => nds.map(node => {
                if (node.id === payload.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      width: payload.width,
                      height: payload.height
                    }
                  }
                }
                return node
              }))
            }
          )
          .on(
            'broadcast',
            { event: 'rotate' },
            ({ payload }) => {
              if (!isSubscribed) return
              setNodes((nds) => nds.map(node => {
                if (node.id === payload.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      rotation: payload.rotation
                    }
                  }
                }
                return node
              }))
            }
          )

        // Subscribe to channel
        await channel.subscribe()
        isSubscribed = true
      } catch (error) {
        console.error('Error setting up channel:', error)
      }
    }

    // Initial setup
    loadNodes()
    setupChannel()

    // Cleanup function
    return () => {
      isSubscribed = false
      if (channel) {
        channel.unsubscribe()
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      dragIdRef.current = null
    }
  }, [canvasId, setNodes, isOwner, supabase])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOwner) return

      // Ctrl+A to select all
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        setSelectedNodes(nodes.map(node => node.id))
      }

      // Delete key to delete selected nodes
      if (e.key === 'Delete' && selectedNodes.length > 0) {
        setSelectedNodeForDelete('multiple')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOwner, nodes, selectedNodes])

  // Handle node selection
  const handleSelectionChange = useCallback((params: { nodes: Node[] }) => {
    setSelectedNodes(params.nodes.map(node => node.id))
  }, [])

  // Handle node deletion (updated to support multiple nodes)
  const handleDeleteNodes = useCallback(async (nodeIds: string[]) => {
    try {
      // Delete from database and storage
      await Promise.all(nodeIds.map(async (nodeId) => {
        // First get the node to get the image URL
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return

        // Extract filename from URL
        const url = node.data.url
        const filePath = `${canvasId}/${url.split('/').pop()}`

        // Broadcast deletion through Supabase Realtime
        channelRef.current?.send({
          type: 'broadcast',
          event: 'delete',
          payload: {
            id: nodeId
          }
        })

        // Delete from database
        const { error: dbError } = await supabase
          .from('canvas_media_objects')
          .delete()
          .eq('id', nodeId)

        if (dbError) throw dbError

        // Then delete from storage bucket
        const { error: storageError } = await supabase.storage
          .from('canvas_images')
          .remove([filePath])

        if (storageError) {
          console.error('Error deleting from storage:', storageError)
        }
      }))

      // Remove from local state
      setNodes((nds) => nds.filter(node => !nodeIds.includes(node.id)))
      setSelectedNodes([])

    } catch (error) {
      console.error('Error deleting nodes:', error)
    }
  }, [canvasId, setNodes, supabase, nodes])

  // Handle context menu (updated for multiple selection)
  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (!isOwner) return
      event.preventDefault()

      // Check if we clicked on a node
      const targetElement = event.target as HTMLElement
      const nodeElement = targetElement.closest('.react-flow__node')

      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-id')
        if (nodeId) {
          // If the clicked node is not in the selection, clear selection
          if (!selectedNodes.includes(nodeId)) {
            setSelectedNodes([nodeId])
          }
          setContextMenuType('node')
          setContextMenuNodeId('multiple')
          setContextMenu({ x: event.clientX, y: event.clientY })
        }
      } else {
        // Clicked on canvas
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        setContextMenuType('canvas')
        setContextMenuNodeId(null)
        setContextMenu({ x: event.clientX, y: event.clientY })
        setUploadPosition(position)
      }
    },
    [screenToFlowPosition, isOwner, selectedNodes]
  )

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!uploadPosition || !userId) return

    try {
      // Generate UUID for the node
      const nodeId = crypto.randomUUID()

      // Get natural dimensions
      const naturalDimensions = await new Promise<{ width: number, height: number }>((resolve) => {
        const img = new Image()
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          })
        }
        img.src = URL.createObjectURL(file)
      })

      // Upload to storage bucket
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${canvasId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('canvas_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('canvas_images')
        .getPublicUrl(filePath)

      // Save to database
      const { error: dbError } = await supabase
        .from('canvas_media_objects')
        .insert({
          id: nodeId,
          canvas_id: canvasId,
          user_id: userId,
          type: 'image',
          url: publicUrl,
          position_x: uploadPosition.x,
          position_y: uploadPosition.y,
          width: naturalDimensions.width,
          height: naturalDimensions.height,
          rotation: 0
        })

      if (dbError) throw dbError

      // Add node to canvas after successful database insert
      const newNode: Node = {
        id: nodeId,
        type: 'imageNode',
        position: uploadPosition,
        data: {
          url: publicUrl,
          width: naturalDimensions.width,
          height: naturalDimensions.height,
          rotation: 0,
          zIndex: 0
        }
      }

      setNodes((nds) => nds.concat(newNode))

    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }, [canvasId, supabase, uploadPosition, setNodes, userId])

  return (
    <div
      style={{
        width: isOwner ? '100%' : '1920px',
        height: isOwner ? '100%' : '1080px',
        position: isOwner ? 'absolute' : 'relative',
        inset: isOwner ? '0' : undefined,
        background: isOwner ? undefined : 'transparent'
      }}
      className={`${isOwner ? "fixed" : ""} ${!isOwner ? "!bg-transparent" : ""}`}
      onContextMenu={onContextMenu}
      onClick={() => {
        setContextMenu(null)
        setContextMenuType(null)
        setContextMenuNodeId(null)
      }}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={handleNodesChange}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={isOwner}
        elementsSelectable={isOwner}
        nodesConnectable={false}
        multiSelectionKeyCode="Control"
        selectionOnDrag={false}
        minZoom={0.1}
        maxZoom={4}
        preventScrolling={true}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={isOwner}
        selectNodesOnDrag={false}
        className={`${!isOwner ? 'pointer-events-none !bg-transparent' : ''}`}
        style={{ background: isOwner ? undefined : 'transparent' }}
        proOptions={{ hideAttribution: true }}
        translateExtent={[
          [CANVAS_BOUNDS.minX, CANVAS_BOUNDS.minY],
          [CANVAS_BOUNDS.maxX, CANVAS_BOUNDS.maxY]
        ]}
      >
        {isOwner && <Background />}
        {isOwner && <BoundaryBox />}
        {isOwner && (
          <div className="absolute right-4 bottom-4 z-[60]">
            <Controls
              className="!bg-background/80 !backdrop-blur-sm !p-2 !rounded-lg !border !border-white/10 [&>button]:w-6 [&>button]:h-6 [&>button]:bg-white/10 [&>button]:text-white [&>button:hover]:bg-white/20"
              showZoom={true}
              showFitView={true}
              position="bottom-right"
            />
          </div>
        )}
        {isOwner && <OBSViewport />}
      </ReactFlow>

      {contextMenu && contextMenuType === 'canvas' && (
        <div
          className="fixed border border-white/10 rounded-lg shadow-lg py-1 z-50"
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'rgb(24 24 27)'
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left transition-colors hover:bg-zinc-800"
            onClick={() => {
              fileInputRef.current?.click()
              setContextMenu(null)
              setContextMenuType(null)
            }}
          >
            Upload Image
          </button>
        </div>
      )}

      {contextMenu && contextMenuType === 'node' && contextMenuNodeId && (
        <div
          className="fixed border border-white/10 rounded-lg shadow-lg py-1 z-50"
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'rgb(24 24 27)'
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-500 transition-colors hover:bg-zinc-800"
            onClick={() => {
              setSelectedNodeForDelete(contextMenuNodeId)
              setContextMenu(null)
              setContextMenuType(null)
              setContextMenuNodeId(null)
            }}
          >
            Delete Image
          </button>
        </div>
      )}

      {selectedNodeForDelete && (
        <ConfirmDialog
          count={selectedNodeForDelete === 'multiple' ? selectedNodes.length : 1}
          onConfirm={() => {
            if (selectedNodeForDelete === 'multiple') {
              handleDeleteNodes(selectedNodes)
            } else {
              handleDeleteNodes([selectedNodeForDelete])
            }
            setSelectedNodeForDelete(null)
          }}
          onCancel={() => setSelectedNodeForDelete(null)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileUpload(file)
          }
        }}
      />
    </div>
  )
}

// Export the wrapped component
export function FlowCanvasV2(props: FlowCanvasV2Props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  )
} 