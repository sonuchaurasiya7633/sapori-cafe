import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { SiteSettings } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { SiteSettingsModel } from '@/lib/db/models';

export async function GET() {
  try {
    await connectToDatabase();
    const dbSettings = await SiteSettingsModel.findOne().lean();
    if (dbSettings) {
      const merged = { ...dbStore.getSettings(), ...dbSettings };
      return NextResponse.json(merged);
    }
    return NextResponse.json(dbStore.getSettings());
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(dbStore.getSettings());
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

    // Connect directly to MongoDB Atlas
    await connectToDatabase();

    // 1. Direct synchronous write to MongoDB Atlas
    const savedDoc = await SiteSettingsModel.findOneAndUpdate(
      {},
      { $set: updates },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // 2. Synchronize in-memory store
    const updated = dbStore.updateSettings(updates);

    const mergedSettings = savedDoc ? { ...updated, ...savedDoc } : updated;

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
