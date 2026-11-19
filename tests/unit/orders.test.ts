import { describe, it, expect } from 'vitest';
import { calculateOrderTotals } from '../../src/lib/orders/calculator';
import { canTransitionOrder } from '../../src/lib/orders/stateMachine';
import { CartItem, Coupon, SiteSettings } from '../../src/types';
import { DEFAULT_SITE_SETTINGS } from '../../src/data/seedMenu';

describe('Order Financial Calculations', () => {
  const dummyItem1: CartItem = {
    id: 'item-1',
    menuItemId: 'item-pizza-1',
    slug: 'classic-neapolitan-margherita',
    name: 'Classic Neapolitan Margherita',
    price: 395,
    quantity: 2,
    selectedAddOns: [
      { id: 'addon-mozzarella', name: 'Fresh Mozzarella Cheese', price: 65 },
    ],
  };

  it('correctly calculates subtotal including add-ons across quantities', () => {
    // Each item: 395 + 65 = 460. For 2 items: 920.
    const result = calculateOrderTotals([dummyItem1], 'pickup', DEFAULT_SITE_SETTINGS);
    expect(result.subtotal).toBe(920);
    // Packaging fee for pickup is 25
    expect(result.packagingFee).toBe(25);
    // Pickup delivery fee is 0
    expect(result.deliveryFee).toBe(0);
    // Tax: 5% on 920 = 46
    expect(result.tax).toBe(46);
    // Total: 920 + 25 + 46 = 991
    expect(result.total).toBe(991);
  });

  it('correctly applies percentage coupon with cap', () => {
    const coupon: Coupon = {
      id: 'c1',
      code: 'SAPORI10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 499,
      maxDiscount: 50,
      isActive: true,
      description: '10% off capped at 50',
    };

    const result = calculateOrderTotals([dummyItem1], 'pickup', DEFAULT_SITE_SETTINGS, coupon);
    // Subtotal 920, 10% is 92, capped at 50
    expect(result.discount).toBe(50);
    // Taxable: 920 - 50 = 870. 5% tax = 43.5 -> 44
    expect(result.tax).toBe(44);
    // Total: 870 + 25 (pkg) + 44 (tax) = 939
    expect(result.total).toBe(939);
  });

  it('waives delivery fee when order exceeds free delivery threshold', () => {
    const result = calculateOrderTotals([dummyItem1], 'delivery', DEFAULT_SITE_SETTINGS);
    // Subtotal is 920 >= 599 threshold, so delivery fee is 0
    expect(result.deliveryFee).toBe(0);
  });

  it('charges delivery fee when below threshold', () => {
    const smallItem: CartItem = {
      id: 'item-2',
      menuItemId: 'item-frites-1',
      slug: 'classic-salted-fries',
      name: 'Classic Salted Fries',
      price: 149,
      quantity: 1,
      selectedAddOns: [],
    };
    const result = calculateOrderTotals([smallItem], 'delivery', DEFAULT_SITE_SETTINGS);
    expect(result.subtotal).toBe(149);
    expect(result.deliveryFee).toBe(49);
  });
});

describe('Order State Machine Transitions', () => {
  it('allows valid standard flow for pickup', () => {
    expect(canTransitionOrder('PLACED', 'ACCEPTED', 'pickup').allowed).toBe(true);
    expect(canTransitionOrder('ACCEPTED', 'PREPARING', 'pickup').allowed).toBe(true);
    expect(canTransitionOrder('PREPARING', 'READY_FOR_PICKUP', 'pickup').allowed).toBe(true);
    expect(canTransitionOrder('READY_FOR_PICKUP', 'COMPLETED', 'pickup').allowed).toBe(true);
  });

  it('prevents illegal transitions', () => {
    // Cannot jump from PLACED directly to COMPLETED
    expect(canTransitionOrder('PLACED', 'COMPLETED', 'pickup').allowed).toBe(false);
    // Cannot transition from COMPLETED to PREPARING
    expect(canTransitionOrder('COMPLETED', 'PREPARING', 'pickup').allowed).toBe(false);
  });

  it('enforces mode-specific ready states', () => {
    // Pickup cannot transition to OUT_FOR_DELIVERY
    expect(canTransitionOrder('PREPARING', 'OUT_FOR_DELIVERY', 'pickup').allowed).toBe(false);
    // Dine-in cannot transition to READY_FOR_PICKUP
    expect(canTransitionOrder('PREPARING', 'READY_FOR_PICKUP', 'dine_in').allowed).toBe(false);
    // Delivery can transition to OUT_FOR_DELIVERY
    expect(canTransitionOrder('PREPARING', 'OUT_FOR_DELIVERY', 'delivery').allowed).toBe(true);
  });
});
