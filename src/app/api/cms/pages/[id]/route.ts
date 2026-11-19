import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CMSPageModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const dbPage = await CMSPageModel.findOne({
      $or: [{ id }, { slug: id }, { slug: `/${id}` }],
    }).lean();

    if (dbPage) {
      const { _id, __v, ...clean } = dbPage as any;
      return NextResponse.json({ success: true, page: clean }, { headers: NO_CACHE_HEADERS });
    }

    const page = dbStore.getCMSPage(id);
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'CMS Page not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, page }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch CMS page' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    // If updating a specific section
    if (body.sectionId && body.fields) {
      const updated = dbStore.updateCMSSection(
        id,
        body.sectionId,
        body.fields,
        body.isVisible
      );
      if (updated) {
        await CMSPageModel.findOneAndUpdate({ id }, { $set: updated }, { upsert: true });
        return NextResponse.json({ success: true, page: updated }, { headers: NO_CACHE_HEADERS });
      }
    }

    // Updating page metadata or full page
    const updated = dbStore.updateCMSPage(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    await CMSPageModel.findOneAndUpdate({ id }, { $set: updated }, { upsert: true });
    return NextResponse.json({ success: true, page: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update CMS page' },
      { status: 500 }
    );
  }
}
