import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { SiteSettings } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { SiteSettingsModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET() {
  try {
    await connectToDatabase();
    const dbSettings = await SiteSettingsModel.findOne().lean();
    if (dbSettings) {
      const { _id, __v, ...clean } = dbSettings as any;
      const merged = { ...dbStore.getSettings(), ...clean };
      return NextResponse.json(merged, { headers: NO_CACHE_HEADERS });
    }
    return NextResponse.json(dbStore.getSettings(), { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(dbStore.getSettings(), { headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleUpdate(request);
}

async function handleUpdate(request: NextRequest) {
  try {
    const body = await request.json();

    // Field sanitization & validation
    const updates: Partial<SiteSettings> = { ...body };

    if (updates.deliveryFee !== undefined) {
      updates.deliveryFee = Math.max(0, Number(updates.deliveryFee) || 0);
    }
    if (updates.freeDeliveryThreshold !== undefined) {
      updates.freeDeliveryThreshold = Math.max(0, Number(updates.freeDeliveryThreshold) || 0);
    }
    if (updates.packagingFee !== undefined) {
      updates.packagingFee = Math.max(0, Number(updates.packagingFee) || 0);
    }
    if (updates.gstRatePercent !== undefined) {
      updates.gstRatePercent = Math.max(0, Math.min(28, Number(updates.gstRatePercent) || 0));
    }
    if (updates.minOrderValue !== undefined) {
      updates.minOrderValue = Math.max(0, Number(updates.minOrderValue) || 0);
    }
    if (updates.deliveryRadiusKm !== undefined) {
      updates.deliveryRadiusKm = Math.max(1, Number(updates.deliveryRadiusKm) || 1);
    }

    // Explicit string trim
    if (typeof updates.googleVerificationCode === 'string') {
      updates.googleVerificationCode = updates.googleVerificationCode.trim();
    }
    if (typeof updates.googleAnalyticsId === 'string') {
      updates.googleAnalyticsId = updates.googleAnalyticsId.trim();
    }
    if (typeof updates.canonicalDomain === 'string') {
      updates.canonicalDomain = updates.canonicalDomain.trim();
    }

    // Connect directly to MongoDB Atlas (Single Source of Truth)
    await connectToDatabase();

    // 1. Direct synchronous write to MongoDB Atlas
    const savedDoc = await SiteSettingsModel.findOneAndUpdate(
      {},
      { $set: updates },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // 2. Synchronize in-memory store
    const updated = dbStore.updateSettings(updates);

    const { _id, __v, ...cleanSaved } = (savedDoc || {}) as any;
    const mergedSettings = { ...updated, ...cleanSaved };

    return NextResponse.json(
      {
        success: true,
        settings: mergedSettings,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
