import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { supabase as globalSupabase } from "@/lib/supabase";

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
  } = await globalSupabase.auth.getSession();
  if (!session) {
    throw new Error("No active session");
  }

  while (retryCount < maxRetries) {
    try {
      const response = await fetch("/api/auth/refresh-twitch-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twitch_id: userId, refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Token refresh failed (${response.status}):`, errorData);

        // For 401/403 errors, try to get a fresh session first
        if (response.status === 401 || response.status === 403) {
          const { data: { session: freshSession } } = await globalSupabase.auth.getSession();
          if (!freshSession) {
            // Only sign out if we can't get a fresh session
            await globalSupabase.auth.signOut();
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
        .eq("twitch_id", userId)
        .single();

      if (dbError) {
        console.error("Database error after token refresh:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!user?.provider_token) {
        console.error("No provider token found after successful refresh");
        throw new Error("No provider token found after refresh");
      }

      // Trigger auth store refresh by dispatching a custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('twitch-token-refreshed', {
          detail: { userId, newToken: user.provider_token }
        }));
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
  let currentAccessToken = accessToken;
  let retryCount = 0;
  const maxRetries = 1; // Only retry once after token refresh

  const makeApiCall = async (url: string, headers: any) => {
    const response = await fetch(url, { headers });
    
    // If we get a 401 and haven't retried yet, try to refresh the token
    if (response.status === 401 && retryCount === 0) {
      console.log('Token expired, attempting refresh...');
      retryCount++;
      
      try {
        // Get the user's refresh token from the database
        const supabase = createClientComponentClient();
        const { data: user, error: userError } = await supabase
          .from('twitch_users')
          .select('provider_refresh_token')
          .eq('twitch_id', userId)
          .single();

        if (userError || !user?.provider_refresh_token) {
          throw new Error('No refresh token available');
        }

        // Refresh the token
        const newToken = await refreshTwitchToken(userId, user.provider_refresh_token);
        currentAccessToken = newToken;
        
        // Update headers with new token
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        
        // Retry the request with new token
        return await fetch(url, { headers: newHeaders });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed - please sign in again');
      }
    }
    
    return response;
  };

  const headers = {
    Authorization: `Bearer ${currentAccessToken}`,
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
      const channelRes = await makeApiCall(
        `${TWITCH_API_URL}/channels?broadcaster_id=${userId}`,
        headers
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
      const followersRes = await makeApiCall(
        `${TWITCH_API_URL}/channels/followers?broadcaster_id=${userId}`,
        headers
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
        const subsRes = await makeApiCall(
          `${TWITCH_API_URL}/subscriptions?broadcaster_id=${userId}`,
          headers
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
        const pointsRes = await makeApiCall(
          `${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${userId}`,
          headers
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
      const streamRes = await makeApiCall(
        `${TWITCH_API_URL}/streams?user_id=${userId}`,
        headers
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
      // Update headers in case token was refreshed
      const currentHeaders = {
        Authorization: `Bearer ${currentAccessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      };

      const [modsRes, vipsRes] = await Promise.all([
        makeApiCall(
          `${TWITCH_API_URL}/moderation/moderators?broadcaster_id=${userId}`,
          currentHeaders
        ),
        makeApiCall(`${TWITCH_API_URL}/channels/vips?broadcaster_id=${userId}`, {
          headers: currentHeaders,
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
