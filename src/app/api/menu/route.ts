import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { MenuItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const availableOnly = searchParams.get('available') === 'true';
    const signatureOnly = searchParams.get('signature') === 'true';
    const search = searchParams.get('search')?.toLowerCase() || '';

    let items = dbStore.getMenuItems({ category, availableOnly, signatureOnly });

    if (search) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.description.toLowerCase().includes(search) ||
          i.category.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Menu API GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch menu items' }, { status: 500 });
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
      image: body.image || undefined,
      cloudinaryPublicId: body.cloudinaryPublicId || undefined,
    };

    const created = dbStore.createMenuItem(newItem);

    // Asynchronously synchronize with MongoDB Atlas
    import('@/lib/db/models').then(({ MenuItemModel }) => {
      MenuItemModel.findOneAndUpdate({ id: created.id }, created, { upsert: true }).catch((err) =>
        console.warn('MongoDB menu item sync warning:', err.message)
      );
    });

    return NextResponse.json({ success: true, item: created }, { status: 201 });
  } catch (error) {
    console.error('Menu API POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create menu item' }, { status: 500 });
  }
}
