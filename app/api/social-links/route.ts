import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, url } = await req.json();

    const socialLink = await db.socialLink.create({
      data: {
        title,
        url,
        userId: session.user.id,
      },
    });

    return NextResponse.json(socialLink);
  } catch (error) {
    console.error("[SOCIAL_LINKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
