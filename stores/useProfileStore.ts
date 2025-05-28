import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface StreamInfo {
  title?: string
  game_name?: string
  viewer_count?: number
  started_at?: string
  [key: string]: any
}

export interface BackgroundMedia {
  url: string | null
  type: string | null
}

interface ProfileState {
  // Ownership state
  isOwner: boolean
  ownershipLoading: boolean

  // Stream state
  isLive: boolean
  streamInfo: StreamInfo | null
  streamError: string | null

  // Background state
  background: BackgroundMedia
  backgroundLoading: boolean

  // UI state
  isExpanded: boolean
  shared: boolean
  qrDialogOpen: boolean

  // Realtime state
  isUpdating: boolean
  lastUpdateType: 'INSERT' | 'UPDATE' | 'DELETE' | null

  // Actions
  setIsOwner: (isOwner: boolean) => void
  setOwnershipLoading: (loading: boolean) => void
  
  setIsLive: (isLive: boolean) => void
  setStreamInfo: (info: StreamInfo | null) => void
  setStreamError: (error: string | null) => void
  
  setBackground: (background: BackgroundMedia) => void
  setBackgroundLoading: (loading: boolean) => void
  
  setIsExpanded: (expanded: boolean) => void
  setShared: (shared: boolean) => void
  setQrDialogOpen: (open: boolean) => void
  
  setIsUpdating: (updating: boolean) => void
  setLastUpdateType: (type: 'INSERT' | 'UPDATE' | 'DELETE' | null) => void
  
  reset: () => void
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      // Initial state
      isOwner: false,
      ownershipLoading: true,
      
      isLive: false,
      streamInfo: null,
      streamError: null,
      
      background: { url: null, type: null },
      backgroundLoading: true,
      
      isExpanded: false,
      shared: false,
      qrDialogOpen: false,
      
      isUpdating: false,
      lastUpdateType: null,

      // Actions
      setIsOwner: (isOwner) => set({ isOwner }, false, 'profile:setIsOwner'),
      setOwnershipLoading: (ownershipLoading) => set({ ownershipLoading }, false, 'profile:setOwnershipLoading'),
      
      setIsLive: (isLive) => set({ isLive }, false, 'profile:setIsLive'),
      setStreamInfo: (streamInfo) => set({ streamInfo }, false, 'profile:setStreamInfo'),
      setStreamError: (streamError) => set({ streamError }, false, 'profile:setStreamError'),
      
      setBackground: (background) => set({ background }, false, 'profile:setBackground'),
      setBackgroundLoading: (backgroundLoading) => set({ backgroundLoading }, false, 'profile:setBackgroundLoading'),
      
      setIsExpanded: (isExpanded) => set({ isExpanded }, false, 'profile:setIsExpanded'),
      setShared: (shared) => set({ shared }, false, 'profile:setShared'),
      setQrDialogOpen: (qrDialogOpen) => set({ qrDialogOpen }, false, 'profile:setQrDialogOpen'),
      
      setIsUpdating: (isUpdating) => set({ isUpdating }, false, 'profile:setIsUpdating'),
      setLastUpdateType: (lastUpdateType) => set({ lastUpdateType }, false, 'profile:setLastUpdateType'),
      
      reset: () => set({
        isOwner: false,
        ownershipLoading: true,
        isLive: false,
        streamInfo: null,
        streamError: null,
        background: { url: null, type: null },
        backgroundLoading: true,
        isExpanded: false,
        shared: false,
        qrDialogOpen: false,
        isUpdating: false,
        lastUpdateType: null
      }, false, 'profile:reset'),
    }),
    {
      name: 'profile-store',
    }
  )
) 