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
  AlertCircle,
} from 'lucide-react';
import {
  playOrderChime,
  startOrderAlarm,
  stopOrderAlarm,
  unlockAudio,
  isAudioUnlocked,
} from '@/lib/notifications/sound';
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
  status: string;
  receivedAt: number;
}

export default function RealtimeNotificationBanner() {
  const [activeAlert, setActiveAlert] = useState<OrderAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [fcmRegistered, setFcmRegistered] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastAcknowledgedOrderIdRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);
  const activeAlertRef = useRef<OrderAlert | null>(null);

  // Keep ref synced for polling closure
  useEffect(() => {
    activeAlertRef.current = activeAlert;
  }, [activeAlert]);

  // 1. Audio Unlock & Interaction Handlers
  useEffect(() => {
    const checkAudio = () => {
      setAudioReady(isAudioUnlocked());
    };
    checkAudio();

    const handleFirstInteraction = async () => {
      const unlocked = await unlockAudio();
      setAudioReady(unlocked);
      if (unlocked) {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // 2. Check initial browser notification permission & auto-register FCM if granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = Notification.permission;
      setPushStatus(perm);

      if (perm === 'granted') {
        requestFcmToken('admin')
          .then((token) => {
            if (token) setFcmRegistered(true);
          })
          .catch(() => {});
      }
    }
  }, []);

  // 3. Dismiss Alarm when order is viewed or its status is updated anywhere in the app
  useEffect(() => {
    const handleDismissAlert = (e: any) => {
      const targetOrderId = e.detail?.orderId;
      const current = activeAlertRef.current;
      if (!targetOrderId || !current || targetOrderId === current.orderId) {
        stopOrderAlarm();
        setActiveAlert(null);
      }
    };

    window.addEventListener('sapori:order_viewed', handleDismissAlert);
    window.addEventListener('sapori:order_status_updated', handleDismissAlert);

    return () => {
      window.removeEventListener('sapori:order_viewed', handleDismissAlert);
      window.removeEventListener('sapori:order_status_updated', handleDismissAlert);
    };
  }, []);

  // 4. Central Handler for incoming order alert (from Polling, SSE, or FCM)
  const handleIncomingOrder = (data: any) => {
    const orderId = String(data.orderId || data.id || '');
    if (!orderId) return;

    // Deduplicate so we never trigger twice for the exact same order
    if (lastAcknowledgedOrderIdRef.current === orderId) {
      return;
    }
    lastAcknowledgedOrderIdRef.current = orderId;

    const alert: OrderAlert = {
      orderId,
      orderNumber: data.orderNumber || orderId.slice(-6),
      orderMode: data.orderMode || 'delivery',
      total: Number(data.total) || 0,
      itemsCount: Number(data.itemsCount) || 1,
      customerName: data.customerName || 'Customer',
      tableNumber: data.tableNumber,
      status: data.status || 'PLACED',
      receivedAt: Date.now(),
    };

    setActiveAlert(alert);

    // Continuous bold bell repeating alarm (rings every 3.2s until viewed or status updated)
    if (soundEnabled) {
      startOrderAlarm(0);
      setAudioReady(true);
    }

    // Rich Toast
    toast.success(`🔔 New Order #${alert.orderNumber} (₹${alert.total})`, {
      description: `${alert.orderMode.toUpperCase()} • ${alert.itemsCount} items from ${alert.customerName}${
        alert.tableNumber ? ` • Table ${alert.tableNumber}` : ''
      }`,
      duration: 15000,
    });

    // Native Browser Notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔔 New Order #${alert.orderNumber} (₹${alert.total})`, {
          body: `₹${alert.total} • ${alert.orderMode.toUpperCase()} • ${alert.customerName}`,
          icon: '/images/hero-mobile.jpg',
          requireInteraction: true,
        });
      } catch (err) {
        console.warn('Native notification display error:', err);
      }
    }

    // Broadcast DOM event so open tables/kitchen view refresh immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sapori:new_order', { detail: alert }));
    }
  };

  // 5. Ultra-reliable Polling Sync Engine (Every 3.2s)
  // Guarantees orders trigger alarm on Vercel even if Serverless SSE disconnects
  useEffect(() => {
    let isCancelled = false;

    const pollLatestOrder = async () => {
      try {
        const res = await fetch('/api/notifications/latest-order', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.latestOrder && !isCancelled) {
          const order = data.latestOrder;
          const currentAlert = activeAlertRef.current;

          // If current alert's status was changed on another screen (e.g. accepted in kitchen)
          if (currentAlert && (order.id === currentAlert.orderId || order.orderNumber === currentAlert.orderNumber)) {
            if (!['PLACED', 'PENDING_PAYMENT'].includes(order.status)) {
              stopOrderAlarm();
              setActiveAlert(null);
            }
          }

          // First mount: establish baseline without ringing for historical orders
          if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            lastAcknowledgedOrderIdRef.current = order.id;
            return;
          }

          // New order detected!
          if (order.id && order.id !== lastAcknowledgedOrderIdRef.current) {
            // Check if order was placed within last 10 minutes
            const orderTime = new Date(order.createdAt).getTime();
            const now = Date.now();
            if (now - orderTime < 10 * 60 * 1000) {
              handleIncomingOrder(order);
            } else {
              lastAcknowledgedOrderIdRef.current = order.id;
            }
          }
        } else if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
        }
      } catch (err) {
        // Silently retry on next poll cycle
      }
    };

    // Run first check immediately
    pollLatestOrder();
    const pollInterval = setInterval(pollLatestOrder, 3200);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
    };
  }, [soundEnabled]);

  // 6. Connect to Realtime Server-Sent Events (SSE) for 0ms accelerator
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
          setTimeout(connectSSE, 6000);
        };
      } catch (e) {
        console.warn('SSE connection error:', e);
      }
    };

    connectSSE();

    // Listen to Firebase Cloud Messaging (foreground push)
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

  const handleTestChime = async () => {
    await unlockAudio();
    setAudioReady(true);
    playOrderChime();
    toast.info('Bold service bell tested successfully!');
  };

  return (
    <>
      {/* Top Action Bar Utility for Notifications */}
      <div className="flex items-center gap-2">
        {/* Audio Autoplay Unlock Prompt if not yet interacted */}
        {!audioReady && (
          <button
            onClick={handleTestChime}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse shadow-sm cursor-pointer"
            title="Click once to test and unlock continuous order bell alarm"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tap to Enable Sound</span>
          </button>
        )}

        {/* Sound Chime Toggle */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) {
              unlockAudio().then(() => playOrderChime());
              setAudioReady(true);
            } else {
              stopOrderAlarm();
            }
            toast.info(next ? 'Order Alarm Unmuted' : 'Order Alarm Muted');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
            soundEnabled
              ? 'bg-[#15370D]/10 text-[#15370D] border-[#15370D]/20 hover:bg-[#15370D]/20'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
          title={soundEnabled ? 'Order alarm is active (Click to mute)' : 'Order alarm is muted (Click to unmute)'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'Alarm ON' : 'Alarm OFF'}</span>
        </button>

        {/* Push Notification Toggle Button */}
        {pushStatus !== 'granted' ? (
          <button
            onClick={enablePushNotifications}
            className="px-3 py-1.5 bg-[#DEB853] hover:bg-[#c9a444] text-[#071c05] font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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

      {/* Floating Animated New Order Banner with Continuous Ringing Indicator */}
      {activeAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-gradient-to-r from-[#15370D] via-[#1a4411] to-[#071c05] text-[#F5EFE1] p-4 rounded-2xl shadow-2xl border-2 border-[#DEB853] animate-in fade-in slide-in-from-top-6 duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DEB853]/20 border border-[#DEB853]/40 flex items-center justify-center shrink-0 relative">
                <BellRing className="w-6 h-6 text-[#DEB853] animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#DEB853] text-[#071c05]">
                    {activeAlert.orderMode.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-amber-200 font-mono font-bold">
                    Order #{activeAlert.orderNumber}
                  </span>
                  {activeAlert.tableNumber && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                      Table {activeAlert.tableNumber}
                    </span>
                  )}
                  <span className="text-[10px] bg-red-600/90 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                    ALARM RINGING
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">
                  ₹{activeAlert.total.toFixed(2)} • {activeAlert.customerName}
                </h4>
                <p className="text-xs text-stone-300">
                  {activeAlert.itemsCount} {activeAlert.itemsCount === 1 ? 'item' : 'items'} • Awaiting View or Status Update
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopOrderAlarm();
                  toast.info('Order alarm silenced');
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md"
                title="Silence Repeating Alarm"
              >
                <VolumeX className="w-4 h-4" />
                <span>Silence</span>
              </button>

              <Link
                href="/admin/orders"
                onClick={() => {
                  stopOrderAlarm();
                  setActiveAlert(null);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('sapori:order_viewed', { detail: { orderId: activeAlert.orderId } })
                    );
                  }
                }}
                className="px-3.5 py-2 bg-[#DEB853] hover:bg-[#c9a444] text-[#071c05] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all shrink-0 animate-pulse"
              >
                <span>View Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  stopOrderAlarm();
                  setActiveAlert(null);
                }}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
