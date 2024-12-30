import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, refreshToken } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Verify the user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Refresh the Twitch token
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Twitch token");
    }

    const data = await response.json();

    // Update the user's tokens in the database
    const { error: updateError } = await supabase
      .from("twitch_users")
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: new Date(
          Date.now() + data.expires_in * 1000
        ).toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error refreshing Twitch token:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
