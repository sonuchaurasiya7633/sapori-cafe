'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { AddOnOption, MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface AddOnModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export const AddOnModal: React.FC<AddOnModalProps> = ({ item, isOpen, onClose }) => {
  const { addItem } = useCart();
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAddOn = (addon: AddOnOption) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalItemPrice = (item.price + addOnsTotal) * quantity;

  const handleConfirm = () => {
    addItem(item, quantity, selectedAddOns, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Customise ${item.name}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#15370D]/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog / Mobile Bottom Sheet */}
      <div className="relative bg-[#FFFFFF] border border-[#15370D]/20 rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto pb-safe">
        <div className="flex items-start justify-between border-b border-[#15370D]/10 pb-3 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm border border-[#15370D] flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15370D]" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#15370D]">{item.name}</h3>
            </div>
            {item.description && (
              <p className="text-xs text-[#15370D]/75 mt-1 leading-relaxed">{item.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#15370D] hover:bg-[#F5EFE1] rounded-full transition-colors flex-shrink-0"
            aria-label="Close customisation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add-ons Selector */}
        {item.addOns && item.addOns.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Customise with Gourmet Add-ons:
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
                        ? 'border-[#15370D] bg-[#F5EFE1]'
                        : 'border-[#15370D]/20 bg-[#FFFFFF] hover:bg-[#F5EFE1]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-[#15370D] border-[#15370D] text-[#FFFFFF]' : 'border-[#15370D]/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-[#15370D]">{addon.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#15370D] tabular-nums">+ ₹{addon.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kitchen Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
            Special Culinary Requests (Optional):
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Extra crispy crust, less ice, or sauce on the side..."
            className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-lg p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
          />
        </div>

        {/* Actions & Price */}
        <div className="flex items-center justify-between pt-4 border-t border-[#15370D]/10 gap-3">
          <div className="flex items-center border border-[#15370D]/30 rounded-lg bg-[#F5EFE1] flex-shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#15370D] hover:bg-[#FFFFFF] rounded-l-lg"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 text-xs font-bold text-[#15370D] tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#15370D] hover:bg-[#FFFFFF] rounded-r-lg"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-transform active:scale-95 flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Add to Basket</span>
            <span>•</span>
            <span className="tabular-nums">₹{totalItemPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOnModal;
