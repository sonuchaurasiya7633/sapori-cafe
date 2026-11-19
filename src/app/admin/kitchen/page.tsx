'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChefHat, Clock, Check, Bell, RefreshCw, Volume2, VolumeX, AlertCircle, Utensils } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { toast } from '@/lib/toast';

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        const activeKitchenStatuses = [
          'PLACED',
          'ACCEPTED',
          'PREPARING',
          'READY_FOR_PICKUP',
          'READY_TO_SERVE',
          'OUT_FOR_DELIVERY',
        ];
        const active = data.orders.filter((o: Order) => activeKitchenStatuses.includes(o.status));
        setOrders(active);
      }
    } catch (err) {
      console.error('KDS load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const pollInterval = setInterval(fetchOrders, 5000);
    const clockInterval = setInterval(() => setNow(Date.now()), 10000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, actor: 'kitchen' }),
      });
      if (res.ok) {
        toast.success(`Kitchen status: ${nextStatus}`);
        fetchOrders();
      } else {
        toast.error('Failed to update kitchen ticket');
      }
    } catch (err) {
      console.error('Failed to update order status in KDS', err);
      toast.error('Network error updating ticket');
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatusAction = (order: Order): { label: string; nextStatus: OrderStatus } | null => {
    switch (order.status) {
      case 'PLACED':
        return { label: 'Accept Ticket', nextStatus: 'ACCEPTED' };
      case 'ACCEPTED':
        return { label: 'Start Baking / Brewing', nextStatus: 'PREPARING' };
      case 'PREPARING':
        if (order.orderMode === 'pickup') {
          return { label: 'Ready for Counter', nextStatus: 'READY_FOR_PICKUP' };
        }
        if (order.orderMode === 'dine_in') {
          return { label: 'Ready to Serve Table', nextStatus: 'READY_TO_SERVE' };
        }
        return { label: 'Ready for Courier', nextStatus: 'OUT_FOR_DELIVERY' };
      case 'READY_FOR_PICKUP':
      case 'READY_TO_SERVE':
      case 'OUT_FOR_DELIVERY':
        return { label: 'Mark Fulfilled & Complete', nextStatus: 'COMPLETED' };
      default:
        return null;
    }
  };

  const calculateMinutesAge = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* KDS Header & Controls */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15370D] animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70">
              Kitchen Display System (KDS)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Active Kitchen Queue
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            {orders.length} tickets actively brewing, baking, or awaiting dispatch
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px]"
            title={soundEnabled ? 'Mute Kitchen Audio' : 'Unmute Kitchen Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          <button
            onClick={fetchOrders}
            className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
            Syncing Kitchen Tickets...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F5EFE1] text-[#15370D] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-[#15370D]">Kitchen Queue is Clear</h2>
          <p className="text-xs text-[#15370D]/60 max-w-sm mx-auto">
            All current orders have been fulfilled. New tickets from counter, website, or QR tables will arrive here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((order) => {
            const ageMins = calculateMinutesAge(order.createdAt);
            const isUrgent = ageMins >= 15;
            const nextAction = getNextStatusAction(order);
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-[#FFFFFF] border rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                  isUrgent
                    ? 'border-[#15370D] ring-2 ring-[#15370D]/20'
                    : 'border-[#15370D]/15'
                }`}
              >
                {/* Ticket Topbar */}
                <div className="p-4 bg-[#F5EFE1] border-b border-[#15370D]/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-sm text-[#15370D] block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/70">
                      {order.orderMode}
                      {order.customer.tableNumber && ` • Table ${order.customer.tableNumber}`}
                    </span>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-black tabular-nums ${
                        isUrgent
                          ? 'bg-[#15370D] text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] text-[#15370D] border border-[#15370D]/20'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ageMins}m ago</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Items List */}
                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#15370D]/10">
                    <span className="font-bold text-[#15370D]">
                      Guest: {order.customer.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#15370D]/60">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/10 text-xs text-[#15370D]"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm">
                            <span className="text-base font-black text-[#15370D] mr-1.5">
                              {item.quantity}×
                            </span>
                            {item.name}
                          </span>
                        </div>
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <div className="mt-1 text-[11px] text-[#15370D]/70 pl-5">
                            + {item.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-[#F5EFE1] border border-[#15370D]/20 text-[11px] text-[#15370D]">
                      <span className="font-bold uppercase tracking-wider text-[9px] block text-[#15370D]/70">
                        Kitchen Instruction
                      </span>
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Ticket Action Button */}
                <div className="p-4 bg-[#F5EFE1]/30 border-t border-[#15370D]/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#15370D]/70">
                    <span>Status:</span>
                    <span className="uppercase text-[#15370D] font-black">{order.status}</span>
                  </div>

                  {nextAction && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, nextAction.nextStatus)}
                      disabled={isUpdating}
                      className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-50 min-h-[44px]"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isUpdating ? 'Advancing...' : nextAction.label}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
