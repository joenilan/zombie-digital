"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { TWITCH_SCOPES } from "@/utils/twitch-constants";
import { useState } from "react";

export default function TwitchLoginButton({ size = "default" }: { size?: "default" | "lg" }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitch",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: TWITCH_SCOPES.join(" "),
          queryParams: {
            force_verify: "true",
            scope: TWITCH_SCOPES.join(" ")
          }
        }
      });

      if (error) {
        console.error("OAuth error:", error);
        setError("Failed to connect with Twitch. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`ethereal-button flex items-center gap-2 ${
          size === "lg" ? "text-lg px-8 py-4" : ""
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="opacity-90"
          >
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
          </svg>
        )}
        <span className="font-medium">
          {isLoading ? "Connecting..." : "Connect with Twitch"}
        </span>
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 