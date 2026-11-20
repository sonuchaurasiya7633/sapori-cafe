import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { calculateOrderTotals } from '@/lib/orders/calculator';
import { CartItem, Order, OrderMode, OrderStatus, PaymentMethod, PaymentStatus } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { OrderModel } from '@/lib/db/models';
import { dispatchOrderNotification } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = (searchParams.get('status') as OrderStatus) || undefined;
    const mode = searchParams.get('mode') || undefined;

    await connectToDatabase();
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (mode) query.orderMode = mode;

    const dbOrders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    if (dbOrders) {
      const cleanOrders = dbOrders.map(({ _id, __v, ...rest }: any) => rest);
      return NextResponse.json({ success: true, count: cleanOrders.length, orders: cleanOrders }, { headers: NO_CACHE_HEADERS });
    }

    const orders = dbStore.getOrders({ status, mode });
    return NextResponse.json({ success: true, count: orders.length, orders }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const orders = dbStore.getOrders();
    return NextResponse.json({ success: true, count: orders.length, orders }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      orderMode,
      customer,
      paymentMethod,
      couponCode,
      notes,
      source = 'customer',
      status: requestedStatus,
      paymentStatus: requestedPaymentStatus,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (!orderMode || !['pickup', 'delivery', 'dine_in'].includes(orderMode)) {
      return NextResponse.json({ success: false, error: 'Valid order mode is required' }, { status: 400 });
    }

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ success: false, error: 'Customer name and phone number are required' }, { status: 400 });
    }

    if (orderMode === 'delivery' && !customer?.address) {
      return NextResponse.json({ success: false, error: 'Delivery address is required for doorstep orders' }, { status: 400 });
    }

    if (orderMode === 'dine_in' && !customer?.tableNumber) {
      return NextResponse.json({ success: false, error: 'Table number is required for dine-in orders' }, { status: 400 });
    }

    const settings = dbStore.getSettings();

    // Enforce Store Operational Settings
    if (settings.isKitchenAcceptingOrders === false && source !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Our kitchen is temporarily paused for online orders. Please call or WhatsApp us at ' +
            settings.contactPhone,
        },
        { status: 403 }
      );
    }

    if (orderMode === 'delivery' && settings.deliveryActive === false && source !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Doorstep home delivery is currently paused in store settings.' },
        { status: 400 }
      );
    }
    if (orderMode === 'pickup' && settings.pickupActive === false && source !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Counter pickup is currently paused in store settings.' },
        { status: 400 }
      );
    }
    if (orderMode === 'dine_in' && settings.dineInActive === false && source !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'QR Table ordering is currently paused in store settings.' },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE VALIDATION:
    // Strictly reconstruct cart items using database-verified prices
    const verifiedItems: CartItem[] = [];
    for (const rawItem of items) {
      const dbItem = dbStore.getMenuItemById(rawItem.menuItemId);
      if (!dbItem) {
        return NextResponse.json(
          { success: false, error: `Item "${rawItem.name || 'Unknown'}" is not recognized in our menu.` },
          { status: 400 }
        );
      }

      if (!dbItem.isAvailable) {
        return NextResponse.json(
          { success: false, error: `"${dbItem.name}" is currently unavailable in the kitchen.` },
          { status: 400 }
        );
      }

      // Verify add-ons
      const verifiedAddOns = (rawItem.selectedAddOns || []).map((addon: any) => {
        const official = (dbItem.addOns || []).find((a) => a.id === addon.id);
        return {
          id: addon.id,
          name: official ? official.name : addon.name,
          price: official ? official.price : 0,
        };
      });

      const qty = Math.max(1, Math.min(50, Math.floor(rawItem.quantity || 1)));

      verifiedItems.push({
        id: rawItem.id || `${dbItem.id}-${Date.now()}`,
        menuItemId: dbItem.id,
        slug: dbItem.slug,
        name: dbItem.name,
        price: dbItem.price, // STRICT DB BASE PRICE
        quantity: qty,
        selectedAddOns: verifiedAddOns,
        notes: rawItem.notes?.slice(0, 200),
        image: dbItem.image,
      });
    }

    // Validate coupon server-side
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = dbStore.getCouponByCode(couponCode) || null;
    }

    // Recalculate full order amounts strictly on server
    const financials = calculateOrderTotals(
      verifiedItems,
      orderMode as OrderMode,
      settings,
      appliedCoupon
    );

    const now = new Date();
    const orderNumber = `SAP-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus: OrderStatus =
      source === 'admin' && requestedStatus
        ? (requestedStatus as OrderStatus)
        : paymentMethod === 'razorpay'
        ? 'PENDING_PAYMENT'
        : 'PLACED';

    const initialPaymentStatus: PaymentStatus =
      source === 'admin' && requestedPaymentStatus
        ? (requestedPaymentStatus as PaymentStatus)
        : 'PENDING';

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderNumber,
      orderMode: orderMode as OrderMode,
      items: verifiedItems,
      subtotal: financials.subtotal,
      tax: financials.tax,
      packagingFee: financials.packagingFee,
      deliveryFee: financials.deliveryFee,
      discount: financials.discount,
      total: financials.total,
      couponCode: appliedCoupon?.code,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      paymentMethod: (paymentMethod as PaymentMethod) || 'cash_counter',
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim(),
        address: customer.address?.trim(),
        deliveryNotes: customer.deliveryNotes?.trim(),
        tableNumber: customer.tableNumber?.trim(),
      },
      notes: notes?.slice(0, 300),
      statusHistory: [
        {
          status: initialStatus,
          timestamp: now.toISOString(),
          actor: source === 'admin' ? 'admin' : 'customer',
          note:
            source === 'admin'
              ? 'Walk-in / Counter order created by staff'
              : initialStatus === 'PLACED'
              ? 'Order placed and confirmed'
              : 'Awaiting payment verification',
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (
      orderMode === 'dine_in' &&
      customer.tableNumber &&
      ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_TO_SERVE'].includes(initialStatus)
    ) {
      dbStore.updateTableStatus(customer.tableNumber.trim(), 'occupied');
    }

    await connectToDatabase();
    await OrderModel.findOneAndUpdate({ id: newOrder.id }, newOrder, { upsert: true, new: true });
    const saved = dbStore.createOrder(newOrder);

    // If dine-in, update table status
    if (orderMode === 'dine_in' && customer.tableNumber) {
      dbStore.updateTableStatus(customer.tableNumber, 'occupied', saved.id);
    }

    // Trigger Realtime Notification (Firebase FCM + SSE + Push) on every new order
    dispatchOrderNotification(saved).catch((err) => {
      console.warn('Realtime order notification warning:', err);
    });

    return NextResponse.json({ success: true, order: saved }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process order' }, { status: 500 });
  }
}
