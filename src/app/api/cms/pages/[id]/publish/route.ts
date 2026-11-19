import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

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
    return NextResponse.json({ success: true, page, message: 'Page published successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish CMS page' },
      { status: 500 }
    );
  }
}
