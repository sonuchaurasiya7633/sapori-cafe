import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = dbStore.getReservationById(id);
    if (!res) {
      return NextResponse.json({ success: false, error: 'Reservation record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation: res });
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

    const updated = dbStore.updateReservation(id, updates, actor);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Reservation record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation: updated });
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
    const deleted = dbStore.deleteReservation(id, 'admin');
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Reservation record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Reservation cancelled and deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete reservation' }, { status: 500 });
  }
}
