import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserLevel } from "@/types/database";
import { hasPermission } from "@/utils/permissions";

export function withRole(requiredLevel: UserLevel) {
  return async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const { data: user } = await supabase
      .from("twitch_users")
      .select("site_role")
      .eq("id", session.user.id)
      .single();

    if (!user || !hasPermission(user.site_role, requiredLevel)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return res;
  };
}
