import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { canTransitionOrder } from '@/lib/orders/stateMachine';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { OrderModel } from '@/lib/db/models';

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
    const dbOrder = await OrderModel.findOne({ $or: [{ id }, { orderNumber: id }] }).lean();
    if (dbOrder) {
      const { _id, __v, ...clean } = dbOrder as any;
      return NextResponse.json({ success: true, order: clean }, { headers: NO_CACHE_HEADERS });
    }

    const order = dbStore.getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, actor = 'admin', note } = body;

    await connectToDatabase();
    let order: Order | null | undefined = (await OrderModel.findOne({ $or: [{ id }, { orderNumber: id }] }).lean()) as any;
    if (!order) {
      order = dbStore.getOrderById(id);
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'Please provide either status or paymentStatus to update' },
        { status: 400 }
      );
    }

    // Handle payment status update
    if (paymentStatus) {
      const validPayments: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
      if (!validPayments.includes(paymentStatus as PaymentStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid payment status' }, { status: 400 });
      }
      const updatedPayment = dbStore.updateOrderPayment(order.id, paymentStatus as PaymentStatus);
      if (updatedPayment) order = updatedPayment;
      await OrderModel.findOneAndUpdate({ id: order.id }, { $set: { paymentStatus } });
    }

    // Handle order lifecycle status transition
    if (status && order) {
      const transition = canTransitionOrder(order.status, status as OrderStatus, order.orderMode);
      if (!transition.allowed) {
        return NextResponse.json({ success: false, error: transition.reason }, { status: 400 });
      }

      const updatedStatus = dbStore.updateOrderStatus(order.id, status as OrderStatus, actor, note);
      if (updatedStatus) order = updatedStatus;
      await OrderModel.findOneAndUpdate({ id: order.id }, { $set: { status, updatedAt: new Date().toISOString() } });
    }

    return NextResponse.json({ success: true, order }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
