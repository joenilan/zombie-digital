import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { debug, logError } from '@/lib/debug'

cloudinary.config(process.env.CLOUDINARY_URL!)

export async function GET() {
  try {
    const usage = await cloudinary.api.usage()
    debug.api('Cloudinary usage API response', usage)
    return NextResponse.json(usage) // Return the full response for debugging
  } catch (error: any) {
    logError('Cloudinary usage API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Cloudinary usage' }, { status: 500 })
  }
} 