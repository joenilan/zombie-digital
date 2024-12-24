import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
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

    // Redirect to the canvas settings page
    return redirect(`/dashboard/canvas/${canvas.id}`);
  } catch (error) {
    console.error("Error creating canvas:", error);
    return redirect("/dashboard/canvas?error=failed-to-create");
  }
}
