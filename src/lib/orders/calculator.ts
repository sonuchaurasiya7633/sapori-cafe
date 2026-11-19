import { CartItem, Coupon, OrderMode, SiteSettings } from '@/types';

export interface OrderFinancials {
  subtotal: number;
  discount: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
  discountBreakdown?: string;
}

export function calculateOrderTotals(
  items: CartItem[],
  mode: OrderMode,
  settings: SiteSettings,
  appliedCoupon?: Coupon | null
): OrderFinancials {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      packagingFee: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
    };
  }

  // 1. Calculate items subtotal
  const subtotal = items.reduce((acc, item) => {
    const addOnsTotal = (item.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
    const itemTotal = (item.price + addOnsTotal) * item.quantity;
    return acc + itemTotal;
  }, 0);

  // 2. Validate and apply coupon
  let discount = 0;
  let discountBreakdown = '';
  if (appliedCoupon && appliedCoupon.isActive && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'percentage') {
      const calculatedDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && calculatedDiscount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
        discountBreakdown = `${appliedCoupon.discountValue}% off capped at ₹${appliedCoupon.maxDiscount}`;
      } else {
        discount = calculatedDiscount;
        discountBreakdown = `${appliedCoupon.discountValue}% off (-₹${discount})`;
      }
    } else if (appliedCoupon.discountType === 'fixed') {
      discount = Math.min(appliedCoupon.discountValue, subtotal);
      discountBreakdown = `Flat ₹${discount} off`;
    }
  }

  // 3. Packaging fee
  let packagingFee = 0;
  if (mode === 'delivery' || mode === 'pickup') {
    packagingFee = settings.packagingFee || 0;
  }

  // 4. Delivery fee
  let deliveryFee = 0;
  if (mode === 'delivery') {
    if (subtotal >= settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = settings.deliveryFee || 0;
    }
  }

  // 5. Tax (GST)
  const taxableAmount = Math.max(0, subtotal - discount);
  const gstRate = (settings.gstRatePercent || 5) / 100;
  const tax = Math.round(taxableAmount * gstRate);

  // 6. Final grand total in INR
  const total = Math.max(0, taxableAmount + packagingFee + deliveryFee + tax);

  return {
    subtotal,
    discount,
    packagingFee,
    deliveryFee,
    tax,
    total,
    discountBreakdown,
  };
}
