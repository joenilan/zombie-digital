import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Helper function to check feature access
async function checkFeatureAccess(featureId: string, userId: string) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user's role
  const { data: user, error: userError } = await supabase
    .from('twitch_users')
    .select('site_role')
    .eq('id', userId)
    .single();

  if (!user) {
    return false;
  }

  // Get feature state
  const { data: feature, error: featureError } = await supabase
    .from('feature_states')
    .select('enabled, required_role')
    .eq('feature_id', featureId)
    .single();

  if (!feature || !feature.enabled) {
    return false;
  }

  // Check role hierarchy
  const roleHierarchy = ['user', 'moderator', 'admin', 'owner'];
  const userRoleIndex = roleHierarchy.indexOf(user.site_role);
  const requiredRoleIndex = roleHierarchy.indexOf(feature.required_role);

  return userRoleIndex >= requiredRoleIndex;
}

/**
 * @swagger
 * /api/social-links:
 *   post:
 *     summary: Create a new social link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               platform:
 *                 type: string
 *               url:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Social link created successfully
 *       403:
 *         description: Feature not available
 *       500:
 *         description: Error creating social link
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, platform, url, title } = body;

    // Check if SOCIALS feature is enabled for this user
    const hasAccess = await checkFeatureAccess('SOCIALS', user_id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Social Links feature is not available for your account" },
        { status: 403 }
      );
    }

    const link = await prisma.social_tree.create({
      data: {
        user_id,
        platform,
        url,
        title: title || platform,
        order_index: 999,
      },
      include: {
        twitch_user: true,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error creating social link:", error);
    return NextResponse.json(
      { error: "Error creating social link" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/social-links:
 *   get:
 *     summary: Get social links for a user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of social links
 *       403:
 *         description: Feature not available
 *       500:
 *         description: Error fetching social links
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if SOCIALS feature is enabled for this user
    const hasAccess = await checkFeatureAccess('SOCIALS', userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Social Links feature is not available for your account" },
        { status: 403 }
      );
    }

    const links = await prisma.social_tree.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        order_index: "asc",
      },
      include: {
        twitch_user: true,
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json(
      { error: "Error fetching social links" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const link = await prisma.social_tree.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error deleting social link:", error);
    return NextResponse.json(
      { error: "Error deleting social link" },
      { status: 500 }
    );
  }
}
