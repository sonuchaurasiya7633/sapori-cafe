import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = dbStore.getCMSPage(id);
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'CMS Page not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, page });
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

    // If updating a specific section
    if (body.sectionId && body.fields) {
      const updated = dbStore.updateCMSSection(
        id,
        body.sectionId,
        body.fields,
        body.isVisible
      );
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Page not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, page: updated });
    }

    // Updating page metadata or full page
    const updated = dbStore.updateCMSPage(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update CMS page' },
      { status: 500 }
    );
  }
}
