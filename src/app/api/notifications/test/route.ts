import { NextRequest, NextResponse } from 'next/server';
import { dispatchOrderNotification } from '@/lib/firebase/admin';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const testOrder: Order = {
      id: `test-ord-${Date.now()}`,
      orderNumber: `SAP-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderMode: 'dine_in',
      items: [
        {
          id: 'item-1',
          menuItemId: 'pizza-margherita',
          slug: 'margherita-pizza',
          name: 'Classic Margherita Pizza',
          price: 349,
          quantity: 1,
          selectedAddOns: [],
        },
        {
          id: 'item-2',
          menuItemId: 'cold-brew',
          slug: 'specialty-cold-brew',
          name: 'Signature Arabica Cold Brew',
          price: 189,
          quantity: 2,
          selectedAddOns: [],
        },
      ],
      subtotal: 727,
      tax: 36.35,
      packagingFee: 0,
      deliveryFee: 0,
      discount: 0,
      total: 763.35,
      status: 'PLACED',
      paymentStatus: 'PAID',
      paymentMethod: 'razorpay',
      customer: {
        name: 'Test Customer (Live Alert)',
        phone: '+91 98765 43210',
        tableNumber: '04',
      },
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: now.toISOString(),
          actor: 'customer',
          note: 'Live test notification trigger',
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const result = await dispatchOrderNotification(testOrder);

    return NextResponse.json({
      success: true,
      message: 'Test order notification dispatched!',
      order: testOrder,
      deliveryStats: result,
    });
  } catch (error: any) {
    console.error('Test notification trigger error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch test notification' },
      { status: 500 }
    );
  }
}
