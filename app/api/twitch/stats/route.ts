import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
  totalViewCount?: number;
  createdAt?: string;
  broadcasterType?: string;
}

async function refreshTwitchToken(userId: string, refreshToken: string) {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  const data = await response.json();
  
  // Update the database with new tokens
  const supabase = createRouteHandlerClient({ cookies });
  await supabase
    .from("twitch_users")
    .update({
      provider_token: data.access_token,
      provider_refresh_token: data.refresh_token,
      token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    .eq("twitch_id", userId);

  return data.access_token;
}

async function makeApiCall(url: string, headers: any, retryCount = 0): Promise<Response> {
  const response = await fetch(url, { headers });
  
  if (response.status === 401 && retryCount === 0) {
    throw new Error("UNAUTHORIZED");
  }
  
  return response;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return new NextResponse("Missing userId parameter", { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Verify the user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user data including tokens
    const { data: user, error: userError } = await supabase
      .from("twitch_users")
      .select("provider_token, provider_refresh_token, broadcaster_type")
      .eq("twitch_id", userId)
      .single();

    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let accessToken = user.provider_token;
    let retryCount = 0;
    const maxRetries = 1;

    const makeAuthenticatedCall = async (url: string) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      };

      try {
        const response = await makeApiCall(url, headers, retryCount);
        
        if (response.status === 401 && retryCount === 0) {
          console.log('Token expired, attempting refresh...');
          retryCount++;
          
          if (user.provider_refresh_token) {
            accessToken = await refreshTwitchToken(userId, user.provider_refresh_token);
            
            // Retry with new token
            const newHeaders = {
              Authorization: `Bearer ${accessToken}`,
              "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
            };
            return await makeApiCall(url, newHeaders, retryCount);
          } else {
            throw new Error("No refresh token available");
          }
        }
        
        return response;
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          throw error;
        }
        throw error;
      }
    };

    const stats: TwitchStats = {
      followers: 0,
      isAffiliate: false,
      subscribers: 0,
      totalViews: 0,
      channelPoints: {
        enabled: false,
        activeRewards: 0,
      },
      lastGame: null,
      isLive: false,
      title: "",
      description: "",
      tags: [],
      moderators: 0,
      vips: 0,
      totalViewCount: 0,
      createdAt: "",
      broadcasterType: user.broadcaster_type || "none",
    };

    try {
      // Get channel information (includes view count, broadcaster type, etc.)
      const channelResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels?broadcaster_id=${userId}`);
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.data && channelData.data.length > 0) {
          const channel = channelData.data[0];
          stats.title = channel.title;
          stats.description = channel.description || "";
          stats.lastGame = channel.game_id ? {
            id: channel.game_id,
            name: channel.game_name,
            boxArtUrl: channel.game_box_art_url || "",
          } : null;
        }
      }

      // Get user information (includes view count, created date, broadcaster type)
      const userResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/users?id=${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.data && userData.data.length > 0) {
          const userInfo = userData.data[0];
          stats.totalViewCount = userInfo.view_count || 0;
          stats.createdAt = userInfo.created_at;
          stats.broadcasterType = userInfo.broadcaster_type || "none";
          stats.isAffiliate = userInfo.broadcaster_type === "affiliate" || userInfo.broadcaster_type === "partner";
        }
      }

      // Get followers count
      try {
        const followersResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels/followers?broadcaster_id=${userId}&first=1`);
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          stats.followers = followersData.total || 0;
        }
      } catch (error) {
        console.log('Could not fetch followers:', error);
        // Continue without followers count
      }

      // Get subscribers count (requires channel:read:subscriptions scope)
      try {
        const subsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/subscriptions?broadcaster_id=${userId}&first=1`);
        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          stats.subscribers = subsData.total || 0;
        }
      } catch (error) {
        console.log('Could not fetch subscribers:', error);
        // Continue without subscriber count
      }

      // Get moderators count
      try {
        const modsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/moderation/moderators?broadcaster_id=${userId}&first=100`);
        if (modsResponse.ok) {
          const modsData = await modsResponse.json();
          stats.moderators = modsData.data ? modsData.data.length : 0;
        }
      } catch (error) {
        console.log('Could not fetch moderators:', error);
        // Continue without moderator count
      }

      // Get VIPs count
      try {
        const vipsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels/vips?broadcaster_id=${userId}&first=100`);
        if (vipsResponse.ok) {
          const vipsData = await vipsResponse.json();
          stats.vips = vipsData.data ? vipsData.data.length : 0;
        }
      } catch (error) {
        console.log('Could not fetch VIPs:', error);
        // Continue without VIP count
      }

      // Get stream status
      try {
        const streamResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/streams?user_id=${userId}`);
        if (streamResponse.ok) {
          const streamData = await streamResponse.json();
          stats.isLive = streamData.data && streamData.data.length > 0;
          if (stats.isLive && streamData.data[0]) {
            const stream = streamData.data[0];
            stats.title = stream.title;
            stats.lastGame = {
              id: stream.game_id,
              name: stream.game_name,
              boxArtUrl: stream.thumbnail_url?.replace('{width}', '285').replace('{height}', '380') || "",
            };
            stats.tags = stream.tags || [];
          }
        }
      } catch (error) {
        console.log('Could not fetch stream status:', error);
        // Continue without stream status
      }

      // Get channel points rewards
      try {
        const rewardsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${userId}&only_manageable_rewards=true`);
        if (rewardsResponse.ok) {
          const rewardsData = await rewardsResponse.json();
          stats.channelPoints = {
            enabled: true,
            activeRewards: rewardsData.data ? rewardsData.data.filter((r: any) => r.is_enabled).length : 0,
          };
        }
      } catch (error) {
        console.log('Could not fetch channel points:', error);
        // Continue without channel points info
      }

    } catch (error) {
      console.error("Error fetching Twitch stats:", error);
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return new NextResponse("Token refresh failed - please re-authenticate", { status: 401 });
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in Twitch stats API:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
} 