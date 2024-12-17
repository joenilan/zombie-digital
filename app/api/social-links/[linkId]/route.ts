import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const socialLink = await db.socialLink.delete({
      where: {
        id: params.linkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(socialLink);
  } catch (error) {
    console.error("[SOCIAL_LINKS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
