import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Role = 'user' | 'moderator' | 'admin' | 'owner'
export type SortField = 'created_at' | 'username' | 'display_name' | 'site_role'
export type SortDirection = 'asc' | 'desc'
export type PageSize = 10 | 25 | 50 | 100 | 'all'

export interface User {
  id: string
  username: string
  display_name?: string
  site_role: Role
  created_at: string
  [key: string]: any
}

interface AdminUsersState {
  // Search and filter state
  search: string
  sortField: SortField
  sortDirection: SortDirection
  roleFilter: Role | 'all'
  
  // Pagination state
  currentPage: number
  pageSize: PageSize
  
  // UI state
  isVisible: boolean
  
  // Actions
  setSearch: (search: string) => void
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  setRoleFilter: (role: Role | 'all') => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: PageSize) => void
  setIsVisible: (visible: boolean) => void
  
  // Combined actions
  updateSort: (field: SortField) => void
  resetFilters: () => void
  resetPagination: () => void
  resetAll: () => void
}

export const useAdminUsersStore = create<AdminUsersState>()(
  devtools(
    (set, get) => ({
      // Initial state
      search: '',
      sortField: 'created_at',
      sortDirection: 'desc',
      roleFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      isVisible: false,
      
      // Actions
      setSearch: (search) => {
        set({ search, currentPage: 1 }, false, 'setSearch')
      },
      
      setSortField: (field) => set({ sortField: field }, false, 'setSortField'),
      setSortDirection: (direction) => set({ sortDirection: direction }, false, 'setSortDirection'),
      
      setRoleFilter: (role) => {
        set({ roleFilter: role, currentPage: 1 }, false, 'setRoleFilter')
      },
      
      setCurrentPage: (page) => set({ currentPage: page }, false, 'setCurrentPage'),
      setPageSize: (size) => set({ pageSize: size, currentPage: 1 }, false, 'setPageSize'),
      setIsVisible: (visible) => set({ isVisible: visible }, false, 'setIsVisible'),
      
      // Combined actions
      updateSort: (field) => {
        const { sortField, sortDirection } = get()
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
        set({ 
          sortField: field, 
          sortDirection: newDirection,
          currentPage: 1 
        }, false, 'updateSort')
      },
      
      resetFilters: () => set({
        search: '',
        roleFilter: 'all',
        currentPage: 1
      }, false, 'resetFilters'),
      
      resetPagination: () => set({
        currentPage: 1,
        pageSize: 10
      }, false, 'resetPagination'),
      
      resetAll: () => set({
        search: '',
        sortField: 'created_at',
        sortDirection: 'desc',
        roleFilter: 'all',
        currentPage: 1,
        pageSize: 10,
        isVisible: false
      }, false, 'resetAll')
    }),
    {
      name: 'admin-users-store',
    }
  )
) 