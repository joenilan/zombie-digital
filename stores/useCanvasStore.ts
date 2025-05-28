import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Canvas {
  id: string
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
  is_public: boolean
  [key: string]: any
}

export interface CanvasData {
  id: string
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
  is_public: boolean
  settings?: any
  [key: string]: any
}

export interface MediaObject {
  id: string
  canvas_id: string
  type: string
  url: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  z_index: number
  created_at: string
  [key: string]: any
}

interface CanvasState {
  // Canvas list state
  canvases: Canvas[]
  canvasesLoading: boolean
  canvasesError: string | null

  // Individual canvas state
  currentCanvas: CanvasData | null
  canvasLoading: boolean
  canvasError: string | null

  // Canvas settings state
  canvasSettings: any
  settingsLoading: boolean
  settingsError: string | null

  // Media objects state
  mediaObjects: MediaObject[]
  mediaLoading: boolean
  mediaError: string | null

  // UI state
  visibleUrls: Set<string>
  isDeleting: string | null
  selectedNodes: string[]
  contextMenu: { x: number; y: number } | null
  contextMenuType: 'canvas' | 'node' | null
  contextMenuNodeId: string | null

  // Actions
  setCanvases: (canvases: Canvas[]) => void
  setCanvasesLoading: (loading: boolean) => void
  setCanvasesError: (error: string | null) => void
  
  setCurrentCanvas: (canvas: CanvasData | null) => void
  setCanvasLoading: (loading: boolean) => void
  setCanvasError: (error: string | null) => void
  
  setCanvasSettings: (settings: any) => void
  setSettingsLoading: (loading: boolean) => void
  setSettingsError: (error: string | null) => void
  
  setMediaObjects: (objects: MediaObject[]) => void
  setMediaLoading: (loading: boolean) => void
  setMediaError: (error: string | null) => void
  
  setVisibleUrls: (urls: Set<string>) => void
  addVisibleUrl: (url: string) => void
  removeVisibleUrl: (url: string) => void
  
  setIsDeleting: (id: string | null) => void
  setSelectedNodes: (nodes: string[]) => void
  addSelectedNode: (nodeId: string) => void
  removeSelectedNode: (nodeId: string) => void
  clearSelectedNodes: () => void
  
  setContextMenu: (menu: { x: number; y: number } | null) => void
  setContextMenuType: (type: 'canvas' | 'node' | null) => void
  setContextMenuNodeId: (id: string | null) => void
  closeContextMenu: () => void
  
  reset: () => void
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // Initial state
      canvases: [],
      canvasesLoading: true,
      canvasesError: null,
      
      currentCanvas: null,
      canvasLoading: true,
      canvasError: null,
      
      canvasSettings: null,
      settingsLoading: true,
      settingsError: null,
      
      mediaObjects: [],
      mediaLoading: true,
      mediaError: null,
      
      visibleUrls: new Set(),
      isDeleting: null,
      selectedNodes: [],
      contextMenu: null,
      contextMenuType: null,
      contextMenuNodeId: null,

      // Actions
      setCanvases: (canvases) => set({ canvases }, false, 'canvas:setCanvases'),
      setCanvasesLoading: (canvasesLoading) => set({ canvasesLoading }, false, 'canvas:setCanvasesLoading'),
      setCanvasesError: (canvasesError) => set({ canvasesError }, false, 'canvas:setCanvasesError'),
      
      setCurrentCanvas: (currentCanvas) => set({ currentCanvas }, false, 'canvas:setCurrentCanvas'),
      setCanvasLoading: (canvasLoading) => set({ canvasLoading }, false, 'canvas:setCanvasLoading'),
      setCanvasError: (canvasError) => set({ canvasError }, false, 'canvas:setCanvasError'),
      
      setCanvasSettings: (canvasSettings) => set({ canvasSettings }, false, 'canvas:setCanvasSettings'),
      setSettingsLoading: (settingsLoading) => set({ settingsLoading }, false, 'canvas:setSettingsLoading'),
      setSettingsError: (settingsError) => set({ settingsError }, false, 'canvas:setSettingsError'),
      
      setMediaObjects: (mediaObjects) => set({ mediaObjects }, false, 'canvas:setMediaObjects'),
      setMediaLoading: (mediaLoading) => set({ mediaLoading }, false, 'canvas:setMediaLoading'),
      setMediaError: (mediaError) => set({ mediaError }, false, 'canvas:setMediaError'),
      
      setVisibleUrls: (visibleUrls) => set({ visibleUrls }, false, 'canvas:setVisibleUrls'),
      addVisibleUrl: (url) => set((state) => ({ 
        visibleUrls: new Set([...state.visibleUrls, url]) 
      }), false, 'canvas:addVisibleUrl'),
      removeVisibleUrl: (url) => set((state) => {
        const newUrls = new Set(state.visibleUrls)
        newUrls.delete(url)
        return { visibleUrls: newUrls }
      }, false, 'canvas:removeVisibleUrl'),
      
      setIsDeleting: (isDeleting) => set({ isDeleting }, false, 'canvas:setIsDeleting'),
      setSelectedNodes: (selectedNodes) => set({ selectedNodes }, false, 'canvas:setSelectedNodes'),
      addSelectedNode: (nodeId) => set((state) => ({
        selectedNodes: [...state.selectedNodes, nodeId]
      }), false, 'canvas:addSelectedNode'),
      removeSelectedNode: (nodeId) => set((state) => ({
        selectedNodes: state.selectedNodes.filter(id => id !== nodeId)
      }), false, 'canvas:removeSelectedNode'),
      clearSelectedNodes: () => set({ selectedNodes: [] }, false, 'canvas:clearSelectedNodes'),
      
      setContextMenu: (contextMenu) => set({ contextMenu }, false, 'canvas:setContextMenu'),
      setContextMenuType: (contextMenuType) => set({ contextMenuType }, false, 'canvas:setContextMenuType'),
      setContextMenuNodeId: (contextMenuNodeId) => set({ contextMenuNodeId }, false, 'canvas:setContextMenuNodeId'),
      closeContextMenu: () => set({ 
        contextMenu: null, 
        contextMenuType: null, 
        contextMenuNodeId: null 
      }, false, 'canvas:closeContextMenu'),
      
      reset: () => set({
        canvases: [],
        canvasesLoading: true,
        canvasesError: null,
        currentCanvas: null,
        canvasLoading: true,
        canvasError: null,
        canvasSettings: null,
        settingsLoading: true,
        settingsError: null,
        mediaObjects: [],
        mediaLoading: true,
        mediaError: null,
        visibleUrls: new Set(),
        isDeleting: null,
        selectedNodes: [],
        contextMenu: null,
        contextMenuType: null,
        contextMenuNodeId: null
      }, false, 'canvas:reset'),
    }),
    {
      name: 'canvas-store',
    }
  )
) 