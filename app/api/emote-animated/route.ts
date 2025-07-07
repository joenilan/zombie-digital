import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config(process.env.CLOUDINARY_URL!)

const EMOTE_SIZES = [112, 56, 28]

export async function POST(req: NextRequest) {
  try {
    const { fileUrl, outputFormat } = await req.json()
    if (!fileUrl || !outputFormat) {
      return NextResponse.json({ error: 'Missing fileUrl or outputFormat' }, { status: 400 })
    }

    // Upload to Cloudinary (fetch from Supabase Storage)
    const uploadResult = await cloudinary.uploader.upload(fileUrl, {
      resource_type: 'auto',
      folder: 'emotes',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    })

    // Generate URLs for each size
    const urls = EMOTE_SIZES.map(size => {
      return cloudinary.url(uploadResult.public_id, {
        resource_type: 'image',
        format: outputFormat, // 'gif' or 'webp'
        width: size,
        height: size,
        crop: 'fit',
        effect: 'sharpen',
        flags: 'animated', // ensures animation is preserved
        secure: true,
      })
    })

    return NextResponse.json({ urls, public_id: uploadResult.public_id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Cloudinary processing failed' }, { status: 500 })
  }
} 