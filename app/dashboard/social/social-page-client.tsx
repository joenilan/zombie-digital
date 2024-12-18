'use client';

import { SocialLinksManager } from "@/components/social-links-manager";
import type { TwitchUser } from "@/types/database";
import { useEffect } from "react";

interface SocialPageClientProps {
  initialLinks: any[];
  userData: {
    id: string;
    twitch_user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function SocialPageClient({ initialLinks, userData }: SocialPageClientProps) {
  useEffect(() => {
    console.log('[CLIENT] SocialPageClient mounted', {
      userData,
      userDataId: userData?.id,
      initialLinksLength: initialLinks?.length,
      timestamp: new Date().toISOString()
    });
  }, []);

  if (!userData) {
    console.error('[CLIENT] userData is undefined');
    return <div>Loading user data...</div>;
  }

  if (!userData.twitch_user_id) {
    console.error('[CLIENT] Missing twitch_user_id in userData:', userData);
    return <div>Missing Twitch user data</div>;
  }

  return (
    <div className="w-full">
      <SocialLinksManager 
        key={userData.twitch_user_id}
        initialLinks={initialLinks}
        user={userData}
      />
    </div>
  );
} 