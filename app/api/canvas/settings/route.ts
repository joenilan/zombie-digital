import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logError } from '@/lib/debug'

// Helper function to check feature access
async function checkFeatureAccess(featureId: string, userId: string) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user's role
  const { data: user } = await supabase
    .from('twitch_users')
    .select('site_role')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // Get feature state
  const { data: feature } = await supabase
    .from('feature_states')
    .select('enabled, required_role')
    .eq('feature_id', featureId)
    .single();

  if (!feature || !feature.enabled) return false;

  // Check role hierarchy
  const roleHierarchy = ['user', 'moderator', 'admin', 'owner'];
  const userRoleIndex = roleHierarchy.indexOf(user.site_role);
  const requiredRoleIndex = roleHierarchy.indexOf(feature.required_role);

  return userRoleIndex >= requiredRoleIndex;
}

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
      .select("id, site_role")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return new NextResponse("Twitch user not found", { status: 404 });
    }

    // Check if user has Canvas access
    const hasAccess = await checkFeatureAccess('CANVAS', twitchUser.id);
    if (!hasAccess) {
      return new NextResponse("Canvas feature is not available for your account", { status: 403 });
    }

    // Get user's canvas settings
    const { data: settings } = await supabase
      .from("canvas_settings")
      .select("*")
      .eq("user_id", twitchUser.id)
      .single();

    return NextResponse.json(settings || {});
  } catch (error) {
    logError("Error fetching canvas settings:", error);
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
      .select("id, site_role")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return new NextResponse("Twitch user not found", { status: 404 });
    }

    // Check if user has Canvas access
    const hasAccess = await checkFeatureAccess('CANVAS', twitchUser.id);
    if (!hasAccess) {
      return new NextResponse("Canvas feature is not available for your account", { status: 403 });
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
    logError("Error updating canvas settings:", error);
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
      .select("id, site_role")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      return new NextResponse("Twitch user not found", { status: 404 });
    }

    // Check if user has Canvas access
    const hasAccess = await checkFeatureAccess('CANVAS', twitchUser.id);
    if (!hasAccess) {
      return new NextResponse("Canvas feature is not available for your account", { status: 403 });
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
    logError("Error updating canvas settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
