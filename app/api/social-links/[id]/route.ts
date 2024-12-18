import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    console.error("Error deleting social link:", error);
    return NextResponse.json(
      { error: "Error deleting social link" },
      { status: 500 }
    );
  }
}
