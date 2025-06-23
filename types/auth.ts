export interface TwitchUser {
  id: string
  twitch_id: string
  username: string
  display_name: string
  email?: string
  profile_image_url: string
  site_role: string
  broadcaster_type: string
  provider_token: string
  provider_refresh_token: string
  token_expires_at: string
  background_media_type?: string | null
  background_media_url?: string | null
  custom_bio?: string | null
  colored_icons?: boolean
  theme_scheme?: string | null
  seasonal_themes?: boolean | null
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string
  [key: string]: any // Allow additional properties for flexibility
} 