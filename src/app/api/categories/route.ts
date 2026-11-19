import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { Category } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CategoryModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET() {
  try {
    await connectToDatabase();
    const mongoCategories = await CategoryModel.find().sort({ displayPriority: 1 }).lean();
    if (mongoCategories && mongoCategories.length > 0) {
      const cleanCategories = mongoCategories.map(({ _id, __v, ...rest }: any) => rest);
      return NextResponse.json({ success: true, categories: cleanCategories }, { headers: NO_CACHE_HEADERS });
    }
    const categories = dbStore.getCategories();
    return NextResponse.json({ success: true, categories }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const categories = dbStore.getCategories();
    return NextResponse.json({ success: true, categories }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      slug,
      name: body.name.trim(),
      description: body.description?.trim(),
      displayPriority: body.displayPriority || 99,
    };

    await connectToDatabase();
    await CategoryModel.findOneAndUpdate({ id: newCat.id }, newCat, { upsert: true, new: true });
    const created = dbStore.createCategory(newCat);

    return NextResponse.json({ success: true, category: created }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
