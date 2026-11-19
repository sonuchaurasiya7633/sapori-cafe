'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Flame, Plus, Check, UtensilsCrossed } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import AddOnModal from './AddOnModal';

interface ProductCardProps {
  item: MenuItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const hasAddOns = item.addOns && item.addOns.length > 0;

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasAddOns) {
      setIsModalOpen(true);
    } else {
      addItem(item, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#15370D]/40 transition-all shadow-sm hover:shadow-md group h-full">
        <div>
          {/* Dish Image (when available) */}
          {item.image ? (
            <Link
              href={`/menu/${item.slug}`}
              className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-3.5 block bg-[#F5EFE1] border border-[#15370D]/10 group-hover:border-[#15370D]/30 transition-all"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
          ) : null}

          {/* Top Indicators Bar */}
          <div className="flex items-center justify-between mb-3 gap-1">
            {/* Veg Badge */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <span className="w-4 h-4 border border-[#15370D] rounded-sm flex items-center justify-center p-0.5">
                <span className="w-2 h-2 rounded-full bg-[#15370D]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/75">
                {item.isVegan ? 'VEGAN' : 'VEG'}
              </span>
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-1.5 flex-wrap justify-end gap-y-1">
              {item.isSignature && (
                <span className="bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-[#15370D]" />
                  Signature
                </span>
              )}
              {item.isSpicy && (
                <span className="bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center shadow-xs">
                  <Flame className="w-2.5 h-2.5 mr-1 text-[#15370D]" />
                  Spicy
                </span>
              )}
            </div>
          </div>

          {/* Dish Title */}
          <Link href={`/menu/${item.slug}`} className="block group-hover:opacity-90">
            <h3 className="text-sm sm:text-base font-bold text-[#15370D] tracking-tight group-hover:underline leading-snug">
              {item.name}
            </h3>
          </Link>

          {/* Description */}
          {item.description ? (
            <p className="text-xs text-[#15370D]/70 mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-4 mt-3 border-t border-[#15370D]/10 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#15370D]/60 uppercase tracking-widest font-bold">
              Price
            </span>
            <span className="text-base sm:text-lg font-black text-[#15370D] tracking-tight tabular-nums">
              ₹{item.price}
            </span>
          </div>

          <button
            onClick={handleAddClick}
            disabled={!item.isAvailable}
            className={`min-h-[38px] px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all ${
              !item.isAvailable
                ? 'bg-[#F5EFE1] text-[#15370D]/50 cursor-not-allowed border border-[#15370D]/20'
                : justAdded
                ? 'bg-[#15370D] text-[#FFFFFF]'
                : 'bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 active:scale-95 shadow-sm'
            }`}
            aria-label={
              !item.isAvailable
                ? `${item.name} is Sold Out`
                : hasAddOns
                ? `Customise ${item.name}`
                : `Add ${item.name} to basket`
            }
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : !item.isAvailable ? (
              <span>Sold Out</span>
            ) : hasAddOns ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Customise</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {hasAddOns && (
        <AddOnModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
