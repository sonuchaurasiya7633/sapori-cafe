'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, financials, updateQuantity, removeItem, orderMode } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-[#F5EFE1] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-[#F5EFE1] rounded-full mx-auto flex items-center justify-center text-[#15370D]">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="text-xl font-bold text-[#15370D]">Your Basket is Empty</h2>
          <p className="text-xs text-[#15370D]/75 leading-relaxed">
            You haven’t added any artisanal creations to your order basket yet.
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-block bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow min-h-[44px]"
            >
              Explore Our Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#15370D]">
            Your Order Basket ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <Link
            href="/menu"
            className="text-xs font-bold uppercase tracking-wider text-[#15370D] underline self-start sm:self-auto py-1"
          >
            Add More Dishes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Items List */}
          <div className="md:col-span-2 space-y-3.5 sm:space-y-4">
            {items.map((item) => {
              const addOnsTotal = (item.selectedAddOns || []).reduce((s, a) => s + a.price, 0);
              const unitTotal = item.price + addOnsTotal;

              return (
                <div
                  key={item.id}
                  className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 flex items-start justify-between shadow-xs gap-3"
                >
                  <div className="flex-1 pr-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#15370D] leading-snug">{item.name}</h3>
                    <div className="text-xs text-[#15370D]/75 font-semibold mt-0.5 tabular-nums">
                      ₹{unitTotal} each
                    </div>

                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <div className="text-[11px] text-[#15370D]/70 mt-1 space-y-0.5">
                        {item.selectedAddOns.map((addon) => (
                          <div key={addon.id}>+ {addon.name} (₹{addon.price})</div>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <div className="text-[11px] text-[#15370D]/60 italic mt-1">
                        Note: {item.notes}
                      </div>
                    )}

                    <div className="mt-4 flex items-center space-x-3">
                      <div className="flex items-center border border-[#15370D]/20 rounded-lg bg-[#F5EFE1]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#15370D] hover:bg-[#FFFFFF] rounded-l-lg"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-[#15370D] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#15370D] hover:bg-[#FFFFFF] rounded-r-lg"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-[#15370D]/60 hover:text-[#15370D] underline py-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm sm:text-base font-black text-[#15370D] tabular-nums">
                      ₹{unitTotal * item.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 h-fit space-y-4 shadow-sm sticky top-24">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D] border-b border-[#15370D]/10 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-[#15370D]/80">
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
              <div className="flex justify-between text-base font-black text-[#15370D] pt-3 border-t border-[#15370D]/10">
                <span>Total Amount</span>
                <span className="tabular-nums">₹{financials.total}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow min-h-[44px]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
