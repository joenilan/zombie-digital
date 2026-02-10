import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TWITCH_SCOPES } from "@/utils/twitch-constants";
import { debug, logError } from '@/lib/debug'

const DEBUG = true;

interface TwitchUser {
  id: string;
  twitch_id: string;
  site_role: string;
  created_at?: string;
  confirmed_at?: string;
}

// Add UUID generation function
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function GET(request: Request) {
  // Always use an absolute URL for parsing and redirects.
  // In proxied deployments request.url can resolve to an internal host (for example 0.0.0.0:3000).
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const requestUrl = new URL(request.url, baseUrl);
  const publicOrigin = new URL(baseUrl).origin;
  const code = requestUrl.searchParams.get("code");

  debug.auth("Auth callback request URL:", request.url);
  debug.auth("Parsed code from query:", code);

  if (DEBUG) {
    debug.auth("Auth callback started", { hasCode: !!code });
  }

  // Verify environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError("Missing environment variables:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    });
    return NextResponse.redirect(
      `${publicOrigin}/login?error=server_configuration`
    );
  }

  if (code) {
    const cookieStore = cookies();
    // Create regular client for auth
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Create service role client for database operations
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Add required scopes for the API calls
      const options = {
        scopes: TWITCH_SCOPES,
      };

      // Exchange code for session using regular client
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        logError("Session error:", sessionError);
        return NextResponse.redirect(`${publicOrigin}/?error=session`);
      }

      if (!session?.user) {
        logError("No session or user");
        return NextResponse.redirect(`${publicOrigin}/?error=no_session`);
      }

      // Get user metadata from session
      const { user } = session;
      const metadata = user.user_metadata;

      debug.auth("Processing user data", {
        id: user.id,
        metadata: metadata,
      });

      try {
        // Only check if this specific Twitch account exists
        const { data: existingTwitchUser, error: checkError } =
          await serviceClient
            .from("twitch_users")
            .select("*")
            .eq("twitch_id", metadata.provider_id)
            .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          logError("Error checking existing user:", checkError);
        }

        // Get the OAuth tokens from the session
        const {
          data: { session: oauthSession },
          error: oauthError,
        } = await supabase.auth.getSession();

        if (oauthError) {
          logError("OAuth session error:", oauthError);
        }

        // Log the full session data to see what we get from Twitch
        debug.auth("Full OAuth session:", oauthSession);

        // Prepare user data with scopes
        const userData = {
          id: existingTwitchUser ? existingTwitchUser.id : generateUUID(),
          twitch_id: metadata.provider_id,
          username: metadata.name,
          display_name: metadata.nickname,
          email: metadata.email,
          profile_image_url: metadata.avatar_url,
          provider_id: metadata.provider_id,
          access_token: session?.access_token || null,
          refresh_token: session?.refresh_token || null,
          token_expires_at: session?.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : null,
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
          provider_scopes: TWITCH_SCOPES,
          raw_user_meta_data: metadata,
          raw_app_meta_data: user.app_metadata,
          role: "authenticated",
          site_role: existingTwitchUser?.site_role || "user",
          last_sign_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          confirmed_at:
            existingTwitchUser?.confirmed_at || new Date().toISOString(),
          created_at:
            existingTwitchUser?.created_at || new Date().toISOString(),
          is_anonymous: false,
        };

        debug.auth("Saving user data with tokens:", {
          id: userData.id,
          provider_token: !!userData.provider_token,
          provider_refresh_token: !!userData.provider_refresh_token,
          provider_scopes: userData.provider_scopes,
        });

        debug.auth("Prepared userData for insert/update:", userData);
        debug.auth("site_role value and type:", { value: userData.site_role, type: typeof userData.site_role });
        debug.auth("provider_scopes value and type:", { value: userData.provider_scopes, isArray: Array.isArray(userData.provider_scopes) });

        let result;

        if (existingTwitchUser) {
          // Update existing Twitch account but preserve certain fields
          const updateData = {
            ...userData,
            id: existingTwitchUser.id, // Preserve the existing ID
            site_role: existingTwitchUser.site_role,
            created_at: existingTwitchUser.created_at,
            confirmed_at: existingTwitchUser.confirmed_at,
          };

          result = await serviceClient
            .from("twitch_users")
            .update(updateData)
            .eq("id", existingTwitchUser.id);
        } else {
          // Create new row for new Twitch account
          result = await serviceClient.from("twitch_users").insert(userData);
        }

        if (result.error) {
          logError("Error managing user data (full error):", result.error);
          logError("userData that caused error:", userData);
          return NextResponse.redirect(
            `${publicOrigin}/login?error=db_error&error_message=${encodeURIComponent(result.error.message)}`
          );
        }

        // Verify the user exists after operation
        const { data: verifyUser, error: verifyError } = await serviceClient
          .from("twitch_users")
          .select("*")
          .eq("id", userData.id)
          .single();

        if (verifyError || !verifyUser) {
          logError("Error verifying user data:", verifyError);
          return NextResponse.redirect(
            `${publicOrigin}/login?error=verification_failed`
          );
        }

        debug.auth("User managed successfully", {
          userId: verifyUser.id,
          twitch_id: verifyUser.twitch_id,
          operation: existingTwitchUser ? "updated" : "inserted",
          email: verifyUser.email,
        });

        // Update user metadata to include site_role
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            ...metadata,
            site_role: verifyUser.site_role || "user",
          },
        });

        if (updateError) {
          logError("Error updating user metadata:", updateError);
        }

        debug.auth("Updated user metadata:", {
          role: verifyUser.site_role,
          metadata: metadata,
        });

        // Create response with redirect
        const response = NextResponse.redirect(
          `${publicOrigin}/dashboard`
        );

        // Set cookie with session data
        await supabase.auth.setSession(session);

        return response;
      } catch (error) {
        logError("Error processing user data:", error);
        return NextResponse.redirect(
          `${publicOrigin}/login?error=unknown`
        );
      }
    } catch (error) {
      logError("Error processing user data:", error);
      return NextResponse.redirect(`${publicOrigin}/login?error=unknown`);
    }
  }

  debug.auth("No code provided in callback");
  return NextResponse.redirect(`${publicOrigin}/login?error=no_code`);
}
