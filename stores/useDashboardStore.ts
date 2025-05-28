import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TwitchStats {
  followers: number;
  isAffiliate: boolean;
  subscribers?: number;
  totalViewCount?: number;
  channelPoints?: {
    enabled: boolean;
    activeRewards: number;
  };
  lastGame: {
    id: string;
    name: string;
    boxArtUrl: string;
  } | null;
  isLive: boolean;
  title?: string;
  description?: string;
  tags?: string[];
  moderators?: number;
  vips?: number;
  createdAt?: string;
  broadcasterType?: string;
}

interface DashboardState {
  // State
  stats: TwitchStats | null
  loading: boolean
  error: string | null
  refreshing: boolean

  // Actions
  setStats: (stats: TwitchStats | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setRefreshing: (refreshing: boolean) => void
  reset: () => void
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      // Initial state
      stats: null,
      loading: true,
      error: null,
      refreshing: false,

      // Actions
      setStats: (stats) => set({ stats }, false, 'dashboard:setStats'),
      setLoading: (loading) => set({ loading }, false, 'dashboard:setLoading'),
      setError: (error) => set({ error }, false, 'dashboard:setError'),
      setRefreshing: (refreshing) => set({ refreshing }, false, 'dashboard:setRefreshing'),
      reset: () => set({ 
        stats: null, 
        loading: true, 
        error: null, 
        refreshing: false 
      }, false, 'dashboard:reset'),
    }),
    {
      name: 'dashboard-store',
    }
  )
) 