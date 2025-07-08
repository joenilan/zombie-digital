import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { debug, logError } from '@/lib/debug'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Skip session checks for overlay routes - they should be publicly accessible
  if (req.nextUrl.pathname.startsWith("/overlay")) {
    return res;
  }

  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if expired - this will automatically refresh tokens
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Log session state for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      debug.auth("Middleware session check:", {
        path: req.nextUrl.pathname,
        hasSession: !!session,
        error: error?.message,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      });
    }

    // Handle protected routes
    if (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/canvas")) {
      if (!session) {
        // Clear any stale cookies before redirecting
        const response = NextResponse.redirect(new URL("/auth/signin", req.url));
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
        return response;
      }
    }

    // Handle auth routes
    if (req.nextUrl.pathname.startsWith("/auth/signin")) {
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return res;
  } catch (error) {
    logError("Middleware error:", error);
    
    // If there's an auth error on protected routes, redirect to signin
    if (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/canvas")) {
      const response = NextResponse.redirect(new URL("/auth/signin", req.url));
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }
    
    return res;
  }
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth/callback (auth callback route)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|auth/callback).*)",
  ],
};
