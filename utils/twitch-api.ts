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
  userId: string,
  accessToken: string,
  broadcasterType: string
) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
  };

  try {
    // Base stats object
    const stats: any = {
      followers: 0,
      isAffiliate:
        broadcasterType === "affiliate" || broadcasterType === "partner",
      channelPoints: {
        enabled: false,
        activeRewards: 0,
      },
      lastGame: null,
      isLive: false,
      moderators: 0,
      vips: 0,
    };

    // Get channel info (available for all)
    try {
      const channelRes = await fetch(
        `${TWITCH_API_URL}/channels?broadcaster_id=${userId}`,
        { headers }
      );
      if (channelRes.ok) {
        const channelData = await channelRes.json();
        const channel = channelData.data?.[0];
        if (channel) {
          stats.title = channel.title;
          stats.tags = channel.tags || [];
          if (channel.game_name) {
            stats.lastGame = {
              id: channel.game_id,
              name: channel.game_name,
              boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${channel.game_id}-{width}x{height}.jpg`,
            };
          }
        }
      }
    } catch (err) {
      console.error("Error fetching channel info:", err);
    }

    // Get followers count (new endpoint)
    try {
      const followersRes = await fetch(
        `${TWITCH_API_URL}/channels/followers?broadcaster_id=${userId}`,
        { headers }
      );
      if (followersRes.ok) {
        const followersData = await followersRes.json();
        stats.followers = followersData.total || 0;
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    }

    // Only fetch these stats for affiliates/partners
    if (stats.isAffiliate) {
      // Subscribers count
      try {
        const subsRes = await fetch(
          `${TWITCH_API_URL}/subscriptions?broadcaster_id=${userId}`,
          { headers }
        );
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          stats.subscribers = subsData.total || 0;
        }
      } catch (err) {
        console.error("Error fetching subscribers:", err);
      }

      // Channel Points
      try {
        const pointsRes = await fetch(
          `${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${userId}`,
          { headers }
        );
        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          stats.channelPoints = {
            enabled: true,
            activeRewards: pointsData.data?.length || 0,
          };
        }
      } catch (err) {
        console.error("Error fetching channel points:", err);
      }
    }

    // Stream info (available for all) - this will override channel info if live
    try {
      const streamRes = await fetch(
        `${TWITCH_API_URL}/streams?user_id=${userId}`,
        { headers }
      );
      if (streamRes.ok) {
        const streamData = await streamRes.json();
        const stream = streamData.data?.[0];
        if (stream) {
          stats.isLive = true;
          stats.title = stream.title;
          stats.lastGame = stream.game_name
            ? {
                id: stream.game_id,
                name: stream.game_name,
                boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${stream.game_id}-{width}x{height}.jpg`,
              }
            : null;
          stats.tags = stream.tags || [];
        }
      }
    } catch (err) {
      console.error("Error fetching stream info:", err);
    }

    // Moderators and VIPs (available for all)
    try {
      const [modsRes, vipsRes] = await Promise.all([
        fetch(
          `${TWITCH_API_URL}/moderation/moderators?broadcaster_id=${userId}`,
          { headers }
        ),
        fetch(`${TWITCH_API_URL}/channels/vips?broadcaster_id=${userId}`, {
          headers,
        }),
      ]);

      if (modsRes.ok) {
        const modsData = await modsRes.json();
        stats.moderators = modsData.total || 0;
      }

      if (vipsRes.ok) {
        const vipsData = await vipsRes.json();
        stats.vips = vipsData.total || 0;
      }
    } catch (err) {
      console.error("Error fetching mods/vips:", err);
    }

    return stats;
  } catch (err) {
    console.error("Error fetching Twitch stats:", err);
    throw err;
  }
}
