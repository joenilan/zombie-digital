import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
  created_at: string
  updated_at: string
  [key: string]: any
}

export interface NewFeature {
  name: string
  description: string
  enabled: boolean
}

export type Role = 'user' | 'moderator' | 'admin' | 'owner'
export type SortField = 'created_at' | 'username' | 'display_name' | 'site_role'
export type SortDirection = 'asc' | 'desc'
export type PageSize = 10 | 25 | 50 | 100

export interface User {
  id: string
  username: string
  display_name?: string
  site_role: Role
  created_at: string
  [key: string]: any
}

interface AdminState {
  // Features state
  features: Feature[]
  featuresLoading: boolean
  editingFeature: Feature | null
  newFeature: NewFeature
  showNewFeatureDialog: boolean

  // Users state
  users: User[]
  usersLoading: boolean
  search: string
  sortField: SortField
  sortDirection: SortDirection
  roleFilter: Role | 'all'
  currentPage: number
  pageSize: PageSize

  // Notifications state
  userId: string | null

  // Actions - Features
  setFeatures: (features: Feature[]) => void
  setFeaturesLoading: (loading: boolean) => void
  setEditingFeature: (feature: Feature | null) => void
  setNewFeature: (feature: NewFeature) => void
  updateNewFeature: (updates: Partial<NewFeature>) => void
  setShowNewFeatureDialog: (show: boolean) => void
  resetNewFeature: () => void

  // Actions - Users
  setUsers: (users: User[]) => void
  setUsersLoading: (loading: boolean) => void
  setSearch: (search: string) => void
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  setRoleFilter: (role: Role | 'all') => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: PageSize) => void

  // Actions - Notifications
  setUserId: (userId: string | null) => void

  // Actions - General
  reset: () => void
}

const initialNewFeature: NewFeature = {
  name: '',
  description: '',
  enabled: true
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set) => ({
      // Initial state
      features: [],
      featuresLoading: true,
      editingFeature: null,
      newFeature: initialNewFeature,
      showNewFeatureDialog: false,

      users: [],
      usersLoading: true,
      search: '',
      sortField: 'created_at',
      sortDirection: 'desc',
      roleFilter: 'all',
      currentPage: 1,
      pageSize: 10,

      userId: null,

      // Actions - Features
      setFeatures: (features) => set({ features }, false, 'admin:setFeatures'),
      setFeaturesLoading: (featuresLoading) => set({ featuresLoading }, false, 'admin:setFeaturesLoading'),
      setEditingFeature: (editingFeature) => set({ editingFeature }, false, 'admin:setEditingFeature'),
      setNewFeature: (newFeature) => set({ newFeature }, false, 'admin:setNewFeature'),
      updateNewFeature: (updates) => set((state) => ({
        newFeature: { ...state.newFeature, ...updates }
      }), false, 'admin:updateNewFeature'),
      setShowNewFeatureDialog: (showNewFeatureDialog) => set({ showNewFeatureDialog }, false, 'admin:setShowNewFeatureDialog'),
      resetNewFeature: () => set({ newFeature: initialNewFeature }, false, 'admin:resetNewFeature'),

      // Actions - Users
      setUsers: (users) => set({ users }, false, 'admin:setUsers'),
      setUsersLoading: (usersLoading) => set({ usersLoading }, false, 'admin:setUsersLoading'),
      setSearch: (search) => set({ search }, false, 'admin:setSearch'),
      setSortField: (sortField) => set({ sortField }, false, 'admin:setSortField'),
      setSortDirection: (sortDirection) => set({ sortDirection }, false, 'admin:setSortDirection'),
      setRoleFilter: (roleFilter) => set({ roleFilter }, false, 'admin:setRoleFilter'),
      setCurrentPage: (currentPage) => set({ currentPage }, false, 'admin:setCurrentPage'),
      setPageSize: (pageSize) => set({ pageSize }, false, 'admin:setPageSize'),

      // Actions - Notifications
      setUserId: (userId) => set({ userId }, false, 'admin:setUserId'),

      // Actions - General
      reset: () => set({
        features: [],
        featuresLoading: true,
        editingFeature: null,
        newFeature: initialNewFeature,
        showNewFeatureDialog: false,
        users: [],
        usersLoading: true,
        search: '',
        sortField: 'created_at',
        sortDirection: 'desc',
        roleFilter: 'all',
        currentPage: 1,
        pageSize: 10,
        userId: null
      }, false, 'admin:reset'),
    }),
    {
      name: 'admin-store',
    }
  )
) 