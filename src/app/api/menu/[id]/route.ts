import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { deleteAsset } from '@/lib/cloudinary';
import { connectToDatabase } from '@/lib/db/mongodb';
import { MenuItemModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const dbItem = await MenuItemModel.findOne({ $or: [{ id }, { slug: id }] }).lean();
    if (dbItem) {
      const { _id, __v, ...clean } = dbItem as any;
      return NextResponse.json({ success: true, item: clean }, { headers: NO_CACHE_HEADERS });
    }

    const item = dbStore.getMenuItemById(id) || dbStore.getMenuItemBySlug(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    const { id } = await paramsPromise;
    const body = await request.json();

    await connectToDatabase();
    const existing = await MenuItemModel.findOne({ id }).lean();

    // Clean up old image if replaced or removed
    if (
      existing?.cloudinaryPublicId &&
      body.cloudinaryPublicId !== undefined &&
      existing.cloudinaryPublicId !== body.cloudinaryPublicId
    ) {
      deleteAsset(existing.cloudinaryPublicId).catch((e) =>
        console.warn('Old asset delete error:', e)
      );
    }

    const updatedDoc = await MenuItemModel.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, upsert: true }
    ).lean();

    const updated = dbStore.updateMenuItem(id, body);
    const { _id, __v, ...cleanUpdated } = (updatedDoc || {}) as any;

    return NextResponse.json({ success: true, item: { ...updated, ...cleanUpdated } }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await MenuItemModel.deleteOne({ id });
    const deleted = dbStore.deleteMenuItem(id);

    return NextResponse.json({ success: true, deleted: true }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete item' }, { status: 500 });
  }
}
