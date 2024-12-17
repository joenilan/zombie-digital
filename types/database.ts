export type UserLevel = "owner" | "admin" | "moderator" | "user";

export interface SiteRole {
  id: string;
  name: UserLevel;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TwitchUser {
  id: string;
  twitch_id: string;
  username: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  provider_id: string;
  provider_token: string | null;
  provider_refresh_token: string | null;
  provider_scopes: string[];
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  raw_user_meta_data: any;
  raw_app_meta_data: any;
  role: string;
  site_role: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  confirmed_at: string;
  is_anonymous: boolean;
  follower_count: number;
  subscriber_count: number;
  channel_points: number;
  stream_live: boolean;
  stream_title?: string;
  current_game?: {
    name: string;
    box_art_url: string;
  };
  tags?: string[];
  twitch_role?: string;
}

export type TwitchUserUpdate = Partial<TwitchUser>;
