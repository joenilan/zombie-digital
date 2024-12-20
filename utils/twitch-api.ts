import { refreshSession } from "./auth";

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
  lastGame?: {
    id: string;
    name: string;
    boxArtUrl: string;
    title?: string;
    tags?: string[];
  };
  isLive: boolean;
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
      // Token is invalid, try to refresh
      const session = await refreshSession();
      if (!session?.provider_token) {
        throw new Error("Failed to refresh token");
      }

      // Retry with new token
      return fetchTwitchStats(
        broadcasterId,
        session.provider_token,
        broadcasterType
      );
    }

    // Initialize stats with default values
    const stats: TwitchStats = {
      followers: 0,
      isAffiliate:
        broadcasterType === "affiliate" || broadcasterType === "partner",
      isLive: false,
    };

    // Check if user is live
    const streamResponse = await fetch(
      `${TWITCH_API_URL}/streams?user_id=${broadcasterId}`,
      { headers }
    );

    if (streamResponse.ok) {
      const streamData = await streamResponse.json();
      stats.isLive = streamData.data?.length > 0;
    }

    // Fetch followers (available for all users)
    const followersResponse = await fetch(
      `${TWITCH_API_URL}/channels/followers?broadcaster_id=${broadcasterId}`,
      { headers }
    );

    if (followersResponse.ok) {
      const followersData = await followersResponse.json();
      stats.followers = followersData.total || 0;
    }

    // Only fetch affiliate/partner specific stats if the user is one
    if (stats.isAffiliate) {
      // Fetch channel info (includes total views)
      const channelResponse = await fetch(
        `${TWITCH_API_URL}/channels?broadcaster_id=${broadcasterId}`,
        { headers }
      );

      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        stats.totalViews = channelData.data?.[0]?.view_count;

        // If there's a game, fetch its details
        if (channelData.data?.[0]?.game_id) {
          const gameResponse = await fetch(
            `${TWITCH_API_URL}/games?id=${channelData.data[0].game_id}`,
            { headers }
          );

          if (gameResponse.ok) {
            const gameInfo = await gameResponse.json();
            if (gameInfo.data?.[0]) {
              stats.lastGame = {
                id: gameInfo.data[0].id,
                name: gameInfo.data[0].name,
                boxArtUrl: gameInfo.data[0].box_art_url
                  .replace("{width}", "300")
                  .replace("{height}", "400"),
                title: channelData.data[0].title,
                tags: channelData.data[0].tags,
              };
            }
          }
        }
      }

      // Fetch subscriptions
      const subsResponse = await fetch(
        `${TWITCH_API_URL}/subscriptions?broadcaster_id=${broadcasterId}`,
        { headers }
      );

      if (subsResponse.ok) {
        const subsData = await subsResponse.json();
        stats.subscribers = subsData.total || 0;
      }

      // Fetch channel points rewards
      const pointsResponse = await fetch(
        `${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
        { headers }
      );

      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        stats.channelPoints = {
          enabled: true,
          activeRewards: pointsData.data?.length || 0,
        };
      }
    }

    return stats;
  } catch (error) {
    console.error("Error fetching Twitch stats:", error);
    throw error;
  }
}
