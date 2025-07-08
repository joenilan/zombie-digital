import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { debug } from '@/lib/debug'

const DEBUG = false;

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("active", true)
    .order("createdAt", { ascending: false });

  if (DEBUG && error) {
    debug.api("GET notifications error:", error);
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (DEBUG && !session) {
    debug.api("POST unauthorized: No session");
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
      debug.api("POST user lookup error:", userError);
    }
    debug.api("POST user role check:", {
      user,
      hasValidRole: user && ["owner", "admin"].includes(user.site_role),
    });
  }

  if (!user || !["owner", "admin"].includes(user.site_role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        message: body.message,
        type: body.type,
        showOnlyToAuth: body.showOnlyToAuth,
        expiresAt: body.expiresAt,
        createdBy: session.user.id,
      },
    ])
    .select()
    .single();

  if (DEBUG && error) {
    debug.api("POST insert error:", error);
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
