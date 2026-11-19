import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { TableReservationModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const dbRes = await TableReservationModel.findOne({
      $or: [{ id }, { bookingRef: id }],
    }).lean();

    if (dbRes) {
      const { _id, __v, ...clean } = dbRes as any;
      return NextResponse.json({ success: true, reservation: clean }, { headers: NO_CACHE_HEADERS });
    }

    const res = dbStore.getReservationById(id);
    if (!res) {
      return NextResponse.json({ success: false, error: 'Reservation record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation: res }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, tableNumber, adminNotes, specialRequests, actor = 'admin' } = body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (tableNumber !== undefined) updates.tableNumber = tableNumber;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (specialRequests !== undefined) updates.specialRequests = specialRequests;
    updates.updatedAt = new Date().toISOString();

    await connectToDatabase();
    await TableReservationModel.findOneAndUpdate({ id }, { $set: updates }, { upsert: true });
    const updated = dbStore.updateReservation(id, updates, actor);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Reservation record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Failed to update reservation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await TableReservationModel.deleteOne({ id });
    const deleted = dbStore.deleteReservation(id, 'admin');

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Reservation record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Reservation cancelled and deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
