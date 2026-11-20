import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { OrderModel } from '@/lib/db/models';
import { dbStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Query the latest order from MongoDB Atlas
    const latestDoc = await OrderModel.findOne({})
      .sort({ createdAt: -1 })
      .lean();

    if (latestDoc) {
      const order = latestDoc as any;
      return NextResponse.json(
        {
          success: true,
          latestOrder: {
            id: order.id || String(order._id),
            orderNumber: order.orderNumber || String(order._id).slice(-6),
            orderMode: order.orderMode || 'delivery',
            total: Number(order.total) || 0,
            itemsCount: Array.isArray(order.items) ? order.items.length : 1,
            customerName: order.customer?.name || 'Customer',
            customerPhone: order.customer?.phone || '',
            tableNumber: order.customer?.tableNumber || '',
            status: order.status || 'PLACED',
            paymentStatus: order.paymentStatus || 'PENDING',
            createdAt: order.createdAt || new Date().toISOString(),
          },
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Fallback to in-memory dbStore if database is empty
    const inMemoryOrders = dbStore.getOrders();
    if (inMemoryOrders.length > 0) {
      const order = inMemoryOrders[0];
      return NextResponse.json(
        {
          success: true,
          latestOrder: {
            id: order.id,
            orderNumber: order.orderNumber,
            orderMode: order.orderMode,
            total: order.total,
            itemsCount: order.items?.length || 1,
            customerName: order.customer?.name || 'Customer',
            customerPhone: order.customer?.phone || '',
            tableNumber: order.customer?.tableNumber || '',
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
          },
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, latestOrder: null, serverTime: Date.now() },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('GET /api/notifications/latest-order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch latest order' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
