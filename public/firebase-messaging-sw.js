// Firebase Cloud Messaging Service Worker for SAPORI CAFE
// Receives background push notifications when browser or screen is minimized

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBy5RrpQUKx3uyTgGgAgeFl3MG7xMYF7Tg",
  authDomain: "sapori-cafe.firebaseapp.com",
  projectId: "sapori-cafe",
  storageBucket: "sapori-cafe.firebasestorage.app",
  messagingSenderId: "254068889011",
  appId: "1:254068889011:web:0e549d20b4d8c6c1a3e7c6",
  measurementId: "G-2WCQJ9F8QG"
};

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function (payload) {
    const notification = payload.notification || {};
    const payloadData = payload.data || {};

    const title = notification.title || payloadData.title || '🔔 New Order Received - SAPORI CAFE';
    const body = notification.body || payloadData.body || 'A customer has placed a new order.';

    const options = {
      body: body,
      icon: '/images/hero-mobile.jpg',
      badge: '/images/hero-mobile.jpg',
      vibrate: [300, 150, 300, 150, 600],
      tag: payloadData.orderId || `order-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      data: {
        url: payloadData.url || '/admin/orders',
        orderId: payloadData.orderId,
      },
      actions: [
        { action: 'view_order', title: '👀 View Order' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn('Firebase Messaging SW init error:', err);
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const notification = data.notification || {};
      const payloadData = data.data || {};

      const title = notification.title || payloadData.title || '🔔 New Order Received - SAPORI CAFE';
      const body = notification.body || payloadData.body || 'A customer has placed a new order.';

      const options = {
        body: body,
        icon: '/images/hero-mobile.jpg',
        badge: '/images/hero-mobile.jpg',
        vibrate: [300, 150, 300, 150, 600],
        tag: payloadData.orderId || `order-${Date.now()}`,
        renotify: true,
        requireInteraction: true,
        data: {
          url: payloadData.url || '/admin/orders',
          orderId: payloadData.orderId,
        },
        actions: [
          { action: 'view_order', title: '👀 View Order' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.warn('Push event error:', err);
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/admin/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
