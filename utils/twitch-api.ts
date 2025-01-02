import { authService } from "@/lib/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const TWITCH_API_URL = "https://api.twitch.tv/helix";

interface TwitchStats {
  followers: number;
  isAffiliate: boolean;
  subscribers?: number;
  totalViews?: number;
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
}

async function refreshTwitchToken(userId: string, refreshToken: string) {
  const maxRetries = 3;
  let retryCount = 0;

  // First check if we have a valid session
  const {
    data: { session },
  } = await authService.getCurrentSession();
  if (!session) {
    throw new Error("No active session");
  }

  while (retryCount < maxRetries) {
    try {
      const response = await fetch("/api/auth/refresh-twitch-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Token refresh failed (${response.status}):`, errorData);

        // For 401/403 errors, try to get a fresh session first
        if (response.status === 401 || response.status === 403) {
          const freshSession = await authService.validateAndRefreshSession();
          if (!freshSession) {
            // Only sign out if we can't get a fresh session
            await authService.signOut();
            throw new Error("Session expired - Please sign in again");
          }

          // If we got a fresh session, retry with the new refresh token
          if (retryCount < maxRetries - 1) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            );
            continue;
          }
        }

        // For other errors, retry if we haven't hit the limit
        if (retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          continue;
        }

        throw new Error(
          `Failed to refresh token: ${response.status} ${errorData}`
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Token refresh response indicated failure");
      }

      const supabase = createClientComponentClient();
      const { data: user, error: dbError } = await supabase
        .from("twitch_users")
        .select("provider_token")
        .eq("id", userId)
        .single();

      if (dbError) {
        console.error("Database error after token refresh:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!user?.provider_token) {
        console.error("No provider token found after successful refresh");
        throw new Error("No provider token found after refresh");
      }

      return user.provider_token;
    } catch (error) {
      if (error instanceof Error && error.message.includes("sign in again")) {
        throw error; // Re-throw auth errors immediately
      }

      if (retryCount === maxRetries - 1) {
        console.error("Max retries reached for token refresh:", error);
        throw error;
      }

      retryCount++;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }

  throw new Error("Failed to refresh token after max retries");
}

export async function fetchTwitchStats(
  broadcasterId: string,
  accessToken: string,
  broadcasterType: string
): Promise<TwitchStats> {
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
    Accept: "application/json",
  };

  try {
    // Validate token first
    const validateResponse = await fetch(
      "https://id.twitch.tv/oauth2/validate",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!validateResponse.ok) {
      console.error("Token validation failed:", {
        status: validateResponse.status,
        statusText: validateResponse.statusText,
      });

      // Token is invalid, try to refresh
      const {
        data: { session },
      } = await authService.getCurrentSession();
      if (!session) {
        throw new Error("No session available");
      }

      try {
        // Get fresh token using refresh endpoint
        const newToken = await refreshTwitchToken(
          session.user.id,
          session.refresh_token
        );
        if (!newToken) {
          throw new Error("Failed to refresh token");
        }

        // Retry with new token
        return fetchTwitchStats(broadcasterId, newToken, broadcasterType);
      } catch (error) {
        if (error instanceof Error && error.message.includes("sign in again")) {
          // Redirect to sign in page instead of throwing
          window.location.href = "/auth/signin";
          return {
            followers: 0,
            isAffiliate: false,
            isLive: false,
            lastGame: null,
          };
        }
        throw error;
      }
    }

    // Get user info for followers count
    const userResponse = await fetch(
      `${TWITCH_API_URL}/users?id=${broadcasterId}`,
      { headers }
    );
    const userData = await userResponse.json();
    const user = userData.data?.[0];

    // Get followers count
    const followersResponse = await fetch(
      `${TWITCH_API_URL}/channels/followers?broadcaster_id=${broadcasterId}`,
      { headers }
    );
    const followersData = await followersResponse.json();

    // Get channel info
    const channelResponse = await fetch(
      `${TWITCH_API_URL}/channels?broadcaster_id=${broadcasterId}`,
      { headers }
    );
    const channelData = await channelResponse.json();

    // Get stream info
    const streamResponse = await fetch(
      `${TWITCH_API_URL}/streams?user_id=${broadcasterId}`,
      { headers }
    );
    const streamData = await streamResponse.json();

    // Get channel points rewards
    const pointsResponse = await fetch(
      `${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
      { headers }
    );
    const pointsData = await pointsResponse.json();

    // Get subscribers if affiliate/partner
    let subscriberCount = undefined;
    if (broadcasterType === "affiliate" || broadcasterType === "partner") {
      try {
        const subsResponse = await fetch(
          `${TWITCH_API_URL}/subscriptions?broadcaster_id=${broadcasterId}`,
          { headers }
        );
        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          subscriberCount = subsData.total || 0;
        }
      } catch (error) {
        console.error("Error fetching subscriber count:", error);
      }
    }

    // Get moderators (with pagination)
    interface TwitchModerator {
      user_id: string;
      user_login: string;
      user_name: string;
    }

    interface TwitchVIP {
      user_id: string;
      user_login: string;
      user_name: string;
    }

    let allModerators: TwitchModerator[] = [];
    let cursor: string | null = null;
    do {
      const modsUrl = new URL(`${TWITCH_API_URL}/moderation/moderators`);
      modsUrl.searchParams.append("broadcaster_id", broadcasterId);
      modsUrl.searchParams.append("first", "100"); // Max per page
      if (cursor) {
        modsUrl.searchParams.append("after", cursor);
      }

      const modsResponse = await fetch(modsUrl.toString(), { headers });
      const modsData = await modsResponse.json();

      if (modsData.data) {
        allModerators = [...allModerators, ...modsData.data];
      }

      cursor = modsData.pagination?.cursor;
    } while (cursor);

    // Get VIPs (with pagination)
    let allVips: TwitchVIP[] = [];
    cursor = null;
    do {
      const vipsUrl = new URL(`${TWITCH_API_URL}/channels/vips`);
      vipsUrl.searchParams.append("broadcaster_id", broadcasterId);
      vipsUrl.searchParams.append("first", "100"); // Max per page
      if (cursor) {
        vipsUrl.searchParams.append("after", cursor);
      }

      const vipsResponse = await fetch(vipsUrl.toString(), { headers });
      const vipsData = await vipsResponse.json();

      if (vipsData.data) {
        allVips = [...allVips, ...vipsData.data];
      }

      cursor = vipsData.pagination?.cursor;
    } while (cursor);

    const channel = channelData.data?.[0] || {};
    const stream = streamData.data?.[0];

    return {
      followers: followersData.total || 0,
      isAffiliate:
        broadcasterType === "affiliate" || broadcasterType === "partner",
      subscribers: subscriberCount,
      channelPoints: {
        enabled: true,
        activeRewards: pointsData.data?.length || 0,
      },
      lastGame: stream?.game_id
        ? {
            id: stream.game_id.toString(),
            name: stream.game_name || "",
            boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${stream.game_id}-{width}x{height}.jpg`,
          }
        : channel.game_id
        ? {
            id: channel.game_id.toString(),
            name: channel.game_name || "",
            boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${channel.game_id}-{width}x{height}.jpg`,
          }
        : null,
      isLive: !!stream,
      title: channel.title || stream?.title,
      tags: channel.tags || [],
      moderators: allModerators.length,
      vips: allVips.length,
    };
  } catch (error) {
    console.error("Error fetching Twitch stats:", error);
    throw error;
  }
}
