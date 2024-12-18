import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SocialPageClient } from "./social-page-client";
import { TwitchUser } from "@/types/database";
import { ErrorBoundary } from '@/components/error-boundary';

export default async function SocialPage() {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[SERVER] Auth error:', authError);
      redirect('/login');
    }
    
    if (!user) {
      console.log('[SERVER] No authenticated user found');
      redirect('/login');
    }

    // Get the twitch_id from the current user's metadata
    const twitchId = user.user_metadata?.provider_id;

    console.log('[SERVER] Starting social page with:', {
      authUserId: user.id,
      email: user.email,
      twitchId
    });

    // Find the matching twitch user record
    const { data: twitchUser } = await supabase
      .from('twitch_users')
      .select('*')
      .eq('twitch_id', twitchId)
      .single();

    console.log('[SERVER] Found twitch user:', twitchUser);

    // Use the twitch user ID if found, otherwise fall back to auth user ID
    const effectiveUserId = twitchUser?.id || user.id;
    console.log('[SERVER] Using effective user ID:', effectiveUserId);

    // Add error handling for missing twitch user
    if (!twitchUser) {
      console.error('[SERVER] No twitch user found for twitch_id:', twitchId);
      return <div>Error: Twitch user not found</div>;
    }

    console.log('[SERVER] Auth user details:', {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    });

    let { data: profile, error: profileFetchError } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('user_id', effectiveUserId)
      .single();

    if (profileFetchError) {
      console.error('[SERVER] Error fetching profile:', profileFetchError);
    }

    console.log('[SERVER] Profile data:', profile);

    if (!profile) {
      console.log('[SERVER] No profile exists, starting creation process...');
      
      try {
        console.log('[SERVER] Creating profile with data:', {
          user_id: effectiveUserId,
          username: user.user_metadata?.full_name,
          display_name: user.user_metadata?.full_name,
          profile_image_url: user.user_metadata?.avatar_url
        });

        const { data: newProfile, error: profileError } = await supabase
          .from('public_profiles')
          .insert([
            {
              user_id: effectiveUserId,
              username: user.user_metadata?.full_name || 'New User',
              display_name: user.user_metadata?.full_name || 'New User',
              profile_image_url: user.user_metadata?.avatar_url || '',
              created_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (profileError) {
          throw profileError;
        }

        console.log('[SERVER] Created new profile:', newProfile);

        console.log('[SERVER] Profile created successfully, creating initial link...');

        try {
          const initialLink = {
            user_id: effectiveUserId,
            platform: 'twitch',
            url: `https://twitch.tv/${user.user_metadata?.preferred_username || user.user_metadata?.nickname || ''}`,
            title: 'My Twitch Channel',
            order_index: 0
          };

          console.log('[SERVER] Attempting to create initial link with data:', initialLink);

          const { data: newLink, error: linkError } = await supabase
            .from('social_tree')
            .insert([initialLink])
            .select();

          if (linkError) {
            console.error('[SERVER] Link creation failed:', linkError);
            throw linkError;
          }

          console.log('[SERVER] Initial link created successfully:', newLink);
        } catch (linkError) {
          console.error('[SERVER] Failed to create initial link:', linkError);
        }

        profile = newProfile;
      } catch (profileError) {
        console.error('[SERVER] Error creating profile:', profileError);
        return <div>Error creating profile</div>;
      }
    }

    const userData = {
      id: user.id,
      twitch_user_id: effectiveUserId,
      username: profile.username || twitchUser.username,
      display_name: profile.display_name || twitchUser.display_name,
      avatar_url: profile.profile_image_url || twitchUser.profile_image_url,
    };

    console.log('[SERVER] Final userData:', userData);

    // Verify userData is complete
    if (!userData.twitch_user_id) {
      console.error('[SERVER] Missing twitch_user_id in userData:', userData);
      return <div>Error: Invalid user data</div>;
    }

    const { data: initialLinks } = await supabase
      .from('social_tree')
      .select('*')
      .eq('user_id', userData.twitch_user_id)
      .order('order_index', { ascending: true });

    console.log('[SERVER] Initial links:', initialLinks);

    return (
      <ErrorBoundary>
        <div key={user.id} className="w-full">
          <SocialPageClient 
            key={user.id}
            initialLinks={initialLinks || []}
            userData={userData}
          />
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('[SERVER] Unexpected error:', error);
    return <div>An unexpected error occurred</div>;
  }
} 