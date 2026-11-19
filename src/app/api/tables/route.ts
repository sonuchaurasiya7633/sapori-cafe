import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const tables = dbStore.getTables();
    return NextResponse.json({ success: true, count: tables.length, tables });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableNumber, status, currentOrderId } = body;

    if (!tableNumber || !status) {
      return NextResponse.json({ success: false, error: 'Table number and status required' }, { status: 400 });
    }

    const updated = dbStore.updateTableStatus(tableNumber, status, currentOrderId);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, table: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update table' }, { status: 500 });
  }
}
