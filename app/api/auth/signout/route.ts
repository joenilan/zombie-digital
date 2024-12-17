import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Sign out on the server side
  await supabase.auth.signOut();

  // Clear all cookies
  const response = new NextResponse(JSON.stringify({ message: "Signed out" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  // Get all cookies and clear them
  cookieStore.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, "", {
      maxAge: 0,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  return response;
}
