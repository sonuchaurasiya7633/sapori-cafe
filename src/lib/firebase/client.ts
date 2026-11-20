'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

let clientApp: FirebaseApp | null = null;
let clientMessaging: Messaging | null = null;

const DEFAULT_FIREBASE_CLIENT_CONFIG = {
  apiKey: 'AIzaSyBy5RrpQUKx3uyTgGgAgeFl3MG7xMYF7Tg',
  authDomain: 'sapori-cafe.firebaseapp.com',
  projectId: 'sapori-cafe',
  storageBucket: 'sapori-cafe.firebasestorage.app',
  messagingSenderId: '254068889011',
  appId: '1:254068889011:web:0e549d20b4d8c6c1a3e7c6',
  measurementId: 'G-2WCQJ9F8QG',
};

const DEFAULT_VAPID_KEY = 'BM6PRNvtndGk7RmuOwtN5KGkv2tm4THUaagGHuet0-I1zbH0woVnkvk2Kack4WLgeKwmu0Ysw6o7tUpG8sK4lE4';

export function getFirebaseClientConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CLIENT_CONFIG.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CLIENT_CONFIG.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CLIENT_CONFIG.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CLIENT_CONFIG.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CLIENT_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CLIENT_CONFIG.appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CLIENT_CONFIG.measurementId,
  };
}

export function initFirebaseClient(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;

  const config = getFirebaseClientConfig();
  if (!config.apiKey || !config.projectId) {
    return null;
  }

  if (getApps().length > 0) {
    clientApp = getApp();
    return clientApp;
  }

  try {
    clientApp = initializeApp(config);
    return clientApp;
  } catch (error) {
    console.warn('Firebase client init error:', error);
    return null;
  }
}

export function getClientMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (clientMessaging) return clientMessaging;

  const app = initFirebaseClient();
  if (!app) return null;

  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      clientMessaging = getMessaging(app);
      return clientMessaging;
    }
  } catch (error) {
    console.warn('Firebase Messaging init error:', error);
  }
  return null;
}

/**
 * Requests browser notification permission, registers service worker, and gets FCM registration token.
 */
export async function requestFcmToken(role = 'admin'): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    const messaging = getClientMessaging();
    if (!messaging) {
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const vapidKey =
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || DEFAULT_VAPID_KEY;

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: vapidKey || undefined,
    });

    if (token) {
      // Send token to our server
      await fetch('/api/notifications/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          role,
          device: navigator.userAgent,
        }),
      });
      return token;
    }
  } catch (error) {
    console.warn('FCM token registration error:', error);
  }
  return null;
}

/**
 * Listens for incoming push messages while the tab is open (foreground).
 */
export function onFcmForegroundMessage(callback: (payload: any) => void): (() => void) | null {
  const messaging = getClientMessaging();
  if (!messaging) return null;

  try {
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (error) {
    console.warn('FCM onMessage listener error:', error);
    return null;
  }
}
