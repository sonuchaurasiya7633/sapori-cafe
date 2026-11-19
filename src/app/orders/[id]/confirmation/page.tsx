'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Phone, MessageSquare, Clock, MapPin, Utensils } from 'lucide-react';
import { Order } from '@/types';
import { getStatusBadgeInfo } from '@/lib/orders/stateMachine';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error('Failed to load order', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-[#F5EFE1] min-h-screen py-20 text-center text-[#15370D] font-bold">
        Loading Order Confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#F5EFE1] min-h-screen py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#15370D]">Order Not Found</h2>
        <Link
          href="/menu"
          className="inline-block bg-[#15370D] text-[#FFFFFF] px-6 py-2 rounded text-xs font-bold uppercase tracking-wider"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeInfo(order.status);

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Success Card */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-[#F5EFE1] rounded-full mx-auto flex items-center justify-center text-[#15370D]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#15370D]">
              Grazie, {order.customer.name}!
            </h1>
            <p className="text-xs text-[#15370D]/75">
              Your artisanal order has been recorded and sent straight to our kitchen.
            </p>
          </div>

          <div className="bg-[#F5EFE1] border border-[#15370D]/15 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs space-y-2 sm:space-y-0">
            <div>
              <span className="text-[#15370D]/60 uppercase tracking-widest font-semibold block text-[10px]">
                Order Reference
              </span>
              <span className="font-mono font-black text-sm text-[#15370D]">
                {order.orderNumber}
              </span>
            </div>

            <div>
              <span className="text-[#15370D]/60 uppercase tracking-widest font-semibold block text-[10px]">
                Current Status
              </span>
              <span className="font-bold text-[#15370D] uppercase tracking-wider">
                {badge.label}
              </span>
            </div>

            <div>
              <span className="text-[#15370D]/60 uppercase tracking-widest font-semibold block text-[10px]">
                Payment
              </span>
              <span className="font-bold text-[#15370D] uppercase tracking-wider">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Action to track */}
          <div className="pt-2">
            <Link
              href={`/orders/${order.id}/track`}
              className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow"
            >
              <span>Track Live Kitchen Progress</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#15370D] border-b border-[#15370D]/10 pb-3">
            Order Items & Receipt
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => {
              const addOnsTotal = (item.selectedAddOns || []).reduce((s, a) => s + a.price, 0);
              return (
                <div key={idx} className="flex justify-between items-start text-xs text-[#15370D]">
                  <div>
                    <span className="font-bold">{item.quantity}x</span> {item.name}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <div className="text-[10px] text-[#15370D]/70">
                        + {item.selectedAddOns.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-[10px] text-[#15370D]/60 italic">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                  <span className="font-bold">
                    ₹{(item.price + addOnsTotal) * item.quantity}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#15370D]/10 space-y-1.5 text-xs text-[#15370D]/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#15370D]">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between font-bold text-[#15370D]">
                <span>Discount ({order.couponCode})</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            {order.packagingFee > 0 && (
              <div className="flex justify-between">
                <span>Packaging Fee</span>
                <span className="font-semibold text-[#15370D]">₹{order.packagingFee}</span>
              </div>
            )}
            {order.orderMode === 'delivery' && (
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-[#15370D]">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST</span>
              <span className="font-semibold text-[#15370D]">₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#15370D] pt-2 border-t border-[#15370D]/10">
              <span>Grand Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Support & Contact */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between text-xs space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 text-[#15370D]">
            <Phone className="w-4 h-4 text-[#15370D]" />
            <span>Need assistance with your order?</span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="tel:+916367373302"
              className="text-[#15370D] font-bold underline hover:opacity-80"
            >
              Call +91 63673 73302
            </a>
            <a
              href="https://wa.me/916367373302"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#15370D] text-[#FFFFFF] px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
