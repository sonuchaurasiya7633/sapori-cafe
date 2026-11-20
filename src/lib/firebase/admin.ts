import { getApps, initializeApp, cert, getApp, App } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { getDatabase } from 'firebase-admin/database';
import { EventEmitter } from 'events';
import { SiteSettingsModel, NotificationTokenModel } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/types';

// In-memory Realtime Event Bus for zero-delay SSE streaming to active Admin & Kitchen tabs
class OrderEventBus extends EventEmitter {}
export const orderNotificationBus = new OrderEventBus();
orderNotificationBus.setMaxListeners(100);

let isInitializing = false;

export async function getFirebaseAdmin(): Promise<App | null> {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  if (isInitializing) return null;
  isInitializing = true;

  try {
    // 1. Try environment variables first
    let projectId = process.env.FIREBASE_PROJECT_ID;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    let databaseURL = process.env.FIREBASE_DATABASE_URL;

    // 2. Fallback to MongoDB SiteSettings
    if (!projectId || !clientEmail || !privateKey) {
      try {
        await connectToDatabase();
        const settings = await SiteSettingsModel.findOne().lean();
        if (settings?.firebaseProjectId && settings?.firebaseClientEmail && settings?.firebasePrivateKey) {
          projectId = settings.firebaseProjectId;
          clientEmail = settings.firebaseClientEmail;
          privateKey = settings.firebasePrivateKey.replace(/\\n/g, '\n');
          databaseURL = settings.firebaseDatabaseUrl || databaseURL;
        }
      } catch (err) {
        console.warn('Could not read firebase credentials from MongoDB:', err);
      }
    }

    if (!projectId || !clientEmail || !privateKey) {
      // Firebase not configured yet
      isInitializing = false;
      return null;
    }

    const options: any = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    };

    if (databaseURL && !databaseURL.includes('default-rtdb.firebaseio.com')) {
      options.databaseURL = databaseURL;
    }

    const app = initializeApp(options);

    isInitializing = false;
    return app;
  } catch (error) {
    console.error('Firebase Admin init error:', error);
    isInitializing = false;
    return null;
  }
}

export interface RealtimeOrderPayload {
  orderId: string;
  orderNumber: string;
  orderMode: string;
  total: number;
  itemsCount: number;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export async function dispatchOrderNotification(order: Order): Promise<{
  sseBroadcast: boolean;
  fcmSent: boolean;
  rtdbWritten: boolean;
  tokensCount: number;
}> {
  const payload: RealtimeOrderPayload = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderMode: order.orderMode,
    total: order.total,
    itemsCount: order.items.length,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    tableNumber: order.customer.tableNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  };

  // 1. Instant local/SSE bus broadcast to all open admin/kitchen browsers
  orderNotificationBus.emit('new_order', payload);
  let fcmSent = false;
  let rtdbWritten = false;
  let tokensCount = 0;

  try {
    const fbApp = await getFirebaseAdmin();
    if (!fbApp) {
      return { sseBroadcast: true, fcmSent: false, rtdbWritten: false, tokensCount: 0 };
    }

    // 2. Write to Firebase Realtime Database if an active databaseURL is configured
    if (fbApp.options.databaseURL) {
      try {
        const db = getDatabase(fbApp);
        await Promise.race([
          db.ref(`live_orders/${order.id}`).set({
            ...payload,
            timestamp: Date.now(),
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('RTDB timeout')), 1500)),
        ]);
        rtdbWritten = true;
      } catch (rtdbErr) {
        // Non-blocking warning
      }
    }

    // 3. Send Push Notifications via Firebase Cloud Messaging (FCM)
    try {
      const messaging = getMessaging(fbApp);

      const notificationTitle = `🔔 New Order #${order.orderNumber} (₹${order.total})`;
      const notificationBody = `${order.orderMode.toUpperCase()} • ${order.items.length} items • ${order.customer.name}${
        order.customer.tableNumber ? ` (Table ${order.customer.tableNumber})` : ''
      }`;

      // A) Send to topic 'admin_orders'
      try {
        await messaging.send({
          topic: 'admin_orders',
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: String(order.total),
            orderMode: order.orderMode,
            customerName: order.customer.name,
            url: '/admin/orders',
          },
          webpush: {
            fcmOptions: {
              link: '/admin/orders',
            },
            notification: {
              icon: '/images/hero-mobile.jpg',
              badge: '/images/hero-mobile.jpg',
              requireInteraction: true,
            },
          },
        });
        fcmSent = true;
      } catch (topicErr) {
        console.warn('FCM topic send warning:', topicErr);
      }

      // B) Send direct multicast to individual device tokens stored in MongoDB
      try {
        await connectToDatabase();
        const tokenDocs = await NotificationTokenModel.find({}).lean();
        const tokens = tokenDocs.map((t: any) => t.token).filter(Boolean);
        tokensCount = tokens.length;

        if (tokens.length > 0) {
          const response = await messaging.sendEachForMulticast({
            tokens,
            notification: {
              title: notificationTitle,
              body: notificationBody,
            },
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              total: String(order.total),
              orderMode: order.orderMode,
              customerName: order.customer.name,
              url: '/admin/orders',
            },
          });
          if (response.successCount > 0) fcmSent = true;

          // Cleanup stale / invalid tokens
          if (response.failureCount > 0) {
            const staleTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (
                !resp.success &&
                resp.error &&
                ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(
                  resp.error.code
                )
              ) {
                staleTokens.push(tokens[idx]);
              }
            });
            if (staleTokens.length > 0) {
              await NotificationTokenModel.deleteMany({ token: { $in: staleTokens } });
            }
          }
        }
      } catch (deviceErr) {
        console.warn('FCM device tokens send warning:', deviceErr);
      }
    } catch (fcmErr) {
      console.warn('FCM messaging warning:', fcmErr);
    }

    return { sseBroadcast: true, fcmSent, rtdbWritten, tokensCount };
  } catch (err) {
    console.error('dispatchOrderNotification error:', err);
    return { sseBroadcast: true, fcmSent: false, rtdbWritten: false, tokensCount: 0 };
  }
}
