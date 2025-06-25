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
  console.log('Refresh token length:', refreshToken?.length || 0);
  
  if (!refreshToken) {
    throw new Error('No refresh token provided');
  }

  if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    throw new Error('Missing Twitch client credentials');
  }
  
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
    
    // Parse the error response for more specific error handling
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error === 'invalid_grant') {
        throw new Error('Refresh token is invalid or expired - user needs to re-authenticate');
      }
    } catch (parseError) {
      // If we can't parse the error, use the raw text
    }
    
    throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Token refreshed successfully');
  console.log('New token expires in:', data.expires_in, 'seconds');
  
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

async function makeApiCall(url: string, headers: any): Promise<Response> {
  console.log(`Making API call to: ${url}`);
  
  const response = await fetch(url, { headers });
  
  console.log(`API response status: ${response.status}`);
  
  return response;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    

    
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

    

    // Check if token is expired or about to expire (within 5 minutes)
    const tokenExpiry = new Date(user.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const isTokenExpired = tokenExpiry <= now;
    const isTokenExpiringSoon = tokenExpiry <= fiveMinutesFromNow;
    
    

    let accessToken = user.provider_token;
    let hasTriedRefresh = false;

    // Proactively refresh token if it's expired or expiring soon
    if ((isTokenExpired || isTokenExpiringSoon) && user.provider_refresh_token) {
      console.log('Token is expired or expiring soon, proactively refreshing...');
      try {
        accessToken = await refreshTwitchToken(userId, user.provider_refresh_token);
        hasTriedRefresh = true;
        console.log('Proactive token refresh successful');
      } catch (refreshError) {
        console.error('Proactive token refresh failed:', refreshError);
        if (refreshError instanceof Error && refreshError.message.includes('Refresh token is invalid or expired')) {
          return new NextResponse("Your Twitch authentication has expired. Please sign out and sign back in to continue.", { status: 401 });
        }
        // Continue with the old token and let the 401 handling catch it
      }
    }

    const makeAuthenticatedCall = async (url: string) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      };

      const response = await makeApiCall(url, headers);
      
      // If we get a 401 and haven't tried refreshing yet, attempt token refresh
      if (response.status === 401 && !hasTriedRefresh && user.provider_refresh_token) {
        console.log('Received 401, attempting token refresh...');
        hasTriedRefresh = true;
        
        try {
          accessToken = await refreshTwitchToken(userId, user.provider_refresh_token);
          console.log('Token refreshed successfully, retrying API call...');
          
          // Retry with new token
          const newHeaders = {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          };
          return await makeApiCall(url, newHeaders);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error("UNAUTHORIZED");
        }
      } else if (response.status === 401) {
        // If we still get 401 after refresh attempt, or no refresh token available
        console.error('Authentication failed - token refresh not available or already attempted');
        throw new Error("UNAUTHORIZED");
      }
      
      return response;
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
      } else {
        console.error('Failed to fetch user info:', userResponse.status, await userResponse.text());
      }

      // Get channel information (includes current game, title, etc.)
      const channelResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels?broadcaster_id=${userId}`);
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
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
        }
      } else {
        console.error('Failed to fetch channel info:', channelResponse.status, await channelResponse.text());
      }

      // Get followers count
      try {
        const followersResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels/followers?broadcaster_id=${userId}&first=1`);
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          stats.followers = followersData.total || 0;
        } else {
          console.error('Failed to fetch followers:', followersResponse.status, await followersResponse.text());
        }
      } catch (error) {
        // Could not fetch followers (may not have required scope)
      }

      // Get subscribers count (requires channel:read:subscriptions scope and affiliate status)
      if (stats.isAffiliate) {
        try {
          const subsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/subscriptions?broadcaster_id=${userId}&first=1`);
          if (subsResponse.ok) {
            const subsData = await subsResponse.json();
            stats.subscribers = subsData.total || 0;
          } else {
            console.error('Failed to fetch subscribers:', subsResponse.status, await subsResponse.text());
          }
        } catch (error) {
          // Could not fetch subscribers (may not have required scope)
        }
      }

      // Get moderators count
      try {
        const modsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/moderation/moderators?broadcaster_id=${userId}&first=100`);
        if (modsResponse.ok) {
          const modsData = await modsResponse.json();
          stats.moderators = modsData.data ? modsData.data.length : 0;
        } else {
          console.error('Failed to fetch moderators:', modsResponse.status, await modsResponse.text());
        }
      } catch (error) {
        // Could not fetch moderators
      }

      // Get VIPs count
      try {
        const vipsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channels/vips?broadcaster_id=${userId}&first=100`);
        if (vipsResponse.ok) {
          const vipsData = await vipsResponse.json();
          stats.vips = vipsData.data ? vipsData.data.length : 0;
        } else {
          console.error('Failed to fetch VIPs:', vipsResponse.status, await vipsResponse.text());
        }
      } catch (error) {
        // Could not fetch VIPs
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
            if (stream.game_id && stream.game_name) {
              stats.lastGame = {
                id: stream.game_id,
                name: stream.game_name,
                boxArtUrl: `https://static-cdn.jtvnw.net/ttv-boxart/${stream.game_id}-{width}x{height}.jpg`,
              };
            }
            stats.tags = stream.tags || [];
          }
        } else {
          console.error('Failed to fetch stream status:', streamResponse.status, await streamResponse.text());
        }
      } catch (error) {
        // Could not fetch stream status
      }

      // Get channel points rewards (only for affiliates/partners)
      if (stats.isAffiliate) {
        try {
          const rewardsResponse = await makeAuthenticatedCall(`${TWITCH_API_URL}/channel_points/custom_rewards?broadcaster_id=${userId}&only_manageable_rewards=true`);
          if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            stats.channelPoints = {
              enabled: true,
              activeRewards: rewardsData.data ? rewardsData.data.filter((r: any) => r.is_enabled).length : 0,
            };
          } else {
            console.error('Failed to fetch channel points:', rewardsResponse.status, await rewardsResponse.text());
          }
        } catch (error) {
          // Could not fetch channel points
        }
      }

    } catch (error) {
      console.error("Error fetching Twitch stats:", error);
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          console.error('Authentication failed after token refresh attempt');
          return new NextResponse("Your Twitch authentication has expired. Please sign out and sign back in to continue.", { status: 401 });
        } else if (error.message.includes('Refresh token is invalid or expired')) {
          console.error('Refresh token is invalid - user needs to re-authenticate');
          return new NextResponse("Your Twitch authentication has expired. Please sign out and sign back in to continue.", { status: 401 });
        } else if (error.message.includes('No refresh token')) {
          console.error('No refresh token available');
          return new NextResponse("Authentication error - please sign out and sign back in.", { status: 401 });
        }
      }
      // For other errors, return a generic error message
      return new NextResponse("Unable to fetch Twitch data. Please try again later.", { status: 500 });
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