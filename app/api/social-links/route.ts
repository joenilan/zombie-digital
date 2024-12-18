import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
