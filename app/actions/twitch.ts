"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function getTwitchApiData(accessToken: string, userId: string) {
  // Followers count
  const followersRes = await fetch(
    `https://api.twitch.tv/helix/users/follows?to_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      },
    }
  );
  const followersData = await followersRes.json();

  // Subscribers count
  const subsRes = await fetch(
    `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      },
    }
  );
  const subsData = await subsRes.json();

  // Channel Points
  const pointsRes = await fetch(
    `https://api.twitch.tv/helix/channel_points?broadcaster_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      },
    }
  );
  const pointsData = await pointsRes.json();

  return {
    follower_count: followersData.total || 0,
    subscriber_count: subsData.total || 0,
    channel_points: pointsData.points || 0,
  };
}

export async function updateTwitchStats(userId: string) {
  const supabase = createServerComponentClient({ cookies });

  const { data: user } = await supabase
    .from("twitch_users")
    .select("provider_token, twitch_id")
    .eq("id", userId)
    .single();

  if (!user?.provider_token) return null;

  const stats = await getTwitchApiData(user.provider_token, user.twitch_id);

  // Update the database with new stats
  const { data: updatedUser } = await supabase
    .from("twitch_users")
    .update(stats)
    .eq("id", userId)
    .select()
    .single();

  return updatedUser;
}
