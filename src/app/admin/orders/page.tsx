'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Utensils,
  Plus,
  X,
  Printer,
  Trash2,
  Check,
  Eye,
  Store,
  Bike,
  Tag,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, OrderMode, MenuItem, DiningTable } from '@/types';
import { getStatusBadgeInfo, canTransitionOrder } from '@/lib/orders/stateMachine';
import { toast } from '@/lib/toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // New Order / POS state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [posMode, setPosMode] = useState<OrderMode>('pickup');
  const [posCustomer, setPosCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    tableNumber: '01',
    deliveryNotes: '',
  });
  const [posCart, setPosCart] = useState<{ menuItem: MenuItem; quantity: number }[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'cash_counter' | 'razorpay'>('cash_counter');
  const [posPaymentStatus, setPosPaymentStatus] = useState<PaymentStatus>('PAID');
  const [posNotes, setPosNotes] = useState('');

  const fetchInitialData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [ordersRes, menuRes, tablesRes] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/menu').then((r) => r.json()),
        fetch('/api/tables').then((r) => r.json()),
      ]);

      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (menuRes.items) setMenuItems(menuRes.items);
      if (tablesRes.tables) setTables(tablesRes.tables);
    } catch (err) {
      console.error('Orders load error:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(() => fetchInitialData(false), 12000);
    return () => clearInterval(interval);
  }, []);

  // Update Status
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actor: 'admin' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(data.order);
        }
        toast.success(`Order status changed to ${newStatus}`, {
          description: `Order #${data.order.orderNumber}`,
        });
      } else {
        toast.error(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Update Payment Status
  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus, actor: 'admin' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(data.order);
        }
        toast.success(`Payment status changed to ${newPaymentStatus}`, {
          description: `Order #${data.order.orderNumber}`,
        });
      } else {
        toast.error(data.error || 'Failed to update payment status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(null);
        }
        toast.success('Order deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error deleting order');
    } finally {
      setUpdatingId(null);
    }
  };

  // POS Add item
  const handlePosAddItem = (item: MenuItem) => {
    setPosCart((prev) => {
      const existing = prev.find((p) => p.menuItem.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.menuItem.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handlePosUpdateQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((p) => p.menuItem.id !== itemId));
    } else {
      setPosCart((prev) =>
        prev.map((p) => (p.menuItem.id === itemId ? { ...p, quantity: qty } : p))
      );
    }
  };

  const posSubtotal = posCart.reduce((sum, p) => sum + p.menuItem.price * p.quantity, 0);
  const posTax = Math.round(posSubtotal * 0.05);
  const posPackaging = posMode === 'pickup' ? 25 : 0;
  const posDelivery = posMode === 'delivery' ? (posSubtotal >= 499 ? 0 : 40) : 0;
  const posTotal = posSubtotal + posTax + posPackaging + posDelivery;

  // Submit POS Order
  const handleCreatePosOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      setCreateError('Please add at least one dish to the order');
      return;
    }
    if (!posCustomer.name.trim() || !posCustomer.phone.trim()) {
      setCreateError('Customer name and contact number are required');
      return;
    }
    if (posMode === 'delivery' && !posCustomer.address.trim()) {
      setCreateError('Delivery address is required for delivery orders');
      return;
    }

    setSubmittingOrder(true);
    setCreateError(null);

    try {
      const formattedItems = posCart.map((p) => ({
        id: `${p.menuItem.id}-${Date.now()}`,
        menuItemId: p.menuItem.id,
        slug: p.menuItem.slug,
        name: p.menuItem.name,
        price: p.menuItem.price,
        quantity: p.quantity,
        selectedAddOns: [],
      }));

      const payload = {
        items: formattedItems,
        orderMode: posMode,
        customer: {
          name: posCustomer.name.trim(),
          phone: posCustomer.phone.trim(),
          email: posCustomer.email?.trim() || undefined,
          address: posMode === 'delivery' ? posCustomer.address.trim() : undefined,
          deliveryNotes: posMode === 'delivery' ? posCustomer.deliveryNotes.trim() : undefined,
          tableNumber: posMode === 'dine_in' ? posCustomer.tableNumber : undefined,
        },
        paymentMethod: posPaymentMethod,
        paymentStatus: posPaymentStatus,
        status: 'ACCEPTED',
        source: 'admin',
        notes: posNotes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place POS order');
      }

      if (data.order) {
        setOrders((prev) => [data.order, ...prev]);
        setSelectedOrderDetails(data.order);
        toast.success('POS Order Placed Successfully!', {
          description: `Order #${data.order.orderNumber} • ₹${data.order.total}`,
        });
      }

      setShowCreateModal(false);
      // Reset form
      setPosCart([]);
      setPosCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        tableNumber: '01',
        deliveryNotes: '',
      });
      setPosNotes('');
    } catch (err: any) {
      const msg = err.message || 'Error creating order';
      toast.error(msg);
      setCreateError(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filtered orders list
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
      if (selectedMode !== 'all' && o.orderMode !== selectedMode) return false;
      if (selectedDateFilter === 'today') {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        if (orderDate !== todayStr) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchName = o.customer.name.toLowerCase().includes(q);
        const matchPhone = o.customer.phone.includes(q);
        const matchTable = o.customer.tableNumber?.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchPhone && !matchTable) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, selectedMode, selectedDateFilter, todayStr, searchQuery]);

  // Executive KPI stats
  const totalCount = orders.length;
  const activeCount = orders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READY_TO_SERVE', 'OUT_FOR_DELIVERY'].includes(
      o.status
    )
  ).length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const todayRevenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header & Actions */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Kitchen & Counter Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Guest Orders Management
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Raja Park Café • Real-time order dispatch, receipts & payment tracking
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchInitialData(true)}
            disabled={refreshing}
            className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Counter Order</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Total Orders</span>
          <span className="text-2xl font-black text-[#15370D]">{totalCount}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">Lifetime recorded</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">In-Kitchen Active</span>
          <span className="text-2xl font-black text-[#15370D]">{activeCount}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">Live baking & brewing</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Fulfilled Orders</span>
          <span className="text-2xl font-black text-[#15370D]">{completedCount}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">Successfully delivered</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Gross Sales</span>
          <span className="text-2xl font-black text-[#15370D] tabular-nums">₹{todayRevenue}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">All active transactions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#15370D]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Guest name, phone, or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5EFE1]/50 border border-[#15370D]/20 rounded-xl pl-10 pr-4 py-2 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D] placeholder:text-[#15370D]/40 font-medium"
            />
          </div>

          {/* Quick Date filter */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setSelectedDateFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedDateFilter === 'all'
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedDateFilter('today')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedDateFilter === 'today'
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
              }`}
            >
              Today Only
            </button>
          </div>

          {/* Channel dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase text-[#15370D]/70 whitespace-nowrap">
              Channel:
            </span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-[#F5EFE1]/70 border border-[#15370D]/20 rounded-xl py-2 px-3 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
            >
              <option value="all">All Channels</option>
              <option value="pickup">Pickup (Counter)</option>
              <option value="delivery">Delivery (Doorstep)</option>
              <option value="dine_in">Dine-In (Tables)</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#15370D]/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'PLACED', label: 'Placed' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'PREPARING', label: 'Preparing' },
            { id: 'READY_FOR_PICKUP', label: 'Ready (Pickup)' },
            { id: 'READY_TO_SERVE', label: 'Ready (Serve)' },
            { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === st.id
                  ? 'bg-[#15370D] text-[#FFFFFF] shadow-2xs'
                  : 'bg-[#F5EFE1]/60 text-[#15370D] hover:bg-[#F5EFE1]'
              }`}
            >
              {st.label}
            </button>
          ))}
          <span className="text-xs text-[#15370D]/60 ml-auto font-medium">
            Showing {filtered.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
              Loading Orders Roster...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#15370D]">
            <ShoppingBag className="w-10 h-10 opacity-30 mx-auto" />
            <p className="font-bold text-sm">No orders match the selected filters</p>
            <p className="text-xs text-[#15370D]/60">
              Adjust search keywords or click "New Counter Order" to create a fresh order.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#15370D]">
                <thead className="bg-[#F5EFE1] uppercase font-bold text-[10px] tracking-wider border-b border-[#15370D]/10 text-[#15370D]/80">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref & Channel</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4">Guest Details</th>
                    <th className="py-3.5 px-4">Dishes</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Kitchen Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15370D]/10">
                  {filtered.map((order) => {
                    const badge = getStatusBadgeInfo(order.status);
                    const isUpdating = updatingId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-[#F5EFE1]/20 transition-colors">
                        <td className="py-3.5 px-4 align-top">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="font-mono font-black text-xs hover:underline flex items-center space-x-1 text-left"
                          >
                            <span>{order.orderNumber}</span>
                            <Eye className="w-3 h-3 opacity-60" />
                          </button>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/15 text-[10px] font-bold uppercase">
                            {order.orderMode}
                            {order.customer.tableNumber && ` • Table ${order.customer.tableNumber}`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap align-top">
                          <div className="font-bold text-xs">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-[10px] text-[#15370D]/60">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-xs">{order.customer.name}</div>
                          <a
                            href={`https://wa.me/91${order.customer.phone.replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#15370D] font-mono hover:underline flex items-center space-x-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customer.phone}</span>
                          </a>
                          {order.customer.address && (
                            <div className="text-[10px] text-[#15370D]/60 line-clamp-1 max-w-[200px] mt-0.5">
                              {order.customer.address}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 max-w-[220px] align-top">
                          <div className="space-y-0.5">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="text-[11px] leading-tight">
                                <span className="font-bold">{i.quantity}x</span> {i.name}
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <div className="text-[10px] text-[#15370D]/70 italic mt-1 line-clamp-1">
                              "{order.notes}"
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-black text-sm tabular-nums whitespace-nowrap align-top">
                          ₹{order.total}
                        </td>

                        {/* Payment Status Dropdown */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <select
                            disabled={isUpdating}
                            value={order.paymentStatus}
                            onChange={(e) =>
                              handlePaymentStatusChange(order.id, e.target.value as PaymentStatus)
                            }
                            className={`rounded-lg py-1 px-2 text-[10px] font-black uppercase tracking-wider focus:outline-none transition-colors border ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-[#15370D] text-[#FFFFFF] border-[#15370D]'
                                : 'bg-[#F5EFE1] text-[#15370D] border-[#15370D]/30'
                            }`}
                          >
                            <option value="PAID">PAID</option>
                            <option value="PENDING">PENDING</option>
                            <option value="REFUNDED">REFUNDED</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </td>

                        {/* Order Status Dropdown */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <select
                            disabled={isUpdating}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className="bg-[#FFFFFF] border border-[#15370D]/30 text-[#15370D] rounded-xl py-1 px-2 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                            <option value="READY_TO_SERVE">READY_TO_SERVE</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              title="View Order Bill & KOT"
                              className="w-7 h-7 bg-[#F5EFE1] text-[#15370D] hover:bg-[#15370D] hover:text-[#FFFFFF] rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              disabled={isUpdating}
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order Record"
                              className="w-7 h-7 bg-[#F5EFE1] text-[#15370D]/70 hover:bg-[#FFFFFF] hover:text-[#15370D] border border-[#15370D]/20 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack */}
            <div className="lg:hidden divide-y divide-[#15370D]/10">
              {filtered.map((order) => {
                const badge = getStatusBadgeInfo(order.status);
                const isUpdating = updatingId === order.id;

                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="font-mono font-bold text-sm text-[#15370D] hover:underline flex items-center space-x-1"
                        >
                          <span>{order.orderNumber}</span>
                          <Eye className="w-3 h-3 opacity-60" />
                        </button>
                        <span className="text-[10px] font-bold uppercase text-[#15370D]/70">
                          {order.orderMode}
                          {order.customer.tableNumber && ` • Table ${order.customer.tableNumber}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#15370D] tabular-nums">
                          ₹{order.total}
                        </span>
                        <span className="block text-[10px] text-[#15370D]/60 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#F5EFE1]/40 rounded-xl p-3 border border-[#15370D]/10 text-xs space-y-1">
                      <div className="font-bold text-[#15370D]">{order.customer.name}</div>
                      <a
                        href={`https://wa.me/91${order.customer.phone.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#15370D] font-mono text-[11px] flex items-center space-x-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.customer.phone}</span>
                      </a>
                      {order.customer.address && (
                        <div className="text-[10px] text-[#15370D]/60 pt-0.5">
                          {order.customer.address}
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60">
                        Dishes ({order.items.reduce((s, i) => s + i.quantity, 0)})
                      </div>
                      <div className="space-y-0.5">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-[#15370D]">
                            <span>
                              <strong>{i.quantity}x</strong> {i.name}
                            </span>
                            <span className="font-mono">₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#15370D]/10 gap-2">
                      <div className="flex items-center space-x-2">
                        <select
                          disabled={isUpdating}
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentStatusChange(order.id, e.target.value as PaymentStatus)
                          }
                          className={`rounded-lg py-1 px-2 text-[10px] font-black uppercase ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-[#15370D] text-[#FFFFFF]'
                              : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20'
                          }`}
                        >
                          <option value="PAID">PAID</option>
                          <option value="PENDING">PENDING</option>
                          <option value="REFUNDED">REFUNDED</option>
                          <option value="FAILED">FAILED</option>
                        </select>

                        <select
                          disabled={isUpdating}
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="bg-[#FFFFFF] border border-[#15370D]/30 text-[#15370D] rounded-lg py-1 px-2 text-xs font-bold"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                          <option value="READY_TO_SERVE">READY_TO_SERVE</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 rounded-lg bg-[#F5EFE1] text-[#15370D]"
                          title="View Bill / KOT"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 rounded-lg bg-[#F5EFE1] text-[#15370D]/70"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL: POS / New Counter Walk-In Order */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15370D]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#15370D]/20 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
                  Staff POS Terminal
                </span>
                <h2 className="text-lg font-black text-[#15370D]">
                  New Counter / Walk-In Order
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#F5EFE1] text-[#15370D] flex items-center justify-center hover:bg-[#15370D] hover:text-[#FFFFFF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="bg-[#F5EFE1] border border-[#15370D]/30 p-3 rounded-xl text-xs text-[#15370D] font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#15370D] shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePosOrder} className="space-y-5">
              {/* Channel Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1.5">
                  1. Dining Channel *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { mode: 'pickup', label: 'Pickup (Takeaway)', icon: Store },
                    { mode: 'dine_in', label: 'Dine-In (Table)', icon: Utensils },
                    { mode: 'delivery', label: 'Delivery (Jaipur)', icon: Bike },
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPosMode(mode as OrderMode)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                        posMode === mode
                          ? 'border-[#15370D] bg-[#15370D] text-[#FFFFFF] shadow-xs'
                          : 'border-[#15370D]/20 bg-[#F5EFE1]/40 text-[#15370D] hover:bg-[#F5EFE1]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest & Table Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Guest Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={posCustomer.name}
                    onChange={(e) => setPosCustomer({ ...posCustomer, name: e.target.value })}
                    placeholder="e.g. Yash Vardhan"
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Contact Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    value={posCustomer.phone}
                    onChange={(e) => setPosCustomer({ ...posCustomer, phone: e.target.value })}
                    placeholder="e.g. 98290 12345"
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                {posMode === 'dine_in' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                      Dining Table *
                    </label>
                    <select
                      value={posCustomer.tableNumber}
                      onChange={(e) => setPosCustomer({ ...posCustomer, tableNumber: e.target.value })}
                      className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    >
                      {tables.map((t) => (
                        <option key={t.tableNumber} value={t.tableNumber}>
                          Table {t.tableNumber} ({t.capacity} guests) {t.status === 'occupied' ? '• Occupied' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {posMode === 'delivery' && (
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                      Delivery Address *
                    </label>
                    <input
                      required
                      type="text"
                      value={posCustomer.address}
                      onChange={(e) => setPosCustomer({ ...posCustomer, address: e.target.value })}
                      placeholder="e.g. Plot 45, Raja Park, near Panchwati circle, Jaipur"
                      className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    />
                  </div>
                )}
              </div>

              {/* Menu Item Quick-Add Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block">
                  2. Select Dishes from Menu
                </label>
                <div className="border border-[#15370D]/15 rounded-2xl p-3 bg-[#F5EFE1]/20 max-h-48 overflow-y-auto space-y-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {menuItems.map((item) => {
                      const inCart = posCart.find((p) => p.menuItem.id === item.id);

                      return (
                        <div
                          key={item.id}
                          className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-2.5 flex items-center justify-between text-xs"
                        >
                          <div className="pr-2">
                            <span className="font-bold text-[#15370D] block leading-tight">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#15370D]/70">
                              ₹{item.price}
                            </span>
                          </div>

                          {inCart ? (
                            <div className="flex items-center space-x-1.5 bg-[#F5EFE1] border border-[#15370D]/20 rounded-lg px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => handlePosUpdateQty(item.id, inCart.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center font-bold text-[#15370D]"
                              >
                                -
                              </button>
                              <span className="font-bold font-mono text-xs text-[#15370D] px-1">
                                {inCart.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePosUpdateQty(item.id, inCart.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center font-bold text-[#15370D]"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePosAddItem(item)}
                              className="bg-[#15370D] text-[#FFFFFF] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-[#15370D]/90"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Cart & Bill Breakdown */}
              {posCart.length > 0 && (
                <div className="bg-[#F5EFE1] border border-[#15370D]/15 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/70 block border-b border-[#15370D]/10 pb-1.5">
                    Order Items ({posCart.reduce((s, p) => s + p.quantity, 0)})
                  </span>

                  <div className="space-y-1.5 text-xs text-[#15370D]">
                    {posCart.map((p) => (
                      <div key={p.menuItem.id} className="flex justify-between items-center">
                        <span>
                          <strong>{p.quantity}x</strong> {p.menuItem.name}
                        </span>
                        <span className="font-mono font-bold">
                          ₹{p.menuItem.price * p.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#15370D]/10 space-y-1 text-xs text-[#15370D]/80">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-[#15370D]">₹{posSubtotal}</span>
                    </div>
                    {posPackaging > 0 && (
                      <div className="flex justify-between">
                        <span>Packaging Fee</span>
                        <span className="font-mono font-semibold text-[#15370D]">₹{posPackaging}</span>
                      </div>
                    )}
                    {posDelivery > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-mono font-semibold text-[#15370D]">₹{posDelivery}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="font-mono font-semibold text-[#15370D]">₹{posTax}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#15370D] pt-1.5 border-t border-[#15370D]/15">
                      <span>Total Payable</span>
                      <span className="font-mono">₹{posTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={posPaymentMethod}
                    onChange={(e) => setPosPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    <option value="cash_counter">Cash at Counter</option>
                    <option value="razorpay">Razorpay / UPI</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={posPaymentStatus}
                    onChange={(e) => setPosPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    <option value="PAID">PAID (Cash / UPI Received)</option>
                    <option value="PENDING">PENDING (Pay after dining)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                  Kitchen Instructions / Dietary Note
                </label>
                <input
                  type="text"
                  value={posNotes}
                  onChange={(e) => setPosNotes(e.target.value)}
                  placeholder="e.g. Extra spicy pizza, iced cold brew packed separately"
                  className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#15370D]/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#15370D]/20 text-xs font-bold text-[#15370D] hover:bg-[#F5EFE1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder || posCart.length === 0}
                  className="bg-[#15370D] text-[#FFFFFF] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90 shadow-xs disabled:opacity-50"
                >
                  {submittingOrder ? 'Placing Order...' : 'Generate Ticket & Send to Kitchen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Order Bill Inspection & Printable Receipt / KOT */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15370D]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#15370D]/20 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
                  Thermal Bill & Ticket
                </span>
                <h3 className="text-lg font-black text-[#15370D]">
                  Order {selectedOrderDetails.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-full bg-[#F5EFE1] text-[#15370D] flex items-center justify-center hover:bg-[#15370D] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Preview Box */}
            <div className="bg-[#F5EFE1]/40 border border-[#15370D]/15 rounded-2xl p-5 space-y-4 font-mono text-xs text-[#15370D]">
              <div className="text-center space-y-1 border-b border-[#15370D]/10 pb-3">
                <h4 className="font-black text-sm uppercase tracking-wide">
                  SAPORI CAFE
                </h4>
                <p className="text-[10px] text-[#15370D]/70 font-sans">
                  217/1, Ramgali No. 1, Raja Park, Jaipur • +91 63673 73302
                </p>
                <div className="flex justify-between items-center text-[10px] text-[#15370D]/60 pt-1">
                  <span>
                    {new Date(selectedOrderDetails.createdAt).toLocaleDateString()} •{' '}
                    {new Date(selectedOrderDetails.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="font-bold uppercase">{selectedOrderDetails.orderMode}</span>
                </div>
              </div>

              {/* Guest & Table */}
              <div className="space-y-1 text-[11px] font-sans border-b border-[#15370D]/10 pb-3">
                <div>
                  <strong>Customer:</strong> {selectedOrderDetails.customer.name}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedOrderDetails.customer.phone}
                </div>
                {selectedOrderDetails.customer.tableNumber && (
                  <div>
                    <strong>Table:</strong> Table {selectedOrderDetails.customer.tableNumber}
                  </div>
                )}
                {selectedOrderDetails.customer.address && (
                  <div>
                    <strong>Address:</strong> {selectedOrderDetails.customer.address}
                  </div>
                )}
                {selectedOrderDetails.notes && (
                  <div className="italic text-[#15370D]/80 pt-1">
                    <strong>Note:</strong> "{selectedOrderDetails.notes}"
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 border-b border-[#15370D]/10 pb-3">
                {selectedOrderDetails.items.map((i, idx) => {
                  const addOnsTotal = (i.selectedAddOns || []).reduce((s, a) => s + a.price, 0);
                  const lineTotal = (i.price + addOnsTotal) * i.quantity;

                  return (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <span className="font-bold">{i.quantity}x</span> {i.name}
                        {i.selectedAddOns && i.selectedAddOns.length > 0 && (
                          <div className="text-[10px] text-[#15370D]/70 font-sans">
                            + {i.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-bold">₹{lineTotal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px] font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedOrderDetails.subtotal}</span>
                </div>
                {selectedOrderDetails.discount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>Discount</span>
                    <span>-₹{selectedOrderDetails.discount}</span>
                  </div>
                )}
                {selectedOrderDetails.packagingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Packaging Fee</span>
                    <span>₹{selectedOrderDetails.packagingFee}</span>
                  </div>
                )}
                {selectedOrderDetails.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrderDetails.deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{selectedOrderDetails.tax}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 border-t border-[#15370D]/15 text-[#15370D]">
                  <span>Total Amount</span>
                  <span>₹{selectedOrderDetails.total}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-[#15370D]/60 uppercase font-sans">
                Status: {selectedOrderDetails.status} • Payment: {selectedOrderDetails.paymentStatus} (
                {selectedOrderDetails.paymentMethod})
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill / KOT</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {selectedOrderDetails.paymentStatus !== 'PAID' && (
                  <button
                    type="button"
                    onClick={() => handlePaymentStatusChange(selectedOrderDetails.id, 'PAID')}
                    className="bg-[#15370D] text-[#FFFFFF] px-3.5 py-2 rounded-xl text-xs font-bold uppercase hover:bg-[#15370D]/90"
                  >
                    Mark as Paid
                  </button>
                )}

                <Link
                  href={`/orders/${selectedOrderDetails.id}/track`}
                  target="_blank"
                  className="bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 px-3.5 py-2 rounded-xl text-xs font-bold uppercase hover:bg-[#FFFFFF] flex items-center space-x-1"
                >
                  <span>Public Tracker</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
