'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Banknote, Store, Bike, Utensils, AlertCircle, Sparkles, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { OrderMode, PaymentMethod } from '@/types';
import { toast } from '@/lib/toast';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    financials,
    orderMode,
    setOrderMode,
    tableNumber,
    setTableNumber,
    appliedCoupon,
    clearCart,
    settings,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [orderNotes, setOrderNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { user, customerProfile, openAuthModal } = useAuth();

  useEffect(() => {
    if (user || customerProfile) {
      if ((user?.displayName || customerProfile?.name) && !customerName) {
        setCustomerName(user?.displayName || customerProfile?.name || '');
      }
      if ((user?.email || customerProfile?.email) && !customerEmail) {
        setCustomerEmail(user?.email || customerProfile?.email || '');
      }
      if ((user?.phoneNumber || customerProfile?.phone) && !customerPhone) {
        const p = user?.phoneNumber || customerProfile?.phone || '';
        setCustomerPhone(p.replace(/^\+91/, '').trim());
      }
      if (customerProfile?.savedAddress && !address) {
        setAddress(customerProfile.savedAddress);
      }
    }
  }, [user, customerProfile]);

  if (items.length === 0) {
    return (
      <div className="bg-[#F5EFE1] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#15370D]">Basket is Empty</h2>
          <p className="text-xs text-[#15370D]/70">Please add items to your basket before checking out.</p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-block bg-[#15370D] text-[#FFFFFF] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
            >
              Go to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      const msg = 'Signing in is mandatory to place an order. Please sign in with Google, Phone OTP, or Email to continue.';
      toast.warning(msg);
      setErrorMsg(msg);
      openAuthModal('google');
      return;
    }

    if (settings?.isKitchenAcceptingOrders === false) {
      const msg = 'Our kitchen is temporarily paused for online orders. Please call our hotline.';
      toast.error(msg);
      setErrorMsg(msg);
      return;
    }

    if (settings?.minOrderValue && financials.subtotal < settings.minOrderValue) {
      const msg = `Minimum order value is ₹${settings.minOrderValue}. Please add more items.`;
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }

    if (!customerName.trim()) {
      const msg = 'Please enter your full name';
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      const msg = 'Please enter a valid 10-digit contact phone number';
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }
    if (orderMode === 'delivery' && !address.trim()) {
      const msg = 'Please provide your complete delivery address in Raja Park / Jaipur';
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }
    if (orderMode === 'dine_in' && !tableNumber.trim()) {
      const msg = 'Please provide your café table number';
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }

    setSubmitting(true);
    toast.loading('Placing your artisanal order...');

    try {
      const orderPayload = {
        items,
        orderMode,
        customer: {
          uid: user?.uid,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
          address: orderMode === 'delivery' ? address.trim() : undefined,
          deliveryNotes: orderMode === 'delivery' ? deliveryNotes.trim() : undefined,
          tableNumber: orderMode === 'dine_in' ? tableNumber.trim() : undefined,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        notes: orderNotes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      const createdOrder = data.order;

      // Online payment flow with sandbox simulation fallback
      if (paymentMethod === 'razorpay') {
        const payRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: createdOrder.id }),
        });
        const payData = await payRes.json();

        if (!payRes.ok || !payData.success) {
          throw new Error(payData.error || 'Payment gateway initialization failed');
        }

        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdOrder.id,
            razorpayOrderId: payData.razorpayOrderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            isSandbox: payData.isSandbox ?? true,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error('Payment verification could not be completed.');
        }
      }

      clearCart();
      toast.dismiss();
      toast.success('Order placed successfully!', {
        description: `Order #${createdOrder.orderNumber} • Total: ₹${createdOrder.total}`,
      });
      router.push(`/orders/${createdOrder.id}/confirmation`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.dismiss();
      const msg = err.message || 'An error occurred during checkout. Please try again.';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Basket</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-[#15370D]">Checkout & Confirmation</h1>

        {settings?.isKitchenAcceptingOrders === false && (
          <div className="bg-[#FFFFFF] border-2 border-[#15370D] p-4 rounded-xl flex items-start space-x-3 text-[#15370D] shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="block text-sm font-black uppercase tracking-wide">
                Kitchen Temporarily Paused
              </strong>
              Our culinary team is currently in rush preparation and not accepting online orders at this moment. Please visit our Raja Park café or reach us directly at {settings.contactPhone}.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-[#FFFFFF] border-2 border-[#15370D] p-4 rounded-xl flex items-start space-x-3 text-[#15370D]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-bold">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Form Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Dining Mode */}
            <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D]">
                1. Order Mode
              </h2>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { mode: 'pickup', label: 'Pickup', icon: Store },
                  { mode: 'delivery', label: 'Delivery', icon: Bike },
                  { mode: 'dine_in', label: 'Dine-In', icon: Utensils },
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setOrderMode(mode as OrderMode)}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-all min-h-[48px] ${
                      orderMode === mode
                        ? 'border-[#15370D] bg-[#F5EFE1] text-[#15370D] shadow-xs'
                        : 'border-[#15370D]/20 bg-[#FFFFFF] text-[#15370D]/75 hover:bg-[#F5EFE1]/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Authentication Card */}
            {!user ? (
              <div className="bg-[#FFFFFF] border-2 border-[#15370D]/30 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#15370D] text-[#DEB853] flex items-center justify-center shrink-0 shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-[#15370D] uppercase tracking-wide">
                        Sign In Required to Place Order
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>
                    <p className="text-xs text-[#15370D]/75 mt-0.5">
                      To protect your order, enable live order tracking, and earn dining rewards, please sign in.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => openAuthModal('google')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#15370D]/25 hover:bg-stone-50 text-[#15370D] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>1-Click Google Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal('phone')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#15370D] hover:bg-[#1a4411] text-[#FFFFFF] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span>Phone OTP / Email Login</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-emerald-950 truncate">
                      Signed in as {customerName || user.displayName || 'Customer'}
                    </p>
                    <p className="text-[11px] text-emerald-800/80 truncate">
                      {user.email || user.phoneNumber || ''}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-2.5 py-1 rounded-full">
                  Verified Account
                </span>
              </div>
            )}

            {/* Customer Details */}
            <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D]">
                2. Guest Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sen"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Email Address (Optional receipt)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ananya@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>
              </div>

              {/* Conditional: Delivery Address */}
              {orderMode === 'delivery' && (
                <div className="pt-3 border-t border-[#15370D]/10 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                      Delivery Address (Raja Park & Surrounding Areas) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="House / Flat No, Street, Landmark, Raja Park, Jaipur"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#15370D] mb-1.5">
                      Rider Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring the bell twice, near Panchwati circle"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    />
                  </div>
                </div>
              )}

              {/* Conditional: Dine-in Table */}
              {orderMode === 'dine_in' && (
                <div className="pt-3 border-t border-[#15370D]/10">
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Café Table Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-32 bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] font-bold focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>
              )}

              {/* Cooking notes */}
              <div className="pt-3 border-t border-[#15370D]/10">
                <label className="block text-xs font-semibold text-[#15370D] mb-1.5">
                  Overall Order Cooking Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pack cold brews in insulated box, cut pizza into 6 slices"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D]">
                3. Payment Method
              </h2>
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#15370D] bg-[#F5EFE1] shadow-xs'
                      : 'border-[#15370D]/20 bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-[#15370D] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#15370D]">
                        Razorpay Secure Online (UPI, Cards, NetBanking)
                      </div>
                      <div className="text-[11px] text-[#15370D]/70">
                        Instant server verification & automated order dispatch
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#15370D]">
                    {paymentMethod === 'razorpay' ? '●' : '○'}
                  </span>
                </div>

                <div
                  onClick={() => setPaymentMethod('cash_counter')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                    paymentMethod === 'cash_counter'
                      ? 'border-[#15370D] bg-[#F5EFE1] shadow-xs'
                      : 'border-[#15370D]/20 bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Banknote className="w-5 h-5 text-[#15370D] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#15370D]">
                        {orderMode === 'dine_in'
                          ? 'Pay at Counter / Table'
                          : orderMode === 'pickup'
                          ? 'Pay on Counter Pickup'
                          : 'Cash on Delivery'}
                      </div>
                      <div className="text-[11px] text-[#15370D]/70">
                        Settle via UPI or cash with our staff
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#15370D]">
                    {paymentMethod === 'cash_counter' ? '●' : '○'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirm */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm sticky top-24">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D] border-b border-[#15370D]/10 pb-3">
                Review Items ({items.length})
              </h3>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {items.map((i) => {
                  const addOnsTotal = (i.selectedAddOns || []).reduce((s, a) => s + a.price, 0);
                  return (
                    <div key={i.id} className="flex justify-between text-xs text-[#15370D] gap-2">
                      <div className="flex-1">
                        <span className="font-bold">{i.quantity}x</span> {i.name}
                        {i.selectedAddOns && i.selectedAddOns.length > 0 && (
                          <div className="text-[10px] text-[#15370D]/70">
                            + {i.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-bold tabular-nums">
                        ₹{(i.price + addOnsTotal) * i.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Table */}
              <div className="pt-3 border-t border-[#15370D]/10 space-y-2 text-xs text-[#15370D]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#15370D] tabular-nums">₹{financials.subtotal}</span>
                </div>
                {financials.discount > 0 && (
                  <div className="flex justify-between font-bold text-[#15370D]">
                    <span>Discount</span>
                    <span className="tabular-nums">-₹{financials.discount}</span>
                  </div>
                )}
                {financials.packagingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Packaging Charge</span>
                    <span className="font-semibold text-[#15370D] tabular-nums">₹{financials.packagingFee}</span>
                  </div>
                )}
                {orderMode === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-[#15370D] tabular-nums">
                      {financials.deliveryFee === 0 ? 'FREE' : `₹${financials.deliveryFee}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-[#15370D] tabular-nums">₹{financials.tax}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#15370D] pt-3 border-t border-[#15370D]/10">
                  <span>Grand Total</span>
                  <span className="tabular-nums">₹{financials.total}</span>
                </div>
              </div>

              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.warning('Signing in is mandatory to place an order.');
                    openAuthModal('google');
                  }}
                  className="w-full bg-[#15370D] hover:bg-[#1a4411] text-[#FFFFFF] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md min-h-[44px] cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#DEB853]" />
                  <span>Sign In to Place Order (Required)</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md disabled:opacity-60 min-h-[44px]"
                >
                  {submitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#15370D]/70 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15370D]" />
                <span>100% Encrypted & Authenticated Order</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
