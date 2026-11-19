import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const orders = dbStore.getOrders();
    const reservations = dbStore.getReservations();
    const tables = dbStore.getTables();
    const menuItems = dbStore.getMenuItems();

    // Today's date in local YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const paidOrCompletedOrders = orders.filter(
      (o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED'
    );

    const totalRevenue = paidOrCompletedOrders.reduce((acc, o) => acc + o.total, 0);
    const todayRevenue = todayOrders
      .filter((o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED')
      .reduce((acc, o) => acc + o.total, 0);

    // Status counts
    const statusCounts: Record<string, number> = {};
    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }

    // Mode counts
    const modeCounts: Record<string, number> = {
      pickup: 0,
      delivery: 0,
      dine_in: 0,
    };
    for (const order of orders) {
      modeCounts[order.orderMode] = (modeCounts[order.orderMode] || 0) + 1;
    }

    // Bestseller calculations
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of paidOrCompletedOrders) {
      for (const item of order.items) {
        if (!itemSales[item.menuItemId]) {
          itemSales[item.menuItemId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemSales[item.menuItemId].quantity += item.quantity;
        itemSales[item.menuItemId].revenue += item.price * item.quantity;
      }
    }

    const topSelling = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Category distribution
    const categoryRevenue: Record<string, number> = {};
    for (const order of paidOrCompletedOrders) {
      for (const itm of order.items) {
        const menuItem = menuItems.find((m) => m.id === itm.menuItemId);
        const cat = menuItem?.category || 'other';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + itm.price * itm.quantity;
      }
    }

    const pendingReservations = reservations.filter((r) => r.status === 'PENDING').length;
    const occupiedTables = tables.filter((t) => t.status === 'occupied').length;

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        todayRevenue,
        totalOrdersCount: orders.length,
        todayOrdersCount: todayOrders.length,
        statusCounts,
        modeCounts,
        topSelling,
        categoryRevenue,
        pendingReservations,
        occupiedTables,
        totalTables: tables.length,
        recentOrders: orders.slice(0, 8),
      },
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to aggregate analytics' }, { status: 500 });
  }
}
