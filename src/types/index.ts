export type OrderMode = 'pickup' | 'delivery' | 'dine_in';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'READY_TO_SERVE'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type PaymentMethod = 'razorpay' | 'cash_counter' | 'upi_counter' | 'sandbox_simulated';

export interface AddOnOption {
  id: string;
  name: string;
  price: number; // in INR
}

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // in INR
  originalImportedPrice?: number;
  offerPrice?: number;
  category: string;
  subcategory?: string;
  image?: string;
  cloudinaryPublicId?: string;
  isVeg: boolean;
  isVegan?: boolean;
  isSignature: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  prepTimeMinutes?: number;
  rating?: number;
  displayPriority?: number;
  addOns?: AddOnOption[];
  ingredients?: string[];
  tags?: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  displayPriority: number;
}

export interface CartItem {
  id: string; // unique item id including add-on hash
  menuItemId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  selectedAddOns: AddOnOption[];
  notes?: string;
  image?: string;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  deliveryNotes?: string;
  tableNumber?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  actor: 'customer' | 'admin' | 'kitchen' | 'system';
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderMode: OrderMode;
  items: CartItem[];
  subtotal: number;
  tax: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
  };
  customer: OrderCustomerInfo;
  notes?: string;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TableReservation {
  id: string;
  bookingRef: string;
  guestName: string;
  phone: string;
  email?: string;
  guestsCount: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "07:00 PM"
  tableNumber?: string;
  occasion?: string;
  specialRequests?: string;
  adminNotes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  updatedAt: string;
}

export interface DiningTable {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: string;
  isActive: boolean;
  qrCodeUrl: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  description: string;
  expiryDate?: string;
}

export interface CustomerReview {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedOrder: boolean;
  createdAt: string;
  isApproved: boolean;
  adminReply?: string;
}

export interface SiteSettings {
  brandName: string;
  brandTagline: string;
  secondaryBrandLine: string;
  address: string;
  contactPhone: string;
  whatsappNumber: string;
  email?: string;
  operatingHours: string;
  deliveryActive: boolean;
  pickupActive: boolean;
  dineInActive: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  packagingFee: number;
  gstRatePercent: number; // default 5% for restaurant or configurable
  announcementText?: string;
  minOrderValue?: number;
  deliveryRadiusKm?: number;
  estimatedDeliveryTime?: string;
  estimatedPickupTime?: string;
  isKitchenAcceptingOrders?: boolean;
  instagramUrl?: string;
  googleMapsUrl?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  footerImageUrl?: string;
  footerBannerUrl?: string;
}

export interface CMSPageSection {
  id: string;
  name: string;
  isVisible: boolean;
  fields: Record<string, any>;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isPublished: boolean;
  updatedAt: string;
  sections: CMSPageSection[];
}

export interface CMSMediaAsset {
  id: string;
  url: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  uploadedAt: string;
  altText?: string;
}
