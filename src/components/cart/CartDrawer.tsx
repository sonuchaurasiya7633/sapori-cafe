'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Utensils, Bike, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { OrderMode } from '@/types';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    financials,
    orderMode,
    setOrderMode,
    tableNumber,
    setTableNumber,
    updateQuantity,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Prevent background scroll when cart drawer is active
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Order Basket">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#15370D]/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#FFFFFF] border-l border-[#15370D]/15 flex flex-col shadow-2xl pb-safe">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#15370D]/10 bg-[#F5EFE1] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#15370D]" />
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#15370D]">
                Your Order Basket
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="w-10 h-10 flex items-center justify-center text-[#15370D] hover:bg-[#FFFFFF] rounded-full transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="px-4 sm:px-5 py-3 bg-[#F5EFE1]/50 border-b border-[#15370D]/10">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70 mb-2">
              Select Dining Mode:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'pickup', label: 'Pickup', icon: Store },
                { mode: 'delivery', label: 'Delivery', icon: Bike },
                { mode: 'dine_in', label: 'Dine-In', icon: Utensils },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOrderMode(mode as OrderMode)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg flex flex-col items-center justify-center transition-all ${
                    orderMode === mode
                      ? 'bg-[#15370D] text-[#FFFFFF] shadow-sm'
                      : 'bg-[#FFFFFF] text-[#15370D] border border-[#15370D]/20 hover:bg-[#F5EFE1]'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {orderMode === 'dine_in' && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-semibold text-[#15370D] mb-1">
                  Table Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 03"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/30 text-[#15370D] text-xs px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-[#F5EFE1] rounded-full mx-auto flex items-center justify-center text-[#15370D]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-base font-bold text-[#15370D]">Your Basket is Empty</h3>
                <p className="text-xs text-[#15370D]/70 max-w-xs mx-auto">
                  Explore our authentic Neapolitan pizzas, craft cold brews, and comforting Italian bakery pairings.
                </p>
                <div className="pt-2">
                  <Link
                    href="/menu"
                    onClick={closeCart}
                    className="inline-block bg-[#15370D] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-[#15370D]/90 transition-colors shadow"
                  >
                    Browse Menu
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const addOnsTotal = (item.selectedAddOns || []).reduce((s, a) => s + a.price, 0);
                const itemUnitTotal = item.price + addOnsTotal;

                return (
                  <div
                    key={item.id}
                    className="bg-[#F5EFE1]/40 border border-[#15370D]/10 rounded-xl p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#15370D] leading-snug">{item.name}</h4>
                        <span className="text-xs font-semibold text-[#15370D]/80 tabular-nums">
                          ₹{itemUnitTotal} each
                        </span>
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <div className="text-[11px] text-[#15370D]/70 mt-1 space-y-0.5">
                            {item.selectedAddOns.map((addon) => (
                              <div key={addon.id}>+ {addon.name} (₹{addon.price})</div>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[11px] text-[#15370D]/60 italic mt-0.5">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-[#15370D]/50 hover:text-[#15370D] transition-colors rounded"
                        aria-label={`Remove ${item.name} from basket`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#15370D]/10">
                      <div className="flex items-center space-x-1 bg-[#FFFFFF] border border-[#15370D]/20 rounded-md px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#15370D] hover:bg-[#F5EFE1] rounded"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#15370D] px-2 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#15370D] hover:bg-[#F5EFE1] rounded"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-[#15370D] tabular-nums">
                        ₹{itemUnitTotal * item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Calculations */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#15370D]/15 bg-[#F5EFE1] space-y-3.5">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#15370D]/30 p-2.5 rounded-lg text-xs">
                    <div className="flex items-center space-x-2 text-[#15370D] font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-[10px] font-normal opacity-75">
                        ({financials.discountBreakdown})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] font-bold text-[#15370D] underline hover:opacity-80 px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. SAPORI10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-[#FFFFFF] border border-[#15370D]/25 text-[#15370D] uppercase text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    />
                    <button
                      type="submit"
                      className="bg-[#15370D] text-[#FFFFFF] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#15370D]/90 shadow-sm"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-[#15370D] font-bold mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-[#15370D] font-bold mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#15370D]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#15370D] tabular-nums">₹{financials.subtotal}</span>
                </div>
                {financials.discount > 0 && (
                  <div className="flex justify-between text-[#15370D] font-bold">
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
                  <span>Estimated Taxes (GST 5%)</span>
                  <span className="font-semibold text-[#15370D] tabular-nums">₹{financials.tax}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-[#15370D] pt-2 border-t border-[#15370D]/15">
                  <span>Total Payable</span>
                  <span className="tabular-nums">₹{financials.total}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
