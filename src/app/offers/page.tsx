'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Copy, Check, ArrowRight } from 'lucide-react';
import { Coupon } from '@/types';

export default function OffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons) setCoupons(data.coupons);
      });
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            Promotions & Perks
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#15370D]">
            Offers & Promo Codes
          </h1>
          <p className="text-xs sm:text-sm text-[#15370D]/80 leading-relaxed">
            Enjoy exclusive rewards on handcrafted pizzas, cold brews, and comforting Italian bakery pairings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-[#FFFFFF] border-2 border-dashed border-[#15370D]/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-5 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : `FLAT ₹${coupon.discountValue} OFF`}
                  </span>
                  <span className="text-[11px] text-[#15370D]/60 font-medium whitespace-nowrap">
                    Min: ₹{coupon.minOrderValue}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#15370D] font-mono tracking-wider">
                  {coupon.code}
                </h3>

                <p className="text-xs text-[#15370D]/75 leading-relaxed">
                  {coupon.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#15370D]/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="bg-[#F5EFE1] border border-[#15370D]/30 hover:bg-[#FFFFFF] text-[#15370D] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors min-h-[38px]"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <Link
                  href="/menu"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] underline py-1"
                >
                  <span>Redeem</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
