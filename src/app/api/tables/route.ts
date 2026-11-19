import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { DiningTableModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET() {
  try {
    await connectToDatabase();
    const dbTables = await DiningTableModel.find().sort({ tableNumber: 1 }).lean();
    if (dbTables && dbTables.length > 0) {
      const cleanTables = dbTables.map(({ _id, __v, ...rest }: any) => rest);
      return NextResponse.json({ success: true, count: cleanTables.length, tables: cleanTables }, { headers: NO_CACHE_HEADERS });
    }
    const tables = dbStore.getTables();
    return NextResponse.json({ success: true, count: tables.length, tables }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const tables = dbStore.getTables();
    return NextResponse.json({ success: true, count: tables.length, tables }, { headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableNumber, status, currentOrderId } = body;

    if (!tableNumber || !status) {
      return NextResponse.json({ success: false, error: 'Table number and status required' }, { status: 400 });
    }

    await connectToDatabase();
    const updatedDoc = await DiningTableModel.findOneAndUpdate(
      { tableNumber },
      { $set: { status, currentOrderId: currentOrderId || undefined } },
      { new: true }
    ).lean();

    const updated = dbStore.updateTableStatus(tableNumber, status, currentOrderId);
    const result = updatedDoc ? { ...updated, ...updatedDoc } : updated;

    return NextResponse.json({ success: true, table: result }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update table' }, { status: 500 });
  }
}
