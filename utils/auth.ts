import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function refreshSession() {
  const supabase = createClientComponentClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      console.error("Error refreshing session:", error);
      // Redirect to root instead of /login
      window.location.href = "/";
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error refreshing session:", error);
    window.location.href = "/";
    return null;
  }
}
