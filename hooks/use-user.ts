import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface User {
  id: string;
  twitch_id: string;
  username: string;
  display_name: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getUser() {
      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Get the Twitch user data
        const { data: userData, error: userError } = await supabase
          .from("twitch_users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError) throw userError;

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, isLoading, error };
}
