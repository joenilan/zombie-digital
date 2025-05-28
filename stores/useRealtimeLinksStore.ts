import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  title?: string
  order_index: number
  created_at?: string
  updated_at?: string
}

export interface StreamInfo {
  title?: string
  game_name?: string
  viewer_count?: number
  started_at?: string
  [key: string]: any
}

interface RealtimeLinksState {
  // UI state
  isExpanded: boolean
  
  // Stream state
  isLive: boolean
  streamInfo: StreamInfo | null
  streamError: string | null
  
  // Links state
  links: SocialLink[]
  isUpdating: boolean
  lastUpdateType: 'INSERT' | 'UPDATE' | 'DELETE' | null
  
  // Actions
  setIsExpanded: (expanded: boolean) => void
  toggleExpanded: () => void
  
  // Stream actions
  setIsLive: (isLive: boolean) => void
  setStreamInfo: (info: StreamInfo | null) => void
  setStreamError: (error: string | null) => void
  
  // Links actions
  setLinks: (links: SocialLink[]) => void
  addLink: (link: SocialLink) => void
  updateLink: (link: SocialLink) => void
  removeLink: (linkId: string) => void
  setIsUpdating: (updating: boolean) => void
  setLastUpdateType: (type: 'INSERT' | 'UPDATE' | 'DELETE' | null) => void
  
  // Reset actions
  resetStreamState: () => void
  resetLinksState: () => void
  resetAll: () => void
}

export const useRealtimeLinksStore = create<RealtimeLinksState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isExpanded: false,
      
      // Stream state
      isLive: false,
      streamInfo: null,
      streamError: null,
      
      // Links state
      links: [],
      isUpdating: false,
      lastUpdateType: null,
      
      // Actions
      setIsExpanded: (expanded) => set({ isExpanded: expanded }, false, 'setIsExpanded'),
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded }), false, 'toggleExpanded'),
      
      // Stream actions
      setIsLive: (isLive) => set({ isLive }, false, 'setIsLive'),
      setStreamInfo: (info) => set({ streamInfo: info }, false, 'setStreamInfo'),
      setStreamError: (error) => set({ streamError: error }, false, 'setStreamError'),
      
      // Links actions
      setLinks: (links) => set({ links }, false, 'setLinks'),
      
      addLink: (link) => set(
        (state) => ({ links: [...state.links, link] }),
        false,
        'addLink'
      ),
      
      updateLink: (updatedLink) => set(
        (state) => ({
          links: state.links.map(link => 
            link.id === updatedLink.id ? updatedLink : link
          )
        }),
        false,
        'updateLink'
      ),
      
      removeLink: (linkId) => set(
        (state) => ({ links: state.links.filter(link => link.id !== linkId) }),
        false,
        'removeLink'
      ),
      
      setIsUpdating: (updating) => set({ isUpdating: updating }, false, 'setIsUpdating'),
      setLastUpdateType: (type) => set({ lastUpdateType: type }, false, 'setLastUpdateType'),
      
      // Reset actions
      resetStreamState: () => set({
        isLive: false,
        streamInfo: null,
        streamError: null
      }, false, 'resetStreamState'),
      
      resetLinksState: () => set({
        links: [],
        isUpdating: false,
        lastUpdateType: null
      }, false, 'resetLinksState'),
      
      resetAll: () => set({
        isExpanded: false,
        isLive: false,
        streamInfo: null,
        streamError: null,
        links: [],
        isUpdating: false,
        lastUpdateType: null
      }, false, 'resetAll')
    }),
    {
      name: 'realtime-links-store',
    }
  )
) 