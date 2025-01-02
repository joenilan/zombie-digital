"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { TWITCH_API_URL } from "@/utils/twitch-constants";

async function getTwitchApiData(userId: string) {
  const supabase = createServerComponentClient({ cookies });

  // Get the latest provider token from the database
  const { data: user } = await supabase
    .from("twitch_users")
    .select("provider_token")
    .eq("twitch_id", userId)
    .single();

  if (!user?.provider_token) {
    throw new Error("No provider token found");
  }

  const headers = {
    Authorization: `Bearer ${user.provider_token}`,
    "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
  };

  // Followers count
  const followersRes = await fetch(
    `${TWITCH_API_URL}/users/follows?to_id=${userId}`,
    { headers }
  );
  const followersData = await followersRes.json();

  // Subscribers count
  const subsRes = await fetch(
    `${TWITCH_API_URL}/subscriptions?broadcaster_id=${userId}`,
    { headers }
  );
  const subsData = await subsRes.json();

  // Channel Points
  const pointsRes = await fetch(
    `${TWITCH_API_URL}/channel_points?broadcaster_id=${userId}`,
    { headers }
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
    .select("twitch_id")
    .eq("id", userId)
    .single();

  if (!user?.twitch_id) return null;

  const stats = await getTwitchApiData(user.twitch_id);

  // Update the database with new stats
  const { data: updatedUser } = await supabase
    .from("twitch_users")
    .update(stats)
    .eq("id", userId)
    .select()
    .single();

  return updatedUser;
}
