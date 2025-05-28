import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TWITCH_API_URL = "https://api.twitch.tv/helix";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
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
      .select("provider_token, provider_refresh_token")
      .eq("twitch_id", userId)
      .single();

    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Fetch user info from Twitch API to get broadcaster type
    const headers = {
      Authorization: `Bearer ${user.provider_token}`,
      "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
    };

    const response = await fetch(`${TWITCH_API_URL}/users?id=${userId}`, { headers });
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch user info: ${response.status}`, { status: 500 });
    }

    const userData = await response.json();
    const twitchUser = userData.data?.[0];
    
    if (!twitchUser) {
      return new NextResponse("User not found in Twitch API", { status: 404 });
    }

    const broadcasterType = twitchUser.broadcaster_type || 'none';

    // Update the broadcaster type in the database
    const { error: updateError } = await supabase
      .from("twitch_users")
      .update({ broadcaster_type: broadcasterType })
      .eq("twitch_id", userId);

    if (updateError) {
      return new NextResponse(`Failed to update broadcaster type: ${updateError.message}`, { status: 500 });
    }

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