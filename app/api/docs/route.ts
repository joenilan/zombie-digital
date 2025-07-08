import { getApiDocs } from "@/lib/swagger";
import { NextResponse } from "next/server";
import { logError } from '@/lib/debug'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const docs = getApiDocs();
    return NextResponse.json(docs);
  } catch (error) {
    logError('Error generating API docs:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}
