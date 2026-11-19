import { describe, it, expect, vi } from 'vitest';
import { orderNotificationBus, dispatchOrderNotification } from '@/lib/firebase/admin';
import { POST as registerFcmToken, GET as getFcmStatus } from '@/app/api/notifications/fcm-token/route';
import { POST as triggerTestNotification } from '@/app/api/notifications/test/route';
import { NextRequest } from 'next/server';

describe('Realtime Order Notifications & Firebase System', () => {
  it('dispatches realtime order event on event bus to all connected clients', async () => {
    let capturedPayload: any = null;

    const testListener = (payload: any) => {
      capturedPayload = payload;
    };

    orderNotificationBus.once('new_order', testListener);

    const testOrder: any = {
      id: `ord-test-${Date.now()}`,
      orderNumber: 'SAP-2603-TEST',
      orderMode: 'dine_in',
      items: [{ name: 'Truffle Mushroom Pizza', price: 449, quantity: 1 }],
      total: 449,
      status: 'PLACED',
      paymentMethod: 'cash_counter',
      paymentStatus: 'PAID',
      customer: {
        name: 'Sonu Chaurasiya',
        phone: '+91 63673 73302',
        tableNumber: '02',
      },
      createdAt: new Date().toISOString(),
    };

    const dispatchResult = await dispatchOrderNotification(testOrder);
    expect(dispatchResult.sseBroadcast).toBe(true);
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload.orderNumber).toBe('SAP-2603-TEST');
    expect(capturedPayload.total).toBe(449);
    expect(capturedPayload.customerName).toBe('Sonu Chaurasiya');
    expect(capturedPayload.tableNumber).toBe('02');
  });

  it('registers device FCM push notification token', async () => {
    const fakeToken = `fcm_test_token_${Date.now()}_abc123`;
    const req = new NextRequest('http://localhost:3000/api/notifications/fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: fakeToken,
        role: 'admin',
        device: 'Admin Desktop Chrome',
      }),
    });

    const res = await registerFcmToken(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify GET status
    const statusRes = await getFcmStatus();
    const statusJson = await statusRes.json();
    expect(statusRes.status).toBe(200);
    expect(statusJson.success).toBe(true);
    expect(statusJson.registeredDevices).toBeGreaterThanOrEqual(1);
  });

  it('triggers test notification endpoint successfully', async () => {
    const req = new NextRequest('http://localhost:3000/api/notifications/test', {
      method: 'POST',
    });

    const res = await triggerTestNotification(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.order).toBeDefined();
    expect(json.order.orderNumber).toContain('SAP-');
    expect(json.deliveryStats.sseBroadcast).toBe(true);
  });
});
