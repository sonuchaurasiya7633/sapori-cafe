import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { MenuItem } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { MenuItemModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const availableOnly = searchParams.get('available') === 'true';
    const signatureOnly = searchParams.get('signature') === 'true';
    const search = searchParams.get('search')?.toLowerCase() || '';

    await connectToDatabase();
    const query: Record<string, any> = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (availableOnly) {
      query.isAvailable = true;
    }
    if (signatureOnly) {
      query.isSignature = true;
    }

    let items: MenuItem[] = [];
    const dbItems = await MenuItemModel.find(query).lean();
    if (dbItems && dbItems.length > 0) {
      items = dbItems.map(({ _id, __v, ...rest }: any) => rest);
    } else {
      items = dbStore.getMenuItems({ category, availableOnly, signatureOnly });
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.description.toLowerCase().includes(search) ||
          i.category.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, count: items.length, items }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Menu API GET error:', error);
    const items = dbStore.getMenuItems();
    return NextResponse.json({ success: true, count: items.length, items }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      slug,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      price: Number(body.price),
      originalImportedPrice: Number(body.price),
      offerPrice: body.offerPrice ? Number(body.offerPrice) : undefined,
      category: body.category,
      subcategory: body.subcategory,
      isVeg: body.isVeg ?? true,
      isVegan: body.isVegan ?? false,
      isSignature: body.isSignature ?? false,
      isSpicy: body.isSpicy ?? false,
      isAvailable: body.isAvailable ?? true,
      prepTimeMinutes: body.prepTimeMinutes ? Number(body.prepTimeMinutes) : 15,
      addOns: body.addOns || [],
      rating: 5.0,
      image: body.image,
      cloudinaryPublicId: body.cloudinaryPublicId,
    };

    await connectToDatabase();
    await MenuItemModel.findOneAndUpdate({ id: newItem.id }, newItem, { upsert: true, new: true });
    const created = dbStore.createMenuItem(newItem);

    return NextResponse.json({ success: true, item: created }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Menu API POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create menu item' }, { status: 500 });
  }
}
