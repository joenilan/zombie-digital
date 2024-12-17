import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getTwitchUser(provider_id: string) {
  const supabase = createClientComponentClient();
  return await supabase
    .from("twitch_users")
    .select()
    .eq("twitch_id", provider_id)
    .single();
}
