import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's Twitch info
    const { data: twitchUser } = await supabase
      .from("twitch_users")
      .select("id")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return new NextResponse("Twitch user not found", { status: 404 });
    }

    // Get user's canvas settings
    const { data: settings } = await supabase
      .from("canvas_settings")
      .select("*")
      .eq("user_id", twitchUser.id)
      .single();

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("Error fetching canvas settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's Twitch info
    const { data: twitchUser } = await supabase
      .from("twitch_users")
      .select("id")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return new NextResponse("Twitch user not found", { status: 404 });
    }

    const body = await request.json();
    const { resolution, background_color, show_name_tag, auto_fit, locked } =
      body;

    // Upsert canvas settings
    const { data: settings, error } = await supabase
      .from("canvas_settings")
      .upsert({
        user_id: twitchUser.id,
        resolution: resolution || "FULL_HD",
        background_color,
        show_name_tag: show_name_tag ?? true,
        auto_fit: auto_fit ?? false,
        locked: locked ?? true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating canvas settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's Twitch info
    const { data: twitchUser } = await supabase
      .from("twitch_users")
      .select("id")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return new NextResponse("Twitch user not found", { status: 404 });
    }

    const body = await request.json();

    // Update only provided fields
    const { data: settings, error } = await supabase
      .from("canvas_settings")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", twitchUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating canvas settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
