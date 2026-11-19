'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { playOrderChime } from '@/lib/notifications/sound';
import { requestFcmToken, onFcmForegroundMessage } from '@/lib/firebase/client';
import { toast } from '@/lib/toast';

interface OrderAlert {
  orderId: string;
  orderNumber: string;
  orderMode: string;
  total: number;
  itemsCount: number;
  customerName: string;
  tableNumber?: string;
  receivedAt: number;
}

export default function RealtimeNotificationBanner() {
  const [activeAlert, setActiveAlert] = useState<OrderAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [fcmRegistered, setFcmRegistered] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check initial browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  // Handle incoming order notification (from either SSE or FCM)
  const handleIncomingOrder = (data: any) => {
    const alert: OrderAlert = {
      orderId: data.orderId || data.id,
      orderNumber: data.orderNumber,
      orderMode: data.orderMode,
      total: Number(data.total) || 0,
      itemsCount: Number(data.itemsCount) || 1,
      customerName: data.customerName || 'Customer',
      tableNumber: data.tableNumber,
      receivedAt: Date.now(),
    };

    setActiveAlert(alert);

    // Play pleasant audio chime
    if (soundEnabled) {
      playOrderChime();
    }

    // Rich Toast
    toast.success(`🔔 New Order #${alert.orderNumber} (₹${alert.total})`, {
      description: `${alert.orderMode.toUpperCase()} • ${alert.itemsCount} items from ${alert.customerName}${
        alert.tableNumber ? ` • Table ${alert.tableNumber}` : ''
      }`,
      duration: 8000,
    });

    // Native Browser Notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔔 New Order #${alert.orderNumber}`, {
          body: `₹${alert.total} • ${alert.orderMode.toUpperCase()} • ${alert.customerName}`,
          icon: '/images/hero-mobile.jpg',
        });
      } catch (err) {
        console.warn('Native notification display error:', err);
      }
    }
  };

  // Connect to Realtime Server-Sent Events (SSE)
  useEffect(() => {
    const connectSSE = () => {
      try {
        const es = new EventSource('/api/notifications/stream');
        eventSourceRef.current = es;

        es.addEventListener('new_order', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            handleIncomingOrder(parsed);
          } catch (err) {
            console.warn('Failed to parse SSE order event:', err);
          }
        });

        es.onerror = () => {
          es.close();
          // Auto reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (e) {
        console.warn('SSE connection error:', e);
      }
    };

    connectSSE();

    // Listen to Firebase Cloud Messaging (foreground)
    const unsubscribeFcm = onFcmForegroundMessage((payload) => {
      const data = payload.data || payload.notification;
      if (data) {
        handleIncomingOrder(data);
      }
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (unsubscribeFcm) {
        unsubscribeFcm();
      }
    };
  }, [soundEnabled]);

  // Request Push Permission & Register Token
  const enablePushNotifications = async () => {
    try {
      const token = await requestFcmToken('admin');
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPushStatus(Notification.permission);
      }
      if (token) {
        setFcmRegistered(true);
        toast.success('Real-time push notifications activated!');
      } else if (Notification.permission === 'granted') {
        toast.success('Browser notifications enabled!');
      } else {
        toast.error('Notification permission was not granted.');
      }
    } catch (err) {
      toast.error('Failed to enable push notifications');
    }
  };

  return (
    <>
      {/* Top Action Bar Utility for Notifications */}
      <div className="flex items-center gap-2">
        {/* Sound Chime Toggle */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playOrderChime();
            toast.info(next ? 'Order Chime Unmuted' : 'Order Chime Muted');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            soundEnabled
              ? 'bg-[#15370D]/10 text-[#15370D] border-[#15370D]/20 hover:bg-[#15370D]/20'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
          title={soundEnabled ? 'Order sound is active (Click to mute)' : 'Order sound is muted (Click to unmute)'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'Chime ON' : 'Chime OFF'}</span>
        </button>

        {/* Push Notification Toggle Button */}
        {pushStatus !== 'granted' ? (
          <button
            onClick={enablePushNotifications}
            className="px-3 py-1.5 bg-[#DEB853] hover:bg-[#c9a444] text-[#071c05] font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            title="Enable Instant Push Notifications on New Orders"
          >
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>Enable Push Alerts</span>
          </button>
        ) : (
          <span
            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg flex items-center gap-1.5 font-medium"
            title="Push Notifications Active"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Push Active</span>
          </span>
        )}
      </div>

      {/* Floating Animated New Order Banner */}
      {activeAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-gradient-to-r from-[#15370D] via-[#1a4411] to-[#071c05] text-[#F5EFE1] p-4 rounded-2xl shadow-2xl border-2 border-[#DEB853] animate-in fade-in slide-in-from-top-6 duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DEB853]/20 border border-[#DEB853]/40 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-[#DEB853] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#DEB853] text-[#071c05]">
                    {activeAlert.orderMode.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-amber-200 font-mono">
                    Order #{activeAlert.orderNumber}
                  </span>
                  {activeAlert.tableNumber && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                      Table {activeAlert.tableNumber}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">
                  ₹{activeAlert.total.toFixed(2)} • {activeAlert.customerName}
                </h4>
                <p className="text-xs text-stone-300">
                  {activeAlert.itemsCount} {activeAlert.itemsCount === 1 ? 'item' : 'items'} • Just now
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/orders"
                onClick={() => setActiveAlert(null)}
                className="px-3.5 py-2 bg-[#DEB853] hover:bg-[#c9a444] text-[#071c05] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all shrink-0"
              >
                <span>View Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setActiveAlert(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
