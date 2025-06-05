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
  [key: string]: any
}

interface TwitchUser {
  id: string
  username: string
  display_name?: string
  profile_image_url?: string
  background_media_url: string | null
  background_media_type: string | null
  created_at?: string
  custom_bio?: string
  [key: string]: any
}

interface SocialLinksState {
  // State
  twitchUser: TwitchUser | null
  links: SocialLink[]
  profileViews: number
  isLoading: boolean
  activeTab: 'links' | 'analytics' | 'settings'
  showAddLinkDialog: boolean

  // Actions
  setTwitchUser: (user: TwitchUser | null) => void
  setLinks: (links: SocialLink[]) => void
  setProfileViews: (views: number) => void
  setIsLoading: (loading: boolean) => void
  setActiveTab: (tab: 'links' | 'analytics' | 'settings') => void
  setShowAddLinkDialog: (show: boolean) => void
  updateBackground: (background: { url: string | null; type: string | null }) => void
  reset: () => void
}

export const useSocialLinksStore = create<SocialLinksState>()(
  devtools(
    (set, get) => ({
      // Initial state
      twitchUser: null,
      links: [],
      profileViews: 0,
      isLoading: true,
      activeTab: 'links',
      showAddLinkDialog: false,

      // Actions
      setTwitchUser: (twitchUser) => set({ twitchUser }, false, 'socialLinks:setTwitchUser'),
      setLinks: (links) => set({ links }, false, 'socialLinks:setLinks'),
      setProfileViews: (profileViews) => set({ profileViews }, false, 'socialLinks:setProfileViews'),
      setIsLoading: (isLoading) => set({ isLoading }, false, 'socialLinks:setIsLoading'),
      setActiveTab: (activeTab) => set({ activeTab }, false, 'socialLinks:setActiveTab'),
      setShowAddLinkDialog: (showAddLinkDialog) => set({ showAddLinkDialog }, false, 'socialLinks:setShowAddLinkDialog'),
      updateBackground: (background) => {
        const currentUser = get().twitchUser
        if (currentUser) {
          set({ 
            twitchUser: {
              ...currentUser,
              background_media_url: background.url,
              background_media_type: background.type
            }
          }, false, 'socialLinks:updateBackground')
        }
      },
      reset: () => set({ 
        twitchUser: null,
        links: [],
        profileViews: 0,
        isLoading: true,
        activeTab: 'links',
        showAddLinkDialog: false
      }, false, 'socialLinks:reset'),
    }),
    {
      name: 'social-links-store',
    }
  )
) 