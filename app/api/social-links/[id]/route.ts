import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logError } from '@/lib/debug'

/**
 * @swagger
 * /api/social-links/{id}:
 *   delete:
 *     summary: Delete a social link
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Social link deleted successfully
 *       500:
 *         description: Error deleting social link
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const link = await prisma.social_tree.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    logError('Error deleting social link:', error);
    return NextResponse.json(
      { error: "Error deleting social link" },
      { status: 500 }
    );
  }
}
