import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
 *       500:
 *         description: Error creating social link
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, platform, url, title } = body;

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
