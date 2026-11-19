import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const pages = dbStore.getCMSPages();
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch CMS pages' },
      { status: 500 }
    );
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

    const existingPages = dbStore.getCMSPages();
    const exists = existingPages.find((p) => p.id === pageId);
    if (exists) {
      const updated = dbStore.updateCMSPage(pageId, newPage);
      return NextResponse.json({ success: true, page: updated });
    }

    existingPages.push(newPage);
    return NextResponse.json({ success: true, page: newPage });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create CMS page' },
      { status: 500 }
    );
  }
}
