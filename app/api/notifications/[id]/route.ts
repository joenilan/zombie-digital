import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DEBUG = false;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (DEBUG && !session) {
    console.log("DELETE unauthorized: No session");
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: user, error: userError } = await supabase
    .from("twitch_users")
    .select("site_role")
    .eq("id", session.user.id)
    .single();

  if (DEBUG) {
    if (userError) {
      console.log("DELETE user lookup error:", userError);
    }
    console.log("DELETE user role check:", {
      user,
      hasValidRole: user && ["owner", "admin"].includes(user.site_role),
    });
  }

  if (!user || !["owner", "admin"].includes(user.site_role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ active: false })
    .eq("id", params.id);

  if (DEBUG && error) {
    console.log("DELETE update error:", error);
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check auth and role (same as DELETE)
  // ... auth checks ...

  const body = await request.json();

  const { data, error } = await supabase
    .from("notifications")
    .update({
      message: body.message,
      type: body.type,
      showOnlyToAuth: body.showOnlyToAuth,
      expiresAt: body.expiresAt,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
