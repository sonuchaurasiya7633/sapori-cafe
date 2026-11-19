'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Check, Clock, Phone, MessageSquare, ArrowLeft, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { getStatusBadgeInfo } from '@/lib/orders/stateMachine';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.order) setOrder(data.order);
    } catch (err) {
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-[#F5EFE1] min-h-screen py-20 text-center text-[#15370D] font-bold">
        Connecting to Kitchen Dispatch System...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#F5EFE1] min-h-screen py-20 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-[#15370D]">Order Not Found</h2>
        <Link
          href="/menu"
          className="inline-block bg-[#15370D] text-[#FFFFFF] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeInfo(order.status);

  const getTimelineSteps = () => {
    const readyLabel =
      order.orderMode === 'pickup'
        ? 'Ready for Counter Pickup'
        : order.orderMode === 'dine_in'
        ? 'Serving to Table'
        : 'Out for Delivery';

    const readyStatus: OrderStatus =
      order.orderMode === 'pickup'
        ? 'READY_FOR_PICKUP'
        : order.orderMode === 'dine_in'
        ? 'READY_TO_SERVE'
        : 'OUT_FOR_DELIVERY';

    return [
      { key: 'PLACED', label: 'Order Placed', desc: 'Received & Queued' },
      { key: 'ACCEPTED', label: 'Accepted', desc: 'Kitchen Confirmed' },
      { key: 'PREPARING', label: 'In the Oven & Bar', desc: 'Baking & Brewing' },
      { key: readyStatus, label: readyLabel, desc: 'Hot & Packaged' },
      { key: 'COMPLETED', label: 'Delivered / Enjoyed', desc: 'Buon Appetito!' },
    ];
  };

  const steps = getTimelineSteps();

  const getStepState = (stepKey: string): 'completed' | 'current' | 'upcoming' => {
    const stepOrder = ['PLACED', 'ACCEPTED', 'PREPARING', steps[3].key, 'COMPLETED'];
    const currentIndex = stepOrder.indexOf(order.status);
    const targetIndex = stepOrder.indexOf(stepKey);

    if (order.status === 'COMPLETED') return 'completed';
    if (targetIndex < currentIndex) return 'completed';
    if (targetIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline py-1"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Menu</span>
          </Link>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrder();
            }}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] border border-[#15370D]/20 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F5EFE1] transition-colors min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Live Status Hero */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#15370D]/10 pb-4 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/60 block">
                Live Kitchen Tracker
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#15370D]">
                Order {order.orderNumber}
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/60 block">
                Estimated Time
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#15370D] flex items-center sm:justify-end">
                <Clock className="w-4 h-4 mr-1 text-[#15370D]" />
                15 – 25 Minutes
              </span>
            </div>
          </div>

          {/* Current Status Banner */}
          <div className="bg-[#F5EFE1] border border-[#15370D]/15 rounded-xl p-4 sm:p-5 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
              Current Kitchen State
            </span>
            <div className="text-lg sm:text-xl font-black text-[#15370D] uppercase tracking-wide">
              {badge.label}
            </div>
            <p className="text-xs text-[#15370D]/80 leading-relaxed">{badge.description}</p>
          </div>

          {/* Visual Step Progress */}
          <div className="space-y-6 pt-2">
            <div className="relative">
              {steps.map((step, idx) => {
                const state = getStepState(step.key);
                const isLast = idx === steps.length - 1;

                return (
                  <div key={step.key} className="relative flex items-start space-x-3.5 sm:space-x-4 pb-7 last:pb-0">
                    {!isLast && (
                      <div
                        className={`absolute left-3.5 sm:left-4 top-8 -bottom-1 w-0.5 ${
                          state === 'completed' ? 'bg-[#15370D]' : 'bg-[#15370D]/20'
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors flex-shrink-0 ${
                        state === 'completed'
                          ? 'bg-[#15370D] text-[#FFFFFF]'
                          : state === 'current'
                          ? 'bg-[#FFFFFF] border-2 border-[#15370D] text-[#15370D] animate-pulse'
                          : 'bg-[#F5EFE1] border border-[#15370D]/30 text-[#15370D]/50'
                      }`}
                    >
                      {state === 'completed' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="pt-0.5 flex-1">
                      <div
                        className={`text-xs sm:text-sm font-bold ${
                          state === 'current'
                            ? 'text-[#15370D] underline'
                            : state === 'completed'
                            ? 'text-[#15370D]'
                            : 'text-[#15370D]/50'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#15370D]/70">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items Snapshot */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#15370D] border-b border-[#15370D]/10 pb-2">
            Dishes in Preparation ({order.items.length})
          </h3>
          <div className="space-y-2">
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between text-xs text-[#15370D]">
                <div>
                  <span className="font-bold">{i.quantity}x</span> {i.name}
                </div>
                <span className="font-semibold tabular-nums">₹{i.price * i.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Contact Bar */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs space-y-2.5 sm:space-y-0 gap-2">
          <span className="text-[#15370D]/80 text-center sm:text-left">
            Questions about your order timing?
          </span>
          <div className="flex items-center space-x-3">
            <a
              href="tel:+916367373302"
              className="font-bold text-[#15370D] underline hover:opacity-80 py-1"
            >
              +91 63673 73302
            </a>
            <a
              href="https://wa.me/916367373302"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#15370D] text-[#FFFFFF] px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-xs"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
