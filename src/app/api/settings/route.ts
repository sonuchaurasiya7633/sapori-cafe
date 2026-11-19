import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { SiteSettings } from '@/types';
import { SiteSettingsModel } from '@/lib/db/models';

export async function GET() {
  try {
    let settings = dbStore.getSettings();
    try {
      const dbSettings = await SiteSettingsModel.findOne().lean();
      if (dbSettings) {
        settings = dbStore.updateSettings(dbSettings as Partial<SiteSettings>);
      }
    } catch (dbErr) {
      // Fallback to local store
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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

    const updated = dbStore.updateSettings(updates);

    // Persist to MongoDB Atlas
    try {
      await SiteSettingsModel.findOneAndUpdate({}, updates, { upsert: true, new: true });
    } catch (dbErr: any) {
      console.warn('MongoDB settings sync warning:', dbErr.message);
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
