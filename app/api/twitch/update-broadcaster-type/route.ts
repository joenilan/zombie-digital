import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TWITCH_API_URL = "https://api.twitch.tv/helix";

async function refreshTwitchToken(userId: string, refreshToken: string) {
  console.log('Attempting to refresh token for broadcaster type update:', userId);
  
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
  console.log('Token refreshed successfully for broadcaster type update');
  
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

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    console.log('Updating broadcaster type for user:', userId);
    
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
      .select("provider_token, provider_refresh_token, token_expires_at")
      .eq("twitch_id", userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return new NextResponse("User not found", { status: 404 });
    }

    console.log('Token expires at:', user.token_expires_at);

    let accessToken = user.provider_token;

    // Fetch user info from Twitch API to get broadcaster type
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
    };

    let response = await fetch(`${TWITCH_API_URL}/users?id=${userId}`, { headers });
    
    // If token is expired, try to refresh it
    if (response.status === 401 && user.provider_refresh_token) {
      console.log('Token expired, refreshing...');
      try {
        accessToken = await refreshTwitchToken(userId, user.provider_refresh_token);
        headers = {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        };
        response = await fetch(`${TWITCH_API_URL}/users?id=${userId}`, { headers });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return new NextResponse("Token refresh failed - please re-authenticate", { status: 401 });
      }
    }
    
    if (!response.ok) {
      console.error('Failed to fetch user info:', response.status);
      return new NextResponse(`Failed to fetch user info: ${response.status}`, { status: 500 });
    }

    const userData = await response.json();
    const twitchUser = userData.data?.[0];
    
    if (!twitchUser) {
      return new NextResponse("User not found in Twitch API", { status: 404 });
    }

    const broadcasterType = twitchUser.broadcaster_type || 'none';
    console.log('Fetched broadcaster type:', broadcasterType);

    // Update the broadcaster type in the database
    const { error: updateError } = await supabase
      .from("twitch_users")
      .update({ broadcaster_type: broadcasterType })
      .eq("twitch_id", userId);

    if (updateError) {
      console.error('Failed to update broadcaster type:', updateError);
      return new NextResponse(`Failed to update broadcaster type: ${updateError.message}`, { status: 500 });
    }

    console.log('Broadcaster type updated successfully:', broadcasterType);

    return NextResponse.json({ 
      success: true, 
      broadcasterType,
      message: `Broadcaster type updated to: ${broadcasterType}`
    });
  } catch (error) {
    console.error("Error updating broadcaster type:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
} 