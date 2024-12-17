import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TWITCH_SCOPES } from "@/utils/twitch-constants";

// Add UUID generation function
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("Auth callback started", { hasCode: !!code });

  // Verify environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    });
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=server_configuration`
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
        console.error("Session error:", sessionError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=session`
        );
      }

      if (!session?.user) {
        console.error("No session or user");
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=no_session`
        );
      }

      // Get user metadata from session
      const { user } = session;
      const metadata = user.user_metadata;

      console.log("Processing user data", {
        id: user.id,
        metadata: metadata,
      });

      try {
        // Only check if this specific Twitch account exists
        const { data: existingTwitchUser, error: checkError } =
          await serviceClient
            .from("twitch_users")
            .select("id, twitch_id")
            .eq("twitch_id", metadata.provider_id)
            .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing user:", checkError);
        }

        // Get the OAuth tokens from the session
        const {
          data: { session: oauthSession },
          error: oauthError,
        } = await supabase.auth.getSession();

        if (oauthError) {
          console.error("OAuth session error:", oauthError);
        }

        // Log the full session data to see what we get from Twitch
        console.log("Full OAuth session:", oauthSession);

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
          is_anonymous: false,
        };

        console.log("Saving user data with tokens:", {
          provider_token: !!userData.provider_token,
          provider_refresh_token: !!userData.provider_refresh_token,
          provider_scopes: userData.provider_scopes,
        });

        let result;

        if (existingTwitchUser) {
          // Update existing Twitch account but preserve certain fields
          const updateData = {
            ...userData,
            site_role: existingTwitchUser.site_role,
            created_at: existingTwitchUser.created_at,
            confirmed_at: existingTwitchUser.confirmed_at,
          };

          result = await serviceClient
            .from("twitch_users")
            .update(updateData)
            .eq("twitch_id", metadata.provider_id);
        } else {
          // Create new row for new Twitch account
          userData.created_at = new Date().toISOString();
          userData.confirmed_at = new Date().toISOString();
          result = await serviceClient.from("twitch_users").insert(userData);
        }

        if (result.error) {
          console.error("Error managing user data:", result.error);
          return NextResponse.redirect(
            `${requestUrl.origin}/login?error=db_error`
          );
        }

        // Verify the user exists after operation
        const { data: verifyUser, error: verifyError } = await serviceClient
          .from("twitch_users")
          .select("*")
          .eq("twitch_id", metadata.provider_id)
          .single();

        if (verifyError || !verifyUser) {
          console.error("Error verifying user data:", verifyError);
          return NextResponse.redirect(
            `${requestUrl.origin}/login?error=verification_failed`
          );
        }

        console.log("User managed successfully", {
          userId: verifyUser.id,
          twitch_id: verifyUser.twitch_id,
          operation: existingTwitchUser ? "updated" : "inserted",
          email: verifyUser.email,
        });

        // Only redirect to dashboard after successful user creation/update
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      } catch (error) {
        console.error("Error processing user data:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=unknown`
        );
      }
    } catch (error) {
      console.error("Error processing user data:", error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unknown`);
    }
  }

  console.log("No code provided in callback");
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
}
