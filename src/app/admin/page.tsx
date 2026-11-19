'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  ChefHat,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  UtensilsCrossed,
  ArrowUpRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { Order } from '@/types';
import { getStatusBadgeInfo } from '@/lib/orders/stateMachine';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      if (json.analytics) setData(json.analytics);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(false), 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
          Aggregating Real-Time Operations Data...
        </p>
      </div>
    );
  }

  const analytics = data || {};
  const statusCounts = analytics.statusCounts || {};
  const modeCounts = analytics.modeCounts || {};
  const topSelling = analytics.topSelling || [];
  const recentOrders: Order[] = analytics.recentOrders || [];

  const kitchenActiveCount =
    (statusCounts['PLACED'] || 0) +
    (statusCounts['PREPARING'] || 0) +
    (statusCounts['ACCEPTED'] || 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Header & Quick Action Row */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15370D] animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70">
              Live Operations Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#15370D] mt-1">
            Sapori Control Center
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Real-time telemetry for Raja Park, Jaipur • Monitored live
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs disabled:opacity-60 min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <Link
            href="/admin/kitchen"
            className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-xs transition-colors min-h-[38px]"
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Display ({kitchenActiveCount})</span>
          </Link>
        </div>
      </div>

      {/* KPI Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#15370D]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70">
              Today's Gross Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#15370D] tabular-nums">
              ₹{Number(analytics.todayRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#15370D]/70 mt-1 font-medium">
              <span className="font-bold text-[#15370D]">
                {analytics.todayOrdersCount || 0} orders
              </span>
              <span>fulfilled today</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cumulative All-Time Volume */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#15370D]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70">
              All-Time Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#15370D] tabular-nums">
              ₹{Number(analytics.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#15370D]/70 mt-1 font-medium">
              <span className="font-bold text-[#15370D]">
                {analytics.totalOrdersCount || 0} total tickets
              </span>
              <span>completed</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Kitchen Tickets */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#15370D]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70">
              Kitchen Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#15370D] tabular-nums">
              {kitchenActiveCount}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#15370D]/70 mt-1 font-medium">
              <span className="font-bold text-[#15370D]">
                {statusCounts['PREPARING'] || 0} in oven / espresso bar
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Tables Occupancy */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#15370D]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70">
              Dining Hall Tables
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#15370D] tabular-nums">
              {analytics.occupiedTables || 0} / {analytics.totalTables || 8}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-[#15370D]/70 mt-1 font-medium">
              <span className="font-bold text-[#15370D]">
                {analytics.pendingReservations || 0} pending
              </span>
              <span>table reservations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution & Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Modes Breakdown */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Order Channels
            </h2>
            <span className="text-[10px] text-[#15370D]/60 font-mono">By Fulfilment</span>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'Counter Pickup',
                count: modeCounts['pickup'] || 0,
                desc: 'Takeaway orders',
              },
              {
                label: 'Home Delivery',
                count: modeCounts['delivery'] || 0,
                desc: 'Dispatched to door',
              },
              {
                label: 'Table Dine-In',
                count: modeCounts['dine_in'] || 0,
                desc: 'QR table orders',
              },
            ].map((m) => {
              const total = analytics.totalOrdersCount || 1;
              const pct = total > 0 ? Math.round((m.count / total) * 100) : 0;
              return (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-[#15370D]">
                    <div>
                      <span className="font-bold">{m.label}</span>
                      <span className="text-[10px] text-[#15370D]/60 ml-1.5 block sm:inline">
                        ({m.desc})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black tabular-nums">{m.count}</span>
                      <span className="text-[10px] text-[#15370D]/60 ml-1 font-mono">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#F5EFE1] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#15370D] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#15370D]/10 flex items-center justify-between text-[11px] text-[#15370D]/70">
            <span>Active dining tables:</span>
            <Link
              href="/admin/tables"
              className="font-bold text-[#15370D] hover:underline flex items-center space-x-1"
            >
              <span>Manage QR Tables</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Top Selling Dishes */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                Top Culinary Creations
              </h2>
              <p className="text-[10px] text-[#15370D]/60 mt-0.5">
                Highest ranked items by sales volume
              </p>
            </div>
            <Link
              href="/admin/menu"
              className="text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline flex items-center space-x-1"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topSelling.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#15370D]/60 space-y-1">
              <UtensilsCrossed className="w-8 h-8 opacity-40 mx-auto" />
              <p className="font-bold">No completed orders yet</p>
              <p className="text-[11px]">Rankings will populate as guest orders are closed.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topSelling.slice(0, 5).map((dish: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/10 hover:border-[#15370D]/20 transition-colors text-xs text-[#15370D]"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#15370D] text-[#FFFFFF] text-[11px] font-black flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-xs sm:text-sm">{dish.name}</p>
                      <p className="text-[10px] text-[#15370D]/60 uppercase tracking-wider">
                        {dish.category || 'Specialty'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className="text-[11px] font-semibold text-[#15370D]/75">
                      {dish.quantity} sold
                    </span>
                    <span className="font-black text-xs sm:text-sm tabular-nums">
                      ₹{Number(dish.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Guest Orders Table */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-[#15370D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Recent Live Orders
            </h2>
            <p className="text-[11px] text-[#15370D]/60">
              Latest transactions placed across counter, web, and QR tables
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline flex items-center space-x-1"
          >
            <span>Open All Orders ({ordersCount(analytics)})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#15370D]/60 space-y-1">
            <ShoppingBag className="w-8 h-8 opacity-40 mx-auto" />
            <p className="font-bold">No orders recorded yet</p>
            <p className="text-[11px]">Orders placed by guests will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#15370D] min-w-[700px]">
              <thead className="bg-[#F5EFE1] uppercase font-bold text-[10px] tracking-wider border-b border-[#15370D]/10 text-[#15370D]/80">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Dishes</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15370D]/10">
                {recentOrders.map((order) => {
                  const badge = getStatusBadgeInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[#F5EFE1]/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link
                          href={`/orders/${order.id}/track`}
                          target="_blank"
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>{order.orderNumber}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </Link>
                        <span className="block text-[10px] text-[#15370D]/60 font-sans">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold">{order.customer.name}</div>
                        <div className="text-[11px] text-[#15370D]/70">{order.customer.phone}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold uppercase text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#F5EFE1] border border-[#15370D]/15">
                          {order.orderMode}
                          {order.customer.tableNumber && ` (T-${order.customer.tableNumber})`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-[11px] truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black tabular-nums text-sm">
                        ₹{order.total}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-[#F5EFE1] border border-[#15370D]/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/admin/orders"
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#15370D] hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ordersCount(analytics: any) {
  return analytics?.totalOrdersCount || 0;
}
