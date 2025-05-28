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

export interface Platform {
  id: string
  name: string
  icon: string
  baseUrl: string
  placeholder: string
  validation?: RegExp
}

interface SocialLinksManagerState {
  // Links state
  links: SocialLink[]
  
  // Dialog states
  isEditDialogOpen: boolean
  isAddDialogOpen: boolean
  editingLink: SocialLink | null
  
  // Form states
  newLinkPlatform: string
  editUrl: string
  editTitle: string
  addPlatform: string
  addUsername: string
  addTitle: string
  
  // UI states
  isDraggingAny: boolean
  searchTerm: string
  isSearchOpen: boolean
  
  // Actions
  setLinks: (links: SocialLink[]) => void
  addLink: (link: SocialLink) => void
  updateLink: (link: SocialLink) => void
  removeLink: (linkId: string) => void
  reorderLinks: (links: SocialLink[]) => void
  
  // Dialog actions
  openEditDialog: (link: SocialLink) => void
  closeEditDialog: () => void
  openAddDialog: (platform?: string) => void
  closeAddDialog: () => void
  
  // Form actions
  setNewLinkPlatform: (platform: string) => void
  setEditUrl: (url: string) => void
  setEditTitle: (title: string) => void
  setAddPlatform: (platform: string) => void
  setAddUsername: (username: string) => void
  setAddTitle: (title: string) => void
  
  // UI actions
  setIsDraggingAny: (isDragging: boolean) => void
  setSearchTerm: (term: string) => void
  setIsSearchOpen: (isOpen: boolean) => void
  
  // Reset actions
  resetEditForm: () => void
  resetAddForm: () => void
  resetAll: () => void
}

export const useSocialLinksManagerStore = create<SocialLinksManagerState>()(
  devtools(
    (set, get) => ({
      // Initial state
      links: [],
      
      // Dialog states
      isEditDialogOpen: false,
      isAddDialogOpen: false,
      editingLink: null,
      
      // Form states
      newLinkPlatform: '',
      editUrl: '',
      editTitle: '',
      addPlatform: '',
      addUsername: '',
      addTitle: '',
      
      // UI states
      isDraggingAny: false,
      searchTerm: '',
      isSearchOpen: false,
      
      // Actions
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
      
      reorderLinks: (links) => set({ links }, false, 'reorderLinks'),
      
      // Dialog actions
      openEditDialog: (link) => set({
        editingLink: link,
        isEditDialogOpen: true,
        editUrl: link.url,
        editTitle: link.title || ''
      }, false, 'openEditDialog'),
      
      closeEditDialog: () => {
        const { resetEditForm } = get()
        set({
          isEditDialogOpen: false,
          editingLink: null
        }, false, 'closeEditDialog')
        resetEditForm()
      },
      
      openAddDialog: (platform = '') => set({
        isAddDialogOpen: true,
        addPlatform: platform
      }, false, 'openAddDialog'),
      
      closeAddDialog: () => {
        const { resetAddForm } = get()
        set({ isAddDialogOpen: false }, false, 'closeAddDialog')
        resetAddForm()
      },
      
      // Form actions
      setNewLinkPlatform: (platform) => set({ newLinkPlatform: platform }, false, 'setNewLinkPlatform'),
      setEditUrl: (url) => set({ editUrl: url }, false, 'setEditUrl'),
      setEditTitle: (title) => set({ editTitle: title }, false, 'setEditTitle'),
      setAddPlatform: (platform) => set({ addPlatform: platform }, false, 'setAddPlatform'),
      setAddUsername: (username) => set({ addUsername: username }, false, 'setAddUsername'),
      setAddTitle: (title) => set({ addTitle: title }, false, 'setAddTitle'),
      
      // UI actions
      setIsDraggingAny: (isDragging) => set({ isDraggingAny: isDragging }, false, 'setIsDraggingAny'),
      setSearchTerm: (term) => set({ searchTerm: term }, false, 'setSearchTerm'),
      setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }, false, 'setIsSearchOpen'),
      
      // Reset actions
      resetEditForm: () => set({
        editUrl: '',
        editTitle: ''
      }, false, 'resetEditForm'),
      
      resetAddForm: () => set({
        addPlatform: '',
        addUsername: '',
        addTitle: ''
      }, false, 'resetAddForm'),
      
      resetAll: () => set({
        links: [],
        isEditDialogOpen: false,
        isAddDialogOpen: false,
        editingLink: null,
        newLinkPlatform: '',
        editUrl: '',
        editTitle: '',
        addPlatform: '',
        addUsername: '',
        addTitle: '',
        isDraggingAny: false,
        searchTerm: '',
        isSearchOpen: false
      }, false, 'resetAll')
    }),
    {
      name: 'social-links-manager-store',
    }
  )
) 