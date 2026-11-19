import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drrfrsrl',
  api_key: process.env.CLOUDINARY_API_KEY || '644298795893459',
  api_secret: process.env.CLOUDINARY_API_SECRET || '5B1AZygBXPOLL8QQLqzg72k4wDc',
  secure: true,
});

export async function deleteAsset(publicId?: string) {
  if (!publicId) return;
  try {
    if (publicId.startsWith('local_')) {
      const fileName = publicId.replace('local_', '');
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'food-items', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } else {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.warn('Asset deletion error:', error);
  }
}

export default cloudinary;
