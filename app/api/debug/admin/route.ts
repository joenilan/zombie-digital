import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get ALL matching users to see duplicates
  const { data: duplicateCheck } = await supabase
    .from("twitch_users")
    .select("id, email, site_role, created_at, twitch_id");

  return NextResponse.json({
    sessionUserId: session?.user?.id,
    sessionUserEmail: session?.user?.email,
    allUsers: duplicateCheck,
    userMetadata: session?.user?.user_metadata,
  });
}
