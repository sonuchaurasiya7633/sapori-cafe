import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // 1. Validate File Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file format (${file.type}). Allowed: JPG, PNG, WebP, AVIF.`,
        },
        { status: 400 }
      );
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // 3. Attempt Secure Cloudinary Upload to sapori-cafe/food-items
    try {
      const uploadResponse = await cloudinary.uploader.upload(base64Data, {
        folder: 'sapori-cafe/food-items',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return NextResponse.json({
        success: true,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        provider: 'cloudinary',
        width: uploadResponse.width,
        height: uploadResponse.height,
        format: uploadResponse.format,
      });
    } catch (cloudErr: any) {
      console.warn('Cloudinary upload warning:', cloudErr.message || cloudErr);

      // Graceful local disk fallback if Cloudinary credentials need updating
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'food-items');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const extension = file.type.split('/')[1] || 'jpg';
      const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, cleanFileName);

      fs.writeFileSync(filePath, buffer);
      const localUrl = `/uploads/food-items/${cleanFileName}`;

      return NextResponse.json({
        success: true,
        url: localUrl,
        publicId: `local_${cleanFileName}`,
        provider: 'local',
        warning: 'Uploaded to local storage. Update CLOUDINARY_API_SECRET in .env for Cloudinary CDN sync.',
      });
    }
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'publicId parameter is required' },
        { status: 400 }
      );
    }

    // If local file
    if (publicId.startsWith('local_')) {
      const fileName = publicId.replace('local_', '');
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'food-items', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return NextResponse.json({ success: true, message: 'Local image deleted' });
    }

    // If Cloudinary asset
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return NextResponse.json({ success: true, result });
    } catch (e: any) {
      console.warn('Cloudinary delete error:', e);
      return NextResponse.json({ success: true, warning: 'Failed to delete from Cloudinary' });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
