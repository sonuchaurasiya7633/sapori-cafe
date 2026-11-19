'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, Flame, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { MenuItem, Category } from '@/types';
import ProductCard from '@/components/menu/ProductCard';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [signatureOnly, setSignatureOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/menu').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);
        if (menuRes.items) setItems(menuRes.items);
        if (catRes.categories) setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load menu data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        if (signatureOnly && !item.isSignature) {
          return false;
        }
        if (spicyOnly && !item.isSpicy) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [items, selectedCategory, signatureOnly, spicyOnly, searchQuery, sortBy]);

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            Artisanal Food & Coffee
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#15370D]">
            Sapori Full Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#15370D]/75 max-w-xl mx-auto leading-relaxed">
            Slow-fermented Neapolitan pizzas, artisan panuozzo, craft cold brews, and comforting Italian bakery pairings.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#15370D]/50" />
              <input
                type="text"
                placeholder="Search pizzas, cold brews, frites, toasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            {/* Price Sort */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-[#15370D] flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full md:w-auto bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl py-2.5 px-3 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#15370D]/10">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#15370D]/60 mr-1">
              Quick Filter:
            </span>
            <button
              onClick={() => setSignatureOnly(!signatureOnly)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center transition-all min-h-[32px] ${
                signatureOnly
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 hover:bg-[#FFFFFF]'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Signatures Only
            </button>

            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center transition-all min-h-[32px] ${
                spicyOnly
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 hover:bg-[#FFFFFF]'
              }`}
            >
              <Flame className="w-3 h-3 mr-1" />
              Spicy Picks
            </button>

            {(signatureOnly || spicyOnly || searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSignatureOnly(false);
                  setSpicyOnly(false);
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#15370D] underline ml-auto hover:opacity-80 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Scroll Bar with Touch Momentum */}
        <div className="relative">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 min-h-[38px] ${
                selectedCategory === 'all'
                  ? 'bg-[#15370D] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#15370D] border border-[#15370D]/20 hover:bg-[#F5EFE1]'
              }`}
            >
              All Items ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 min-h-[38px] ${
                    isSelected
                      ? 'bg-[#15370D] text-[#FFFFFF] shadow-sm'
                      : 'bg-[#FFFFFF] text-[#15370D] border border-[#15370D]/20 hover:bg-[#F5EFE1]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#15370D]/10 rounded-2xl p-5 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 sm:p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-[#15370D]">No dishes match your selection</h3>
            <p className="text-xs text-[#15370D]/70 max-w-sm mx-auto">
              Try adjusting your dietary filters, searching for another keyword, or resetting category tabs.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSignatureOnly(false);
                setSpicyOnly(false);
                setSearchQuery('');
              }}
              className="mt-2 bg-[#15370D] text-[#FFFFFF] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[40px]"
            >
              View All Dishes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-[#15370D] font-bold">
          Loading Sapori Menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
