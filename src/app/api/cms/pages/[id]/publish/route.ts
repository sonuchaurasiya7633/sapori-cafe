import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CMSPageModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = dbStore.publishCMSPage(id);
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }
    await connectToDatabase();
    await CMSPageModel.findOneAndUpdate({ id }, { $set: { isPublished: true, updatedAt: new Date().toISOString() } }, { upsert: true });

    return NextResponse.json({ success: true, page, message: 'Page published successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish CMS page' },
      { status: 500 }
    );
  }
}
