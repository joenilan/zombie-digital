import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { debug, logError } from '@/lib/debug'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twitchId = session.user.user_metadata?.provider_id;
    debug.admin("Checking permissions for:", { twitchId });

    const { data: currentUser, error: userError } = await supabase
      .from("twitch_users")
      .select("site_role")
      .eq("twitch_id", twitchId)
      .single();

    debug.admin("Current user check:", { currentUser, userError });

    if (
      userError ||
      !currentUser ||
      !["admin", "owner"].includes(currentUser.site_role)
    ) {
      return NextResponse.json(
        {
          error: "Forbidden",
          details: { role: currentUser?.site_role },
        },
        { status: 403 }
      );
    }

    const { userId, role } = await req.json();
    debug.admin("Attempting update:", { userId, role });

    const { error: updateError } = await supabaseAdmin
      .from("twitch_users")
      .update({ site_role: role })
      .eq("id", userId);

    if (updateError) {
      logError("Update error:", updateError);
      return NextResponse.json(
        {
          error: "Update failed",
          details: updateError,
          request: { userId, role },
        },
        { status: 500 }
      );
    }

    const { data: updatedUser, error: fetchError } = await supabaseAdmin
      .from("twitch_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) {
      logError("Fetch error:", fetchError);
      return NextResponse.json(
        {
          error: "Update succeeded but fetch failed",
          details: fetchError,
        },
        { status: 500 }
      );
    }

    debug.admin("Update successful:", updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    logError("Server error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
