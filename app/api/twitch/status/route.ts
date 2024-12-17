import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    // Get user's Twitch token from Supabase
    const supabase = createServerComponentClient({ cookies });
    const { data: twitchUser } = await supabase
      .from("twitch_users")
      .select("provider_token")
      .eq("username", username)
      .single();

    if (!twitchUser?.provider_token) {
      throw new Error("No Twitch token available");
    }

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${username}`,
      {
        headers: {
          Authorization: `Bearer ${twitchUser.provider_token}`,
          "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json({
      isLive: data.data?.length > 0,
      stream: data.data?.[0] || null,
    });
  } catch (error) {
    console.error("Error checking Twitch status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
