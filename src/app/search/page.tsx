'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  X,
  Sparkles,
  Flame,
  SlidersHorizontal,
  Clock,
  History,
  TrendingUp,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { MenuItem, Category } from '@/types';
import ProductCard from '@/components/menu/ProductCard';

const POPULAR_SEARCHES = [
  'Margherita',
  'Cold Brew',
  'Truffle Mushroom',
  'Panuozzo',
  'Tiramisu',
  'Peri-Peri Frites',
  'Croissant',
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [signatureOnly, setSignatureOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sapori_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch menu and categories
  useEffect(() => {
    async function loadData() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/menu').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);
        if (menuRes.items) setAllItems(menuRes.items);
        if (catRes.categories) setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load search data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync URL query
  const updateQueryInUrl = (newQuery: string) => {
    const url = new URL(window.location.href);
    if (newQuery.trim()) {
      url.searchParams.set('q', newQuery.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateQueryInUrl(val);
  };

  const handleExecuteSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    updateQueryInUrl(searchTerm);

    if (searchTerm.trim()) {
      setRecentSearches((prev) => {
        const cleaned = searchTerm.trim();
        const filtered = prev.filter((s) => s.toLowerCase() !== cleaned.toLowerCase());
        const updated = [cleaned, ...filtered].slice(0, 6);
        try {
          localStorage.setItem('sapori_recent_searches', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    updateQueryInUrl('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('sapori_recent_searches');
    } catch {}
  };

  // Comprehensive multi-factor filtering
  const filteredResults = useMemo(() => {
    return allItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Dietary filters
        if (signatureOnly && !item.isSignature) return false;
        if (vegOnly && !item.isVegan) return false;
        if (spicyOnly && !item.isSpicy) return false;

        // Query text matching (Name, Description, Category, Add-ons)
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q) || false;
          const matchCat = item.category.toLowerCase().includes(q);
          const matchAddOn = (item.addOns || []).some((a) => a.name.toLowerCase().includes(q));

          if (!matchName && !matchDesc && !matchCat && !matchAddOn) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [allItems, query, selectedCategory, signatureOnly, vegOnly, spicyOnly, sortBy]);

  // Chef signature recommendations for empty state
  const chefSignatures = useMemo(() => {
    return allItems.filter((i) => i.isSignature).slice(0, 3);
  }, [allItems]);

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            Artisanal Culinary Explorer
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#15370D]">
            Search Dishes & Coffee
          </h1>
          <p className="text-xs sm:text-sm text-[#15370D]/75 leading-relaxed">
            Discover 48-hour fermented Neapolitan pizzas, artisan panuozzo, craft cold brews, and comforting Italian bakery pairings.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#15370D]/50" />
            <input
              type="text"
              placeholder="Search pizzas, cold brews, frites, toasts..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteSearch(query);
              }}
              className="w-full pl-12 pr-11 py-3.5 bg-[#FFFFFF] border-2 border-[#15370D]/20 rounded-2xl text-xs sm:text-sm text-[#15370D] font-medium focus:outline-none focus:border-[#15370D] focus:ring-2 focus:ring-[#15370D]/10 shadow-sm transition-all"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F5EFE1] text-[#15370D] flex items-center justify-center hover:bg-[#15370D] hover:text-[#FFFFFF] transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Suggestions & Recent Searches */}
          <div className="space-y-2 text-xs">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#15370D]">
                <div className="flex items-center space-x-1 opacity-60 mr-1">
                  <History className="w-3 h-3" />
                  <span>Recent:</span>
                </div>
                {recentSearches.map((rec) => (
                  <button
                    key={rec}
                    onClick={() => handleExecuteSearch(rec)}
                    className="px-2 py-0.5 rounded-lg bg-[#FFFFFF] border border-[#15370D]/15 hover:border-[#15370D]/40 text-[#15370D] font-semibold transition-colors"
                  >
                    {rec}
                  </button>
                ))}
                <button
                  onClick={clearRecentSearches}
                  className="text-[10px] text-[#15370D]/50 hover:underline ml-1"
                >
                  Clear history
                </button>
              </div>
            )}

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#15370D]">
              <div className="flex items-center space-x-1 opacity-60 mr-1">
                <TrendingUp className="w-3 h-3" />
                <span>Trending:</span>
              </div>
              {POPULAR_SEARCHES.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleExecuteSearch(sug)}
                  className="px-2.5 py-0.5 rounded-lg bg-[#F5EFE1] border border-[#15370D]/20 hover:bg-[#15370D] hover:text-[#FFFFFF] text-[#15370D] font-semibold transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Category Horizontal Scrolling Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#15370D] text-[#FFFFFF] shadow-2xs'
                  : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
              }`}
            >
              All Items ({allItems.length})
            </button>
            {categories.map((cat) => {
              const count = allItems.filter((i) => i.category === cat.slug).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-[#15370D] text-[#FFFFFF] shadow-2xs'
                      : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Dietary & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[#15370D]/10 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSignatureOnly(!signatureOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                  signatureOnly
                    ? 'bg-[#15370D] text-[#FFFFFF] border-[#15370D]'
                    : 'bg-[#FFFFFF] text-[#15370D] border-[#15370D]/20 hover:bg-[#F5EFE1]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Signatures Only</span>
              </button>

              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                  vegOnly
                    ? 'bg-[#15370D] text-[#FFFFFF] border-[#15370D]'
                    : 'bg-[#FFFFFF] text-[#15370D] border-[#15370D]/20 hover:bg-[#F5EFE1]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#15370D]" />
                <span>Vegan Only</span>
              </button>

              <button
                onClick={() => setSpicyOnly(!spicyOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                  spicyOnly
                    ? 'bg-[#15370D] text-[#FFFFFF] border-[#15370D]'
                    : 'bg-[#FFFFFF] text-[#15370D] border-[#15370D]/20 hover:bg-[#F5EFE1]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Spicy Only</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#15370D]/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F5EFE1] border border-[#15370D]/20 rounded-xl py-1.5 px-3 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              >
                <option value="default">Default Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-[#15370D]">
          <h2 className="font-bold uppercase tracking-wider text-xs sm:text-sm">
            {query.trim()
              ? `Results for "${query.trim()}" (${filteredResults.length})`
              : `All Dishes & Beverages (${filteredResults.length})`}
          </h2>
          {(query || selectedCategory !== 'all' || signatureOnly || vegOnly || spicyOnly) && (
            <button
              onClick={() => {
                setQuery('');
                updateQueryInUrl('');
                setSelectedCategory('all');
                setSignatureOnly(false);
                setVegOnly(false);
                setSpicyOnly(false);
                setSortBy('default');
              }}
              className="font-bold underline hover:opacity-80"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
              Searching Menu Catalog...
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#F5EFE1] text-[#15370D] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 opacity-40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[#15370D]">
                No Culinary Creations Match "{query}"
              </h3>
              <p className="text-xs text-[#15370D]/70 max-w-md mx-auto leading-relaxed">
                We couldn't find exact matches for your search. Try adjusting keywords or explore our chef's recommended signature creations below.
              </p>
            </div>

            <button
              onClick={handleClearSearch}
              className="bg-[#15370D] text-[#FFFFFF] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90 transition-colors shadow-xs"
            >
              View Full Menu
            </button>

            {/* Chef's Signature Recommendations */}
            {chefSignatures.length > 0 && (
              <div className="pt-8 border-t border-[#15370D]/10 text-left space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block text-center">
                  Chef's Signature Recommendations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {chefSignatures.map((sig) => (
                    <ProductCard key={sig.id} item={sig} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredResults.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-[#15370D] font-bold">
          Connecting to Search Index...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
