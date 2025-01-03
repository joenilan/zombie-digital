import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { twitch_id, refreshToken } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Verify the user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Session error:", sessionError);
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
      const errorText = await response.text();
      console.error("Twitch token refresh failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      // If the refresh token is invalid, we should sign the user out
      if (response.status === 400 || response.status === 401) {
        await supabase.auth.signOut();
        return new NextResponse("Invalid refresh token", { status: 401 });
      }

      return new NextResponse(
        `Failed to refresh Twitch token: ${response.status} ${response.statusText}`,
        { status: response.status }
      );
    }

    const data = await response.json();

    // Update the user's tokens in the database
    const { error: updateError } = await supabase
      .from("twitch_users")
      .update({
        provider_token: data.access_token,
        provider_refresh_token: data.refresh_token,
        token_expires_at: new Date(
          Date.now() + data.expires_in * 1000
        ).toISOString(),
      })
      .eq("twitch_id", twitch_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new NextResponse(
        `Failed to update tokens in database: ${updateError.message}`,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Error refreshing Twitch token:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
