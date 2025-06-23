import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type UserRole = 'user' | 'moderator' | 'admin' | 'owner'

export interface Feature {
  id: string
  feature_id: string
  name: string
  description: string
  enabled: boolean
  required_role: UserRole
  category: string
  icon: string
  path: string
  sort_order: number
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface NewFeature {
  feature_id: string
  name: string
  description: string
  enabled: boolean
  required_role: UserRole
  category: string
  icon: string
  path: string
  sort_order: number
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
  // User management
  users: User[]
  usersLoading: boolean
  searchTerm: string
  sortField: SortField
  sortDirection: SortDirection
  selectedRole: Role | 'all'
  
  // Feature management
  features: Feature[]
  featuresLoading: boolean
  editingFeature: Feature | null
  newFeature: NewFeature
  showNewFeatureDialog: boolean
  
  // Permissions management
  permissions: FeaturePermission[]
  permissionsLoading: boolean
  
  // Actions
  setUsers: (users: User[]) => void
  setUsersLoading: (loading: boolean) => void
  setSearchTerm: (term: string) => void
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  setSelectedRole: (role: Role | 'all') => void
  
  setFeatures: (features: Feature[]) => void
  setFeaturesLoading: (loading: boolean) => void
  setEditingFeature: (feature: Feature | null) => void
  setNewFeature: (feature: NewFeature) => void
  updateNewFeature: (updates: Partial<NewFeature>) => void
  setShowNewFeatureDialog: (show: boolean) => void
  resetNewFeature: () => void
  
  setPermissions: (permissions: FeaturePermission[]) => void
  setPermissionsLoading: (loading: boolean) => void
  updatePermission: (featureId: string, role: UserRole, level: PermissionLevel) => void
}

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin'

export interface FeaturePermission {
    id: string
    feature_id: string
    role_name: UserRole
    permission_level: PermissionLevel
    created_at: string
    updated_at: string
    updated_by: string | null
}

const initialNewFeature: NewFeature = {
  feature_id: '',
  name: '',
  description: '',
  enabled: true,
  required_role: 'user',
  category: 'core',
  icon: '',
  path: '',
  sort_order: 0
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
      searchTerm: '',
      sortField: 'created_at',
      sortDirection: 'desc',
      selectedRole: 'all',

      permissions: [],
      permissionsLoading: true,

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
      setSearchTerm: (searchTerm) => set({ searchTerm }, false, 'admin:setSearchTerm'),
      setSortField: (sortField) => set({ sortField }, false, 'admin:setSortField'),
      setSortDirection: (sortDirection) => set({ sortDirection }, false, 'admin:setSortDirection'),
      setSelectedRole: (selectedRole) => set({ selectedRole }, false, 'admin:setSelectedRole'),

      // Actions - Permissions
      setPermissions: (permissions) => set({ permissions }, false, 'admin:setPermissions'),
      setPermissionsLoading: (permissionsLoading) => set({ permissionsLoading }, false, 'admin:setPermissionsLoading'),
      updatePermission: (featureId, role, level) => set((state) => ({
        permissions: state.permissions.map((permission) =>
          permission.feature_id === featureId ? { ...permission, role_name: role, permission_level: level } : permission
        )
      }), false, 'admin:updatePermission'),

      // Actions - General
      reset: () => set({
        features: [],
        featuresLoading: true,
        editingFeature: null,
        newFeature: initialNewFeature,
        showNewFeatureDialog: false,
        users: [],
        usersLoading: true,
        searchTerm: '',
        sortField: 'created_at',
        sortDirection: 'desc',
        selectedRole: 'all',
        permissions: [],
        permissionsLoading: true
      }, false, 'admin:reset'),
    }),
    {
      name: 'admin-store',
    }
  )
) 