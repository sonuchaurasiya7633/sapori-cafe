import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { deleteAsset } from '@/lib/cloudinary';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = dbStore.getMenuItemById(id) || dbStore.getMenuItemBySlug(id);

    if (!item) {
      return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = dbStore.getMenuItemById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Clean up old image if replaced or removed
    if (
      existing.cloudinaryPublicId &&
      body.cloudinaryPublicId !== undefined &&
      existing.cloudinaryPublicId !== body.cloudinaryPublicId
    ) {
      deleteAsset(existing.cloudinaryPublicId).catch((e) =>
        console.warn('Old asset delete error:', e)
      );
    }

    const updated = dbStore.updateMenuItem(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = dbStore.getMenuItemById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    if (existing.cloudinaryPublicId) {
      deleteAsset(existing.cloudinaryPublicId).catch((e) =>
        console.warn('Asset delete error:', e)
      );
    }

    const deleted = dbStore.deleteMenuItem(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
