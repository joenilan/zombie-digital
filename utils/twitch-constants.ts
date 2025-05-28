export const TWITCH_SCOPES = [
  // User info and profile
  'user:read:email',
  'user:edit',
  
  // Channel management and info
  'channel:read:subscriptions',
  'channel:read:vips',
  'channel:manage:vips',
  'channel:read:editors',
  'channel:read:goals',
  'channel:read:hype_train',
  'channel:read:charity',
  'channel:read:ads',
  'channel:read:stream_key',
  'channel:manage:broadcast',
  'channel:edit:commercial',
  
  // Moderation
  'moderation:read',
  'moderator:read:followers',
  'moderator:read:moderators',
  'moderator:read:vips',
  'moderator:read:chatters',
  'moderator:read:banned_users',
  'moderator:read:automod_settings',
  'moderator:read:blocked_terms',
  'moderator:read:chat_settings',
  'moderator:read:unban_requests',
  'moderator:read:warnings',
  'moderator:read:suspicious_users',
  'moderator:read:shield_mode',
  'moderator:read:shoutouts',
  'moderator:read:guest_star',
  
  // Channel Points and Rewards
  'channel:read:redemptions',
  'channel:manage:redemptions',
  
  // Polls and Predictions
  'channel:read:polls',
  'channel:manage:polls',
  'channel:read:predictions',
  'channel:manage:predictions',
  
  // Bits and Analytics
  'bits:read',
  'analytics:read:extensions',
  'analytics:read:games',
  
  // Chat
  'user:read:chat',
  'user:bot',
  'channel:bot',
  'moderator:read:chat_messages',
  
  // Clips and Videos
  'clips:edit',
  'channel:manage:videos',
  
  // Raids and Schedule
  'channel:manage:raids',
  'channel:manage:schedule',
  
  // Extensions
  'channel:read:extensions',
  'channel:manage:extensions',
  'user:read:broadcast',
  'user:edit:broadcast',
  
  // Follows
  'user:read:follows',
  
  // Whispers
  'user:manage:whispers',
  
  // Block management
  'user:read:blocked_users',
  'user:manage:blocked_users',
  
  // Emotes
  'user:read:emotes',
  
  // Chat color
  'user:manage:chat_color'
] as const;

// Type for the scopes
export type TwitchScope = (typeof TWITCH_SCOPES)[number];

// Helper to check if a scope is valid
export function isValidTwitchScope(scope: string): scope is TwitchScope {
  return TWITCH_SCOPES.includes(scope as TwitchScope);
}

// We can also add other Twitch-specific constants here
export const TWITCH_API_URL = "https://api.twitch.tv/helix";
export const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2";

// Twitch API endpoints
export const TWITCH_ENDPOINTS = {
  USERS: "/users",
  CHANNELS: "/channels",
  STREAMS: "/streams",
  CHAT: "/chat",
  MODERATORS: "/moderation/moderators",
  FOLLOWERS: "/followers",
  VIPS: "/channels/vips",
  SUBSCRIBERS: "/subscriptions",
} as const;
