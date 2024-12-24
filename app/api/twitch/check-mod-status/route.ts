import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { broadcasterId, moderatorId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Get broadcaster's Twitch ID
    const { data: broadcaster } = await supabase
      .from("twitch_users")
      .select("twitch_id, access_token")
      .eq("id", broadcasterId)
      .single();

    if (!broadcaster) {
      return NextResponse.json(
        { error: "Broadcaster not found" },
        { status: 404 }
      );
    }

    // Get moderator's Twitch ID
    const { data: moderator } = await supabase
      .from("twitch_users")
      .select("twitch_id")
      .eq("id", moderatorId)
      .single();

    if (!moderator) {
      return NextResponse.json(
        { error: "Moderator not found" },
        { status: 404 }
      );
    }

    // Check mod status with Twitch API
    const response = await fetch(
      `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcaster.twitch_id}&user_id=${moderator.twitch_id}`,
      {
        headers: {
          Authorization: `Bearer ${broadcaster.access_token}`,
          "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        },
      }
    );

    const data = await response.json();
    const isMod = data.data && data.data.length > 0;

    // Update mod cache
    if (isMod) {
      await supabase.from("mod_cache").upsert({
        broadcaster_id: broadcasterId,
        moderator_id: moderatorId,
        last_checked: new Date().toISOString(),
      });
    } else {
      await supabase
        .from("mod_cache")
        .delete()
        .eq("broadcaster_id", broadcasterId)
        .eq("moderator_id", moderatorId);
    }

    return NextResponse.json({ isMod });
  } catch (error) {
    console.error("Error checking mod status:", error);
    return NextResponse.json(
      { error: "Failed to check mod status" },
      { status: 500 }
    );
  }
}
