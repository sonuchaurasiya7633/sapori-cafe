'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AddOnOption, CartItem, Coupon, MenuItem, OrderMode, SiteSettings } from '@/types';
import { calculateOrderTotals, OrderFinancials } from '@/lib/orders/calculator';
import { DEFAULT_SITE_SETTINGS } from '@/data/seedMenu';
import { toast } from '@/lib/toast';

interface CartContextType {
  items: CartItem[];
  orderMode: OrderMode;
  tableNumber: string;
  appliedCoupon: Coupon | null;
  settings: SiteSettings;
  financials: OrderFinancials;
  isCartOpen: boolean;
  itemCount: number;
  addItem: (item: MenuItem, quantity?: number, selectedAddOns?: AddOnOption[], notes?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  setOrderMode: (mode: OrderMode) => void;
  setTableNumber: (tbl: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<OrderMode>('pickup');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedItems = localStorage.getItem('sapori_cart');
      if (savedItems) setItems(JSON.parse(savedItems));

      const savedMode = localStorage.getItem('sapori_ordermode') as OrderMode;
      if (savedMode) setOrderMode(savedMode);

      const savedTable = localStorage.getItem('sapori_table');
      if (savedTable) {
        setTableNumber(savedTable);
        setOrderMode('dine_in');
      }

      // Fetch live settings
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.brandName) setSettings(data);
        })
        .catch(() => {});
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('sapori_cart', JSON.stringify(items));
      localStorage.setItem('sapori_ordermode', orderMode);
      if (tableNumber) {
        localStorage.setItem('sapori_table', tableNumber);
      }
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items, orderMode, tableNumber, mounted]);

  const generateCartItemId = (menuItemId: string, selectedAddOns: AddOnOption[] = []): string => {
    const addOnIds = selectedAddOns.map((a) => a.id).sort().join('_');
    return `${menuItemId}${addOnIds ? '-' + addOnIds : ''}`;
  };

  const addItem = (
    item: MenuItem,
    quantity = 1,
    selectedAddOns: AddOnOption[] = [],
    notes = ''
  ) => {
    const cartItemId = generateCartItemId(item.id, selectedAddOns);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + quantity, notes: notes || i.notes } : i
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menuItemId: item.id,
          slug: item.slug,
          name: item.name,
          price: item.price,
          quantity,
          selectedAddOns,
          notes,
          image: item.image,
        },
      ];
    });
    setIsCartOpen(true);
    toast.success(`Added to Basket: ${item.name}`, {
      description: `Qty: ${quantity} • ₹${item.price * quantity}`,
    });
  };

  const removeItem = (cartItemId: string) => {
    const itemToRemove = items.find((i) => i.id === cartItemId);
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    if (itemToRemove) {
      toast.info(`Removed ${itemToRemove.name} from basket`);
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.coupon) {
        const msg = data.error || 'Invalid or expired promo code.';
        toast.error(msg);
        return { success: false, message: msg };
      }

      const coupon: Coupon = data.coupon;
      const currentSubtotal = items.reduce((acc, itm) => {
        const addOnsPrice = (itm.selectedAddOns || []).reduce((s, a) => s + a.price, 0);
        return acc + (itm.price + addOnsPrice) * itm.quantity;
      }, 0);

      if (currentSubtotal < coupon.minOrderValue) {
        const msg = `Minimum order value for ${coupon.code} is ₹${coupon.minOrderValue}.`;
        toast.warning(msg);
        return {
          success: false,
          message: msg,
        };
      }

      setAppliedCoupon(coupon);
      const successMsg = `Promo code ${coupon.code} applied successfully!`;
      toast.success(successMsg);
      return { success: true, message: successMsg };
    } catch {
      const errMsg = 'Could not validate promo code.';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon code removed.');
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('sapori_cart');
    } catch {}
  };

  const financials = calculateOrderTotals(items, orderMode, settings, appliedCoupon);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        orderMode,
        tableNumber,
        appliedCoupon,
        settings,
        financials,
        isCartOpen,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        setOrderMode,
        setTableNumber,
        applyCoupon,
        removeCoupon,
        clearCart,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
