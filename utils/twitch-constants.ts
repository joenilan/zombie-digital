export const TWITCH_SCOPES = [
  "channel:read:subscriptions",
  "channel_subscriptions",
  "channel:read:redemptions",
  "channel:read:polls",
  "channel:read:predictions",
  "channel:read:goals",
  "channel:read:hype_train",
  "analytics:read:games",
  "user:read:email",
  "user:read:broadcast",
  "channel:moderate",
  "chat:read",
  "chat:edit",
  "channel:manage:broadcast",
  "channel:manage:redemptions",
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
  MODERATORS: "/moderators",
  FOLLOWERS: "/followers",
} as const;
