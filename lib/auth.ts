import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

class AuthService {
  private supabase = createClientComponentClient();
  private refreshPromise: Promise<boolean> | null = null;

  async getCurrentSession() {
    return await this.supabase.auth.getSession();
  }

  async validateAndRefreshSession(): Promise<boolean> {
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await this.supabase.auth.getSession();

        if (sessionError || !session) {
          return false;
        }

        // Check if token is expired or about to expire (within 5 minutes)
        const expiresAt = session.expires_at;
        const isExpired = expiresAt && Date.now() / 1000 >= expiresAt;
        const expiresInFiveMinutes =
          expiresAt && expiresAt - Date.now() / 1000 <= 300;

        if (isExpired) {
          await this.supabase.auth.signOut();
          toast.error("Your session has expired. Please log in again.");
          return false;
        }

        if (expiresInFiveMinutes) {
          const {
            data: { session: refreshedSession },
            error: refreshError,
          } = await this.supabase.auth.refreshSession();

          if (refreshError || !refreshedSession) {
            await this.supabase.auth.signOut();
            toast.error("Session expired. Please log in again.");
            return false;
          }

          // Get the user's Twitch data from our database using twitch_id
          const { data: twitchUser, error: twitchError } = await this.supabase
            .from("twitch_users")
            .select("*")
            .eq("twitch_id", refreshedSession.user.user_metadata.provider_id)
            .single();

          if (twitchError || !twitchUser) {
            console.error("Error fetching Twitch user:", twitchError);
            return false;
          }

          // Check if Twitch token needs refresh (expires within 5 minutes)
          const twitchTokenExpiresAt = new Date(
            twitchUser.token_expires_at || 0
          );
          const twitchTokenExpiresInFiveMinutes =
            twitchTokenExpiresAt.getTime() - Date.now() <= 300000;

          if (twitchTokenExpiresInFiveMinutes) {
            // Call your Twitch token refresh API endpoint
            const response = await fetch("/api/auth/refresh-twitch-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                twitch_id: twitchUser.twitch_id,
                refreshToken: twitchUser.refresh_token,
              }),
            });

            if (!response.ok) {
              console.error("Failed to refresh Twitch token");
              return false;
            }
          }
        }

        return true;
      } catch (err) {
        console.error("Auth validation error:", err);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }
}

// Export a singleton instance
export const authService = new AuthService();

// Middleware to validate session
export async function validateSession() {
  const isValid = await authService.validateAndRefreshSession();
  if (!isValid) {
    // Redirect to login
    window.location.href = "/auth/signin";
    return false;
  }
  return true;
}
