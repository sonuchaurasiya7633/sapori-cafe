import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CMSPageModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET() {
  try {
    await connectToDatabase();
    const dbPages = await CMSPageModel.find().lean();
    if (dbPages && dbPages.length > 0) {
      const cleanPages = dbPages.map(({ _id, __v, ...rest }: any) => rest);
      return NextResponse.json({ success: true, pages: cleanPages }, { headers: NO_CACHE_HEADERS });
    }
    const pages = dbStore.getCMSPages();
    return NextResponse.json({ success: true, pages }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    const pages = dbStore.getCMSPages();
    return NextResponse.json({ success: true, pages }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Page title and slug are required' },
        { status: 400 }
      );
    }
    const pageId = body.id || body.slug.replace(/^\//, '').replace(/\//g, '-') || 'custom';
    const newPage = {
      id: pageId,
      slug: body.slug.startsWith('/') ? body.slug : `/${body.slug}`,
      title: body.title,
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || '',
      seoKeywords: body.seoKeywords || '',
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      updatedAt: new Date().toISOString(),
      sections: body.sections || [],
    };

    await connectToDatabase();
    const savedDoc = await CMSPageModel.findOneAndUpdate(
      { id: pageId },
      { $set: newPage },
      { upsert: true, new: true }
    ).lean();

    dbStore.updateCMSPage(pageId, newPage);
    const { _id, __v, ...cleanSaved } = (savedDoc || {}) as any;

    return NextResponse.json({ success: true, page: { ...newPage, ...cleanSaved } }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create CMS page' },
      { status: 500 }
    );
  }
}
