import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import cloudinary from '@/lib/cloudinary';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    // 0. Rate Limiting: max 20 uploads per minute per IP
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`upload_${clientIp}`, { limit: 20, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Upload rate limit reached. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 1. Session verification in production
    const session = req.cookies.get('sapori_admin_session')?.value;
    if (
      process.env.NODE_ENV === 'production' &&
      (!session || !session.includes('authenticated_sapori_admin_session'))
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required for media uploads' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // 2. Validate File Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file format (${file.type}). Allowed: JPG, PNG, WebP, AVIF.`,
        },
        { status: 400 }
      );
    }

    // 3. Validate File Size
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

    // 4. Attempt Secure Cloudinary Upload to sapori-cafe/food-items
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
      console.warn('Cloudinary upload warning:', cloudErr.message);

      // Local fallback in non-production environments
      const timestamp = Date.now();
      const safeOriginalName = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}-${safeOriginalName}`;
      const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'food-items');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.resolve(uploadDir, uniqueFileName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/food-items/${uniqueFileName}`,
        publicId: `local_${uniqueFileName}`,
        provider: 'local',
        warning: 'Uploaded locally as Cloudinary credentials were not reachable',
      });
    }
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Image upload failed. Please verify format and size.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = req.cookies.get('sapori_admin_session')?.value;
    if (
      process.env.NODE_ENV === 'production' &&
      (!session || !session.includes('authenticated_sapori_admin_session'))
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to delete media' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'publicId parameter is required' },
        { status: 400 }
      );
    }

    // Path Traversal Defenses on Local Files
    if (publicId.startsWith('local_')) {
      const cleanFileName = path.basename(publicId.replace('local_', ''));
      const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'food-items');
      const targetPath = path.resolve(uploadDir, cleanFileName);

      // Strictly ensure target stays inside uploadDir
      if (!targetPath.startsWith(uploadDir)) {
        return NextResponse.json({ success: false, error: 'Access denied: Invalid file path' }, { status: 403 });
      }

      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      return NextResponse.json({ success: true, message: 'Local image deleted safely' });
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
