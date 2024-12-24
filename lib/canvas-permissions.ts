import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type CanvasRole = "owner" | "moderator" | "allowed" | "viewer" | null;

interface CanvasAccess {
  allowed: boolean;
  role: CanvasRole;
  canEdit: boolean;
}

async function verifyModStatus(
  broadcasterId: string,
  moderatorId: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/twitch/check-mod-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ broadcasterId, moderatorId }),
    });

    if (!response.ok) {
      throw new Error("Failed to verify mod status");
    }

    const { isMod } = await response.json();
    return isMod;
  } catch (error) {
    console.error("Error verifying mod status:", error);
    return false;
  }
}

export async function checkCanvasAccess(
  canvasId: string,
  userId: string | undefined
): Promise<CanvasAccess> {
  if (!userId) {
    return { allowed: false, role: null, canEdit: false };
  }

  const supabase = createClientComponentClient();

  try {
    // First, get the canvas settings and owner info
    const { data: canvas, error: canvasError } = await supabase
      .from("canvas_settings")
      .select(
        `
        *,
        twitch_user:user_id (
          id,
          twitch_id
        ),
        allowed_users!inner (
          user_id
        )
      `
      )
      .eq("id", canvasId)
      .single();

    if (canvasError || !canvas) {
      console.error("Error fetching canvas:", canvasError);
      return { allowed: false, role: null, canEdit: false };
    }

    // Check if user is the owner
    if (canvas.user_id === userId) {
      return { allowed: true, role: "owner", canEdit: true };
    }

    // Check if user is specifically allowed
    const isAllowedUser = canvas.allowed_users.some(
      (au: { user_id: string }) => au.user_id === userId
    );
    if (isAllowedUser) {
      return { allowed: true, role: "allowed", canEdit: true };
    }

    // Check if user is a mod (if mods are allowed)
    if (canvas.allow_mods) {
      const { data: modStatus } = await supabase
        .from("mod_cache")
        .select("*")
        .eq("broadcaster_id", canvas.user_id)
        .eq("moderator_id", userId)
        .single();

      if (modStatus) {
        // Check if mod status is recent (within last hour)
        const lastChecked = new Date(modStatus.last_checked);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (lastChecked > oneHourAgo) {
          return { allowed: true, role: "moderator", canEdit: true };
        }

        // If mod status is old, verify with Twitch API
        const isMod = await verifyModStatus(canvas.user_id, userId);
        if (isMod) {
          return { allowed: true, role: "moderator", canEdit: true };
        }
      } else {
        // No cached status, check with Twitch API
        const isMod = await verifyModStatus(canvas.user_id, userId);
        if (isMod) {
          return { allowed: true, role: "moderator", canEdit: true };
        }
      }
    }

    // If viewers are allowed
    if (canvas.allow_viewers) {
      return { allowed: true, role: "viewer", canEdit: true };
    }

    // Default to viewer with no edit permissions
    return { allowed: true, role: "viewer", canEdit: false };
  } catch (error) {
    console.error("Error checking canvas access:", error);
    return { allowed: false, role: null, canEdit: false };
  }
}

export async function updateModStatus(
  broadcasterId: string,
  moderatorId: string,
  isMod: boolean
) {
  const supabase = createClientComponentClient();

  if (isMod) {
    // Insert or update mod status
    const { error } = await supabase.from("mod_cache").upsert({
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
      last_checked: new Date().toISOString(),
    });

    if (error) console.error("Error updating mod cache:", error);
  } else {
    // Remove mod status
    const { error } = await supabase
      .from("mod_cache")
      .delete()
      .eq("broadcaster_id", broadcasterId)
      .eq("moderator_id", moderatorId);

    if (error) console.error("Error removing mod cache:", error);
  }
}
