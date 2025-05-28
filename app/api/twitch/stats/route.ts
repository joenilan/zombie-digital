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
  console.log('Attempting to refresh token for user:', userId);
  
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
    const errorText = await response.text();
    console.error('Token refresh failed:', response.status, errorText);
    throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Token refreshed successfully');
  
  // Update the database with new tokens
  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase
    .from("twitch_users")
    .update({
      provider_token: data.access_token,
      provider_refresh_token: data.refresh_token,
      token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    .eq("twitch_id", userId);

  if (error) {
    console.error('Failed to update tokens in database:', error);
    throw new Error('Failed to update tokens in database');
  }

  return data.access_token;
}

async function makeApiCall(url: string, headers: any, retryCount = 0): Promise<Response> {
  console.log(`Making API call to: ${url} (attempt ${retryCount + 1})`);
  
  const response = await fetch(url, { headers });
  
  console.log(`API response status: ${response.status}`);
  
  if (response.status === 401 && retryCount === 0) {
    throw new Error("UNAUTHORIZED");
  }
  
  return response;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    console.log('=== TWITCH STATS API START ===');
    console.log('Fetching stats for user:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    if (!userId) {
      console.error('Missing userId parameter');
      return new NextResponse("Missing userId parameter", { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Verify the user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Authentication failed:', sessionError);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user data including tokens
    const { data: user, error: userError } = await supabase
      .from("twitch_users")
      .select("provider_token, provider_refresh_token, broadcaster_type, token_expires_at")
      .eq("twitch_id", userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return new NextResponse("User not found", { status: 404 });
    }

    console.log('User found:');
    console.log('- Broadcaster type:', user.broadcaster_type);
    console.log('- Token expires at:', user.token_expires_at);
    console.log('- Has refresh token:', !!user.provider_refresh_token);

    // Check if token is expired
    const tokenExpiry = new Date(user.token_expires_at);
    const now = new Date();
    const isTokenExpired = tokenExpiry <= now;
    
    console.log('Token status:');
    console.log('- Current time:', now.toISOString());
    console.log('- Token expires:', tokenExpiry.toISOString());
    console.log('- Is expired:', isTokenExpired);

    let accessToken = user.provider_token;
    let retryCount = 0;

    const makeAuthenticatedCall = async (url: string) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      };

      try {
        const response = await makeApiCall(url, headers, retryCount);
        
        if (response.status === 401 && retryCount === 0) {
          console.log('Received 401, attempting token refresh...');
          retryCount++;
          
          if (user.provider_refresh_token) {
            accessToken = await refreshTwitchToken(userId, user.provider_refresh_token);
            console.log('Token refreshed, retrying API call...');
            
            // Retry with new token
            const newHeaders = {
              Authorization: `Bearer ${accessToken}`,
              "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
            };
            return await makeApiCall(url, newHeaders, retryCount);
          } else {
            console.error('No refresh token available');
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
      // Get user information first (includes view count, created date, broadcaster type)
      console.log('=== FETCHING USER INFO ===');
      const userResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/users?id=${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data response:', userData);
        if (userData.data && userData.data.length > 0) {
          const userInfo = userData.data[0];
          stats.totalViewCount = userInfo.view_count || 0;
          stats.createdAt = userInfo.created_at;
          stats.broadcasterType = userInfo.broadcaster_type || "none";
          stats.isAffiliate = userInfo.broadcaster_type === "affiliate" || userInfo.broadcaster_type === "partner";
          
          console.log('Updated stats with user info:');
          console.log('- Total view count:', stats.totalViewCount);
          console.log('- Broadcaster type:', stats.broadcasterType);
          console.log('- Is affiliate:', stats.isAffiliate);
        }
      } else {
        console.error('Failed to fetch user info:', userResponse.status, await userResponse.text());
      }

      // Get channel information (includes current game, title, etc.)
      console.log('=== FETCHING CHANNEL INFO ===');
      const channelResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels?broadcaster_id=${userId}`);
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        console.log('Channel data response:', channelData);
        if (channelData.data && channelData.data.length > 0) {
          const channel = channelData.data[0];
          stats.title = channel.title;
          stats.description = channel.description || "";
          if (channel.game_id && channel.game_name) {
            stats.lastGame = {
              id: channel.game_id,
              name: channel.game_name,
              boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${channel.game_id}-{width}x{height}.jpg`,
            };
          }
          console.log('Updated stats with channel info:');
          console.log('- Title:', stats.title);
          console.log('- Last game:', stats.lastGame?.name);
        }
      } else {
        console.error('Failed to fetch channel info:', channelResponse.status, await channelResponse.text());
      }

      // Get followers count
      console.log('=== FETCHING FOLLOWERS ===');
      try {
        const followersResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels/followers?broadcaster_id=${userId}&first=1`);
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          console.log('Followers data:', followersData);
          stats.followers = followersData.total || 0;
          console.log('- Followers count:', stats.followers);
        } else {
          console.error('Failed to fetch followers:', followersResponse.status, await followersResponse.text());
        }
      } catch (error) {
        console.log('Could not fetch followers (may not have required scope):', error);
      }

      // Get subscribers count (requires channel:read:subscriptions scope and affiliate status)
      if (stats.isAffiliate) {
        console.log('=== FETCHING SUBSCRIBERS ===');
        try {
          const subsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/subscriptions?broadcaster_id=${userId}&first=1`);
          if (subsResponse.ok) {
            const subsData = await subsResponse.json();
            console.log('Subscribers data:', subsData);
            stats.subscribers = subsData.total || 0;
            console.log('- Subscribers count:', stats.subscribers);
          } else {
            console.error('Failed to fetch subscribers:', subsResponse.status, await subsResponse.text());
          }
        } catch (error) {
          console.log('Could not fetch subscribers (may not have required scope):', error);
        }
      } else {
        console.log('Skipping subscribers fetch - user is not affiliate/partner');
      }

      // Get moderators count
      console.log('=== FETCHING MODERATORS ===');
      try {
        const modsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/moderation/moderators?broadcaster_id=${userId}&first=100`);
        if (modsResponse.ok) {
          const modsData = await modsResponse.json();
          console.log('Moderators data:', modsData);
          stats.moderators = modsData.data ? modsData.data.length : 0;
          console.log('- Moderators count:', stats.moderators);
        } else {
          console.error('Failed to fetch moderators:', modsResponse.status, await modsResponse.text());
        }
      } catch (error) {
        console.log('Could not fetch moderators:', error);
      }

      // Get VIPs count
      console.log('=== FETCHING VIPS ===');
      try {
        const vipsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels/vips?broadcaster_id=${userId}&first=100`);
        if (vipsResponse.ok) {
          const vipsData = await vipsResponse.json();
          console.log('VIPs data:', vipsData);
          stats.vips = vipsData.data ? vipsData.data.length : 0;
          console.log('- VIPs count:', stats.vips);
        } else {
          console.error('Failed to fetch VIPs:', vipsResponse.status, await vipsResponse.text());
        }
      } catch (error) {
        console.log('Could not fetch VIPs:', error);
      }

      // Get stream status
      console.log('=== FETCHING STREAM STATUS ===');
      try {
        const streamResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/streams?user_id=${userId}`);
        if (streamResponse.ok) {
          const streamData = await streamResponse.json();
          console.log('Stream data:', streamData);
          stats.isLive = streamData.data && streamData.data.length > 0;
          console.log('- Is live:', stats.isLive);
          if (stats.isLive && streamData.data[0]) {
            const stream = streamData.data[0];
            stats.title = stream.title;
            if (stream.game_id && stream.game_name) {
              stats.lastGame = {
                id: stream.game_id,
                name: stream.game_name,
                boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${stream.game_id}-{width}x{height}.jpg`,
              };
            }
            stats.tags = stream.tags || [];
            console.log('- Updated with live stream info');
          }
        } else {
          console.error('Failed to fetch stream status:', streamResponse.status, await streamResponse.text());
        }
      } catch (error) {
        console.log('Could not fetch stream status:', error);
      }

      // Get channel points rewards (only for affiliates/partners)
      if (stats.isAffiliate) {
        console.log('=== FETCHING CHANNEL POINTS ===');
        try {
          const rewardsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${userId}&only_manageable_rewards=true`);
          if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            console.log('Channel points data:', rewardsData);
            stats.channelPoints = {
              enabled: true,
              activeRewards: rewardsData.data ? rewardsData.data.filter((r: any) => r.is_enabled).length : 0,
            };
            console.log('- Channel points enabled:', stats.channelPoints.enabled);
            console.log('- Active rewards:', stats.channelPoints.activeRewards);
          } else {
            console.error('Failed to fetch channel points:', rewardsResponse.status, await rewardsResponse.text());
          }
        } catch (error) {
          console.log('Could not fetch channel points:', error);
        }
      } else {
        console.log('Skipping channel points fetch - user is not affiliate/partner');
      }

    } catch (error) {
      console.error("Error fetching Twitch stats:", error);
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        console.error('Authentication failed after token refresh attempt');
        return new NextResponse("Token refresh failed - please re-authenticate", { status: 401 });
      }
    }

    console.log('=== FINAL STATS ===');
    console.log('Final stats:', JSON.stringify(stats, null, 2));
    console.log('=== TWITCH STATS API END ===');
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in Twitch stats API:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
} 