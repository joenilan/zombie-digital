import { TwitchScope } from "./twitch-constants";

export function canManageBroadcast(scopes: TwitchScope[]) {
  return scopes.includes("channel:manage:broadcast");
}

export function canModerateChat(scopes: TwitchScope[]) {
  return (
    scopes.includes("channel:moderate") &&
    scopes.includes("chat:read") &&
    scopes.includes("chat:edit")
  );
}

export function canManageRewards(scopes: TwitchScope[]) {
  return (
    scopes.includes("channel:manage:redemptions") &&
    scopes.includes("channel:read:redemptions")
  );
}

// Example usage in a component:
const hasModPermissions = canModerateChat(twitchUser.provider_scopes);
if (hasModPermissions) {
  // Show mod controls
}
