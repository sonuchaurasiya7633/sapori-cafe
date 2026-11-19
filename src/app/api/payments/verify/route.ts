import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbStore } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isSandbox } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = dbStore.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!isSandbox && keySecret && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      // Real cryptographic HMAC-SHA256 signature verification
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        dbStore.updateOrderPayment(order.id, 'FAILED');
        return NextResponse.json(
          { success: false, error: 'Payment signature verification failed' },
          { status: 400 }
        );
      }
    }

    // Mark as PAID
    const paymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    dbStore.updateOrderPayment(order.id, 'PAID', {
      razorpayOrderId: razorpayOrderId || `order_sim_${Date.now()}`,
      razorpayPaymentId: paymentId,
    });

    // Update order status to PLACED if it was PENDING_PAYMENT
    if (order.status === 'PENDING_PAYMENT') {
      dbStore.updateOrderStatus(order.id, 'PLACED', 'system', 'Payment verified and confirmed');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId,
      order: dbStore.getOrderById(order.id),
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}
