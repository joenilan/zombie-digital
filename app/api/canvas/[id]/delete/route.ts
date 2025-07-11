import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";
import { logError } from '@/lib/debug'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const canvasId = params.id;

    // Get current user's auth ID
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !authUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get current user's twitch user record
    const { data: currentUser, error: twitchUserError } = await supabase
      .from("twitch_users")
      .select("*")
      .eq("twitch_id", authUser.user_metadata.provider_id)
      .single();

    if (twitchUserError || !currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user has Canvas access (admin or owner only)
    if (!['admin', 'owner'].includes(currentUser.site_role)) {
      return new NextResponse("Canvas feature is currently in Alpha and only available to administrators and site owners", { status: 403 });
    }

    // Get canvas settings to check ownership
    const { data: canvas, error: canvasError } = await supabase
      .from("canvas_settings")
      .select()
      .eq("id", canvasId)
      .single();

    if (canvasError || !canvas) {
      return new NextResponse("Canvas not found", { status: 404 });
    }

    // Check if user owns this canvas
    if (canvas.user_id !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the canvas
    const { error: deleteError } = await supabase
      .from("canvas_settings")
      .delete()
      .eq("id", canvasId);

    if (deleteError) {
      logError("Error deleting canvas:", deleteError);
      return new NextResponse("Failed to delete canvas", { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logError("Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
