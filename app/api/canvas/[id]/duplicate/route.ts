import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return redirect("/auth/signin");
    }

    // Get user's Twitch info
    const { data: twitchUser } = await supabase
      .from("twitch_users")
      .select("id")
      .eq("twitch_id", user.user_metadata.provider_id)
      .single();

    if (!twitchUser) {
      throw new Error("Twitch user not found");
    }

    // Get the canvas to duplicate
    const { data: sourceCanvas } = await supabase
      .from("canvas_settings")
      .select("*")
      .eq("id", id)
      .eq("user_id", twitchUser.id)
      .single();

    if (!sourceCanvas) {
      throw new Error("Canvas not found");
    }

    // Create a new canvas with the same settings
    const { data: newCanvas, error } = await supabase
      .from("canvas_settings")
      .insert({
        user_id: twitchUser.id,
        name: `${sourceCanvas.name} (Copy)`,
        resolution: sourceCanvas.resolution,
        background_color: sourceCanvas.background_color,
        show_name_tag: sourceCanvas.show_name_tag,
        auto_fit: sourceCanvas.auto_fit,
        locked: sourceCanvas.locked,
      })
      .select()
      .single();

    if (error) throw error;

    return redirect("/dashboard/canvas");
  } catch (error) {
    console.error("Error duplicating canvas:", error);
    return redirect("/dashboard/canvas?error=failed-to-duplicate");
  }
}
