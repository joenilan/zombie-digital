"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { TWITCH_SCOPES_MINIMAL } from "@/utils/twitch-constants";

export default function TwitchLoginButton({ size = "default" }: { size?: "default" | "lg" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: TWITCH_SCOPES_MINIMAL.join(' '),
          queryParams: { force_verify: 'true' },
        },
      });

      if (signInError) {
        throw signInError;
      }

      // The redirect will happen automatically, so we don't need to set loading to false
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const twitchIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="opacity-90"
    >
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleLogin}
        disabled={isLoading}
        loading={isLoading}
        variant="ethereal"
        size={size === "lg" ? "lg" : "default"}
        icon={!isLoading ? twitchIcon : undefined}
        className={size === "lg" ? "text-lg" : ""}
      >
        {isLoading ? "Connecting..." : "Connect with Twitch"}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 