"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TwitchIcon } from "./icons";

export default function LoginButton() {
  const supabase = createClientComponentClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        scope: [
          'channel_subscriptions',
          'channel:read:redemptions',
          'channel:read:polls',
          'channel:read:predictions',
          'channel:read:goals',
          'channel:read:hype_train',
          'analytics:read:games',
          'user:read:email',
          'user:read:broadcast'
        ].join(' '),
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-[#9146FF] text-white rounded-lg hover:bg-[#7313FF] transition-colors"
    >
      <TwitchIcon className="w-5 h-5" />
      <span>Login with Twitch</span>
    </button>
  );
} 