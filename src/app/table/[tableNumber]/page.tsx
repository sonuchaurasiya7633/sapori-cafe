'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Utensils, ArrowRight, Bell, Sparkles, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/types';
import ProductCard from '@/components/menu/ProductCard';

export default function TableOrderingPage() {
  const params = useParams();
  const tableNumber = params.tableNumber as string;
  const router = useRouter();
  const { setTableNumber, setOrderMode } = useCart();

  const [assistanceRequested, setAssistanceRequested] = useState(false);
  const [popularDishes, setPopularDishes] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
      setOrderMode('dine_in');
    }

    fetch('/api/menu?signature=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setPopularDishes(data.items.slice(0, 6));
      })
      .catch(() => {});
  }, [tableNumber, setTableNumber, setOrderMode]);

  const handleCallStaff = () => {
    setAssistanceRequested(true);
    setTimeout(() => setAssistanceRequested(false), 5000);
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Table Banner */}
        <div className="bg-[#FFFFFF] border-2 border-[#15370D] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center space-x-2 bg-[#F5EFE1] border border-[#15370D]/20 px-3.5 py-1 rounded-full">
            <Utensils className="w-3.5 h-3.5 text-[#15370D]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#15370D]">
              Table #{tableNumber} Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#15370D]">
            Welcome to Sapori Café
          </h1>

          <p className="text-xs sm:text-sm text-[#15370D]/80 max-w-lg mx-auto">
            Browse our menu, customize your Neapolitan pizza and specialty cold brew, and order directly to our kitchen from your table.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/menu"
              className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-6 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleCallStaff}
              className="bg-[#FFFFFF] text-[#15370D] border border-[#15370D] hover:bg-[#F5EFE1] px-6 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>{assistanceRequested ? 'Server Notified!' : 'Call Server to Table'}</span>
            </button>
          </div>

          {assistanceRequested && (
            <div className="bg-[#F5EFE1] border border-[#15370D]/30 p-2.5 rounded text-xs text-[#15370D] font-bold flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-[#15370D]" />
              <span>Our hospitality staff has been notified to assist Table #{tableNumber}.</span>
            </div>
          )}
        </div>

        {/* Popular Table Picks */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#15370D]" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#15370D]">
              Popular Table Orders
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDishes.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
