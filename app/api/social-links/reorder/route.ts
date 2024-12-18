import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/social-links/reorder:
 *   put:
 *     summary: Reorder social links
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Links reordered successfully
 *       500:
 *         description: Error reordering links
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { links } = body;

    const updates = await Promise.all(
      links.map((link: any, index: number) =>
        prisma.social_tree.update({
          where: { id: link.id },
          data: { order_index: index },
        })
      )
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error reordering links:", error);
    return NextResponse.json(
      { error: "Error reordering links" },
      { status: 500 }
    );
  }
}
