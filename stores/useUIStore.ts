import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // Dialog states
  dialogs: {
    [key: string]: boolean
  }
  
  // Loading states
  loadingStates: {
    [key: string]: boolean
  }
  
  // General UI state
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  
  // Actions
  openDialog: (dialogId: string) => void
  closeDialog: (dialogId: string) => void
  toggleDialog: (dialogId: string) => void
  setLoading: (key: string, loading: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  reset: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      dialogs: {},
      loadingStates: {},
      sidebarOpen: false,
      mobileMenuOpen: false,

      // Actions
      openDialog: (dialogId) => set(
        (state) => ({
          dialogs: { ...state.dialogs, [dialogId]: true }
        }),
        false,
        `ui:openDialog:${dialogId}`
      ),
      
      closeDialog: (dialogId) => set(
        (state) => ({
          dialogs: { ...state.dialogs, [dialogId]: false }
        }),
        false,
        `ui:closeDialog:${dialogId}`
      ),
      
      toggleDialog: (dialogId) => set(
        (state) => ({
          dialogs: { ...state.dialogs, [dialogId]: !state.dialogs[dialogId] }
        }),
        false,
        `ui:toggleDialog:${dialogId}`
      ),
      
      setLoading: (key, loading) => set(
        (state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        }),
        false,
        `ui:setLoading:${key}:${loading}`
      ),
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, 'ui:setSidebarOpen'),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }, false, 'ui:setMobileMenuOpen'),
      
      reset: () => set({
        dialogs: {},
        loadingStates: {},
        sidebarOpen: false,
        mobileMenuOpen: false
      }, false, 'ui:reset'),
    }),
    {
      name: 'ui-store',
    }
  )
) 