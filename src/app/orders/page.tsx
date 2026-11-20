'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bike,
  Store,
  Utensils,
  RefreshCw,
  ExternalLink,
  Lock,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { getStatusBadgeInfo } from '@/lib/orders/stateMachine';
import { toast } from '@/lib/toast';

export default function MyOrdersPage() {
  const { user, customerProfile, loading: authLoading, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomerOrders = async (showToast = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      const params = new URLSearchParams();
      if (user.uid) params.set('uid', user.uid);
      const p = user.phoneNumber || customerProfile?.phone;
      if (p) params.set('phone', p.replace(/^\+91/, '').trim());
      const em = user.email || customerProfile?.email;
      if (em) params.set('email', em);

      const res = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (showToast) toast.success('Orders refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      if (showToast) toast.error('Failed to refresh orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCustomerOrders();
    }
  }, [user, authLoading]);

  // Polling for live status update if there is any active order
  useEffect(() => {
    const hasActiveOrders = orders.some((o) =>
      ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READY_TO_SERVE', 'OUT_FOR_DELIVERY'].includes(o.status)
    );

    if (hasActiveOrders) {
      const interval = setInterval(() => {
        fetchCustomerOrders();
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [orders]);

  if (authLoading) {
    return (
      <div className="bg-[#F5EFE1] min-h-[75vh] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="bg-[#F5EFE1] min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#15370D] text-[#DEB853] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#15370D]">
              Sign In to View Orders
            </h1>
            <p className="text-xs text-[#15370D]/75 leading-relaxed">
              Track live kitchen preparation, delivery status, and view past order invoices.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('google')}
              className="w-full py-3.5 bg-[#15370D] hover:bg-[#1a4411] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#DEB853]" />
              <span>Sign In with Google or OTP</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READY_TO_SERVE', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const pastOrders = orders.filter(
    (o) => !['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READY_TO_SERVE', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/60 block mb-0.5">
              Guest Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#15370D]">
              My Orders &amp; Live Tracking
            </h1>
            <p className="text-xs text-[#15370D]/75 mt-1">
              Signed in as <span className="font-bold">{customerProfile?.name || user.displayName || 'Customer'}</span>
              {user.email ? ` • ${user.email}` : user.phoneNumber ? ` • ${user.phoneNumber}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchCustomerOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] border border-[#15370D]/20 hover:bg-[#F5EFE1] text-[#15370D] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15370D] hover:bg-[#1a4411] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
            >
              <span>Order Food</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats Pill Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
              Total Orders
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5 block tabular-nums">
              {orders.length}
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
              Active Orders
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#15370D] tabular-nums">
                {activeOrders.length}
              </span>
              {activeOrders.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
              Total Spent
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5 block tabular-nums">
              ₹{totalSpent}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F5EFE1] text-[#15370D] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-[#15370D]">No Orders Yet</h2>
              <p className="text-xs text-[#15370D]/70 max-w-sm mx-auto">
                Discover our 48-hour slow fermented Neapolitan pizzas, precision Arabica roasts, and artisan pastries.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-block px-6 py-3 bg-[#15370D] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-[#1a4411] transition-all"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        )}

        {/* SECTION 1: ACTIVE LIVE ORDERS */}
        {activeOrders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D]">
                Active Live Orders ({activeOrders.length})
              </h2>
            </div>

            <div className="space-y-4">
              {activeOrders.map((order) => {
                const badge = getStatusBadgeInfo(order.status);
                const ModeIcon =
                  order.orderMode === 'delivery' ? Bike : order.orderMode === 'dine_in' ? Utensils : Store;

                return (
                  <div
                    key={order.id}
                    className="bg-[#FFFFFF] border-2 border-emerald-600/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-emerald-600/60 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#15370D]/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-black text-[#15370D]">
                            #{order.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#15370D]/65 mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <Link
                        href={`/orders/${order.id}/track`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#15370D] hover:bg-[#1a4411] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#DEB853]" />
                        <span>Track Live Status →</span>
                      </Link>
                    </div>

                    {/* Mode & Items List */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#15370D] font-bold">
                        <ModeIcon className="w-4 h-4 text-[#DEB853]" />
                        <span className="uppercase tracking-wider">
                          {order.orderMode.replace('_', ' ')}
                        </span>
                        {order.customer.tableNumber && (
                          <span className="text-[#15370D]/60">• Table #{order.customer.tableNumber}</span>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-[#15370D]/85">
                            <span>
                              <span className="font-bold">{item.quantity}x</span> {item.name}
                            </span>
                            <span className="font-semibold tabular-nums">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#15370D]/10 font-bold text-sm text-[#15370D]">
                        <span>Grand Total</span>
                        <span className="tabular-nums">₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: PAST / COMPLETED ORDERS */}
        {pastOrders.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D]">
              Past Orders ({pastOrders.length})
            </h2>

            <div className="space-y-3">
              {pastOrders.map((order) => {
                const badge = getStatusBadgeInfo(order.status);
                const isCancelled = ['CANCELLED', 'REJECTED'].includes(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#15370D]/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#15370D]">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              isCancelled
                                ? 'bg-red-100 text-red-800'
                                : 'bg-[#DEB853]/20 text-[#15370D]'
                            }`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#15370D]/60">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-[#15370D] tabular-nums">
                          ₹{order.total}
                        </span>
                        <Link
                          href={`/orders/${order.id}/track`}
                          className="px-3 py-1.5 border border-[#15370D]/20 hover:bg-[#F5EFE1] text-[#15370D] text-xs font-bold rounded-lg transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>

                    <div className="text-xs text-[#15370D]/75 line-clamp-2">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
