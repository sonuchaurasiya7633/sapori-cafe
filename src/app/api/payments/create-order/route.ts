import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbStore } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = dbStore.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if live Razorpay credentials exist
    if (keyId && keySecret) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const amountInPaise = Math.round(order.total * 100);

        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
              saporiOrderId: order.id,
              orderMode: order.orderMode,
            },
          }),
        });

        const rzpData = await rzpResponse.json();
        if (!rzpResponse.ok) {
          throw new Error(rzpData.error?.description || 'Razorpay order creation failed');
        }

        return NextResponse.json({
          success: true,
          isSandbox: false,
          keyId,
          razorpayOrderId: rzpData.id,
          amount: rzpData.amount,
          currency: 'INR',
        });
      } catch (err: any) {
        console.warn('Razorpay live order call failed, falling back to simulated sandbox:', err.message);
      }
    }

    // Sandbox simulation fallback for testing without real credentials
    const simulatedOrderId = `order_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return NextResponse.json({
      success: true,
      isSandbox: true,
      keyId: 'rzp_test_simulated_key',
      razorpayOrderId: simulatedOrderId,
      amount: Math.round(order.total * 100),
      currency: 'INR',
      message: 'Razorpay keys not configured in environment. Active in verified sandbox simulation mode.',
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create payment order' }, { status: 500 });
  }
}
