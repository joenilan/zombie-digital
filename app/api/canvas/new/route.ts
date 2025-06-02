import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's Twitch info
    const { data: twitchUser } = await supabase
      .from("twitch_users")
      .select("id, site_role")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return NextResponse.json(
        { error: "Twitch user not found" },
        { status: 404 }
      );
    }

    // Check if user has Canvas access (admin or owner only)
    if (!['admin', 'owner'].includes(twitchUser.site_role)) {
      return NextResponse.json(
        { error: "Canvas access denied. Admin or owner role required." },
        { status: 403 }
      );
    }

    // Create a new canvas
    const { data: canvas, error } = await supabase
      .from("canvas_settings")
      .insert({
        user_id: twitchUser.id,
        name: `Canvas ${new Date().toLocaleString()}`,
        resolution: "FULL_HD",
        show_name_tag: true,
        auto_fit: false,
        locked: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Add owner permissions
    const { error: permissionError } = await supabase
      .from("canvas_permissions")
      .insert({
        canvas_id: canvas.id,
        user_id: twitchUser.id,
        role: "owner",
      });

    if (permissionError) throw permissionError;

    return NextResponse.json({
      success: true,
      canvas: canvas,
      redirectUrl: `/dashboard/canvas/${canvas.id}/settings?status=created`
    });
  } catch (error) {
    console.error("Error creating canvas:", error);
    return NextResponse.json(
      { error: "Failed to create canvas" },
      { status: 500 }
    );
  }
}
