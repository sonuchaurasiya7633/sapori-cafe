'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Flame, Check, Clock, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { AddOnOption, MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/menu/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/menu/${slug}`);
        const data = await res.json();
        if (data.item) {
          setItem(data.item);
          // fetch related
          const relatedRes = await fetch(`/api/menu?category=${data.item.category}`);
          const relatedData = await relatedRes.json();
          if (relatedData.items) {
            setRelatedItems(relatedData.items.filter((i: MenuItem) => i.id !== data.item.id).slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#F5EFE1] min-h-screen py-16 text-center text-[#15370D] font-bold">
        Loading dish details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-[#F5EFE1] min-h-screen py-20 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-[#15370D]">Dish Not Found</h2>
        <p className="text-xs text-[#15370D]/70">The requested menu creation could not be found.</p>
        <Link
          href="/menu"
          className="inline-block bg-[#15370D] text-[#FFFFFF] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const toggleAddOn = (addon: AddOnOption) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const addOnsTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const totalItemPrice = (item.price + addOnsTotal) * quantity;

  const handleAddToCart = () => {
    addItem(item, quantity, selectedAddOns, notes);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Back navigation */}
        <Link
          href="/menu"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline py-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Full Menu</span>
        </Link>

        {/* Product Hero Card */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {/* Left Column: Visual Emblem & Details */}
          <div className="space-y-5 sm:space-y-6">
            <div className="relative w-full aspect-square bg-[#F5EFE1] rounded-2xl border border-[#15370D]/15 overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 shadow-xs">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
              ) : (
                <>
                  <span className="w-6 h-6 border-2 border-[#15370D] rounded-sm flex items-center justify-center p-1">
                    <span className="w-3 h-3 rounded-full bg-[#15370D]" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#15370D] uppercase tracking-wide leading-snug">
                    {item.name}
                  </h2>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#15370D]/70">
                    {item.category.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {item.isSignature && (
                <span className="bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-[#15370D]" />
                  Signature Dish
                </span>
              )}
              {item.isSpicy && (
                <span className="bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center shadow-xs">
                  <Flame className="w-3.5 h-3.5 mr-1 text-[#15370D]" />
                  Spicy Selection
                </span>
              )}
              <span className="text-xs font-semibold text-[#15370D]/70 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#15370D]" />
                ~{item.prepTimeMinutes || 15} mins prep
              </span>
            </div>
          </div>

          {/* Right Column: Customization & Ordering */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-black text-[#15370D] leading-tight">
                {item.name}
              </h1>

              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-[#15370D] tabular-nums">
                  ₹{item.price}
                </span>
                <span className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider">
                  Base Catalog Price
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#15370D]/80 leading-relaxed">
                {item.description || 'Artisanal Sapori Café specialty handcrafted to order with premium ingredients.'}
              </p>

              {/* Add-ons */}
              {item.addOns && item.addOns.length > 0 && (
                <div className="pt-4 border-t border-[#15370D]/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                    Gourmet Add-ons:
                  </h4>
                  <div className="space-y-2">
                    {item.addOns.map((addon) => {
                      const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddOn(addon)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                            isSelected
                              ? 'border-[#15370D] bg-[#F5EFE1] shadow-xs'
                              : 'border-[#15370D]/20 bg-[#FFFFFF] hover:bg-[#F5EFE1]/40'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#15370D] border-[#15370D] text-[#FFFFFF]'
                                  : 'border-[#15370D]/40'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-semibold text-[#15370D]">
                              {addon.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#15370D] tabular-nums">
                            + ₹{addon.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                  Chef Preparation Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra hot, crispier base, dressing on side..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#15370D]/10 space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center border border-[#15370D]/30 rounded-xl bg-[#F5EFE1] flex-shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#15370D] hover:bg-[#FFFFFF] rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 sm:px-4 text-xs font-bold text-[#15370D] tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[#15370D] hover:bg-[#FFFFFF] rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {added ? 'Added to Basket' : `Add to Basket • ₹${totalItemPrice}`}
                  </span>
                </button>
              </div>

              <div className="flex items-center text-[11px] text-[#15370D]/70 space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15370D] flex-shrink-0" />
                <span>Prepared fresh to order in our verified hygienic kitchen.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Pairings */}
        {relatedItems.length > 0 && (
          <div className="space-y-5 sm:space-y-6 pt-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#15370D]">
              Recommended Culinary Pairings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedItems.map((r) => (
                <ProductCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
