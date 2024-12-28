import { NextResponse } from "next/server";

async function getAppAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get Twitch app access token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Twitch client ID not configured" },
      { status: 500 }
    );
  }

  try {
    // Get a fresh app access token for each request
    const accessToken = await getAppAccessToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${username}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": clientId,
        },
      }
    );

    if (!response.ok) {
      console.error("Twitch API error:", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(
        `Twitch API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json({
      isLive: data.data?.length > 0,
      stream: data.data?.[0] || null,
    });
  } catch (error) {
    console.error("Error checking Twitch status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check status",
      },
      { status: 500 }
    );
  }
}
