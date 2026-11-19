import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { OrderModel } from '@/lib/db/models';
import { dispatchOrderNotification } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isSandbox } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    let order = await OrderModel.findOne({ $or: [{ id: orderId }, { orderNumber: orderId }] });
    if (!order) {
      const storeOrder = dbStore.getOrderById(orderId);
      if (storeOrder) {
        order = await OrderModel.create(storeOrder);
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    // In production or whenever Razorpay credentials are set, cryptographic signature is strictly mandatory
    if (keySecret || isProduction) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
          { success: false, error: 'Payment verification parameters missing' },
          { status: 400 }
        );
      }

      if (keySecret) {
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        // Timing-safe comparison to prevent side-channel timing attacks
        const signatureBuf = Buffer.from(razorpaySignature);
        const expectedBuf = Buffer.from(expectedSignature);

        if (
          signatureBuf.length !== expectedBuf.length ||
          !crypto.timingSafeEqual(signatureBuf, expectedBuf)
        ) {
          await OrderModel.findOneAndUpdate({ id: order.id }, { $set: { paymentStatus: 'FAILED' } });
          dbStore.updateOrderPayment(order.id, 'FAILED');
          return NextResponse.json(
            { success: false, error: 'Cryptographic payment signature verification failed' },
            { status: 400 }
          );
        }
      }
    }

    // Mark as PAID
    const paymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const updatedDoc = await OrderModel.findOneAndUpdate(
      { id: order.id },
      {
        $set: {
          paymentStatus: 'PAID',
          status: order.status === 'PENDING_PAYMENT' ? 'PLACED' : order.status,
          'paymentDetails.razorpayOrderId': razorpayOrderId || `order_sim_${Date.now()}`,
          'paymentDetails.razorpayPaymentId': paymentId,
          'paymentDetails.paidAt': nowIso,
          updatedAt: nowIso,
        },
      },
      { new: true }
    ).lean();

    dbStore.updateOrderPayment(order.id, 'PAID', {
      razorpayOrderId: razorpayOrderId || `order_sim_${Date.now()}`,
      razorpayPaymentId: paymentId,
    });

    if (order.status === 'PENDING_PAYMENT') {
      dbStore.updateOrderStatus(order.id, 'PLACED', 'system', 'Payment verified and confirmed');
    }

    const cleanOrder = updatedDoc
      ? (({ _id, __v, ...rest }: any) => rest)(updatedDoc)
      : dbStore.getOrderById(order.id);

    // Trigger Realtime Notification on confirmed payment
    if (cleanOrder) {
      dispatchOrderNotification(cleanOrder).catch((err) => {
        console.warn('Realtime payment notification warning:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      paymentId,
      order: cleanOrder,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
