'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Check, Trash2, Percent, IndianRupee } from 'lucide-react';
import { Coupon } from '@/types';
import { toast } from '@/lib/toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCoupons = () => {
    fetch('/api/coupons')
      .then((r) => r.json())
      .then((data) => {
        if (data.coupons) setCoupons(data.coupons);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.warning('Please enter coupon code and discount value');
      return;
    }

    setSubmitting(true);
    toast.loading('Creating promo coupon...');
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          description: description.trim(),
        }),
      });
      if (res.ok) {
        toast.dismiss();
        toast.success(`Coupon ${code.toUpperCase()} created successfully!`);
        setCode('');
        setDiscountValue('');
        setMinOrderValue('');
        setMaxDiscount('');
        setDescription('');
        loadCoupons();
      } else {
        const data = await res.json();
        toast.dismiss();
        toast.error(data.error || 'Failed to create coupon');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Network error creating coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Promotions & Growth
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Discount Coupons & Offers
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Manage checkout promo codes applied during guest ordering
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Coupon Card */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs h-fit">
          <div className="border-b border-[#15370D]/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              New Promo Code
            </h2>
            <p className="text-[11px] text-[#15370D]/60 mt-0.5">Create a discount offer</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. WELCOME50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs font-mono font-bold uppercase text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Type *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  placeholder={discountType === 'percentage' ? 'e.g. 15' : 'e.g. 100'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Min Order (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 499"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Max Cap (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                Description / Terms
              </label>
              <textarea
                rows={2}
                placeholder="Valid on orders above ₹499. Cannot be combined with other offers."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Creating...' : 'Activate Coupon'}</span>
            </button>
          </form>
        </div>

        {/* Existing Coupons Grid */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Active Coupons ({coupons.length})
            </h2>
            <span className="text-[10px] text-[#15370D]/60 font-mono">Live on Checkout</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-[#15370D]/70">
              Loading Coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#15370D]/60">
              No promotional coupons active. Create one using the form.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/15 flex flex-col justify-between space-y-3 text-xs text-[#15370D]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-base font-black tracking-wider bg-[#15370D] text-[#FFFFFF] px-2.5 py-1 rounded-lg inline-block">
                        {c.code}
                      </span>
                      <p className="text-xs font-bold text-[#15370D] mt-2">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% Off`
                          : `Flat ₹${c.discountValue} Off`}
                      </p>
                    </div>

                    <span className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Active
                    </span>
                  </div>

                  {c.description && (
                    <p className="text-[11px] text-[#15370D]/70 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#15370D]/10 text-[10px] text-[#15370D]/60 space-y-0.5">
                    {c.minOrderValue ? (
                      <div>Min order: ₹{c.minOrderValue}</div>
                    ) : (
                      <div>No minimum order</div>
                    )}
                    {c.maxDiscount && <div>Max discount cap: ₹{c.maxDiscount}</div>}
                    <div>Status: Live on Guest Checkout</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
