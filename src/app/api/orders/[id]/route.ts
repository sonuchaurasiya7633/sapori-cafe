import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { canTransitionOrder } from '@/lib/orders/stateMachine';
import { Order, OrderStatus, PaymentStatus } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
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

    let order: Order | null | undefined = dbStore.getOrderById(id);
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
    }

    // Handle order lifecycle status transition
    if (status && order) {
      const transition = canTransitionOrder(order.status, status as OrderStatus, order.orderMode);
      if (!transition.allowed) {
        return NextResponse.json({ success: false, error: transition.reason }, { status: 400 });
      }

      const updatedStatus = dbStore.updateOrderStatus(order.id, status as OrderStatus, actor, note);
      if (updatedStatus) order = updatedStatus;
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
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
    const deleted = dbStore.deleteOrder(id, 'admin');

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Order record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}
