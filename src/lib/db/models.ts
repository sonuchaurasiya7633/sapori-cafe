import mongoose, { Schema, Model } from 'mongoose';
import {
  MenuItem,
  Category,
  Order,
  TableReservation,
  DiningTable,
  Coupon,
  CustomerReview,
  SiteSettings,
  CMSPage,
  AdminUser,
} from '@/types';

// ==========================================
// 1. MENU ITEM SCHEMA
// ==========================================
const AddOnOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<MenuItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalImportedPrice: { type: Number },
    offerPrice: { type: Number },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    image: { type: String },
    cloudinaryPublicId: { type: String },
    isVeg: { type: Boolean, default: true },
    isVegan: { type: Boolean, default: false },
    isSignature: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    prepTimeMinutes: { type: Number, default: 15 },
    rating: { type: Number, default: 5 },
    displayPriority: { type: Number, default: 10 },
    addOns: [AddOnOptionSchema],
    ingredients: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// ==========================================
// 2. CATEGORY SCHEMA
// ==========================================
const CategorySchema = new Schema<Category>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String },
    displayPriority: { type: Number, default: 10 },
  },
  { timestamps: true }
);

// ==========================================
// 3. ORDER SCHEMA
// ==========================================
const CartItemSchema = new Schema(
  {
    id: { type: String, required: true },
    menuItemId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedAddOns: [AddOnOptionSchema],
    notes: { type: String },
    image: { type: String },
    cloudinaryPublicId: { type: String },
  },
  { _id: false }
);

const OrderCustomerInfoSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    deliveryNotes: { type: String },
    tableNumber: { type: String },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
    actor: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<Order>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    orderMode: { type: String, required: true },
    items: [CartItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    packagingFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    status: { type: String, required: true, index: true },
    paymentStatus: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentDetails: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      paidAt: { type: String },
    },
    customer: { type: OrderCustomerInfoSchema, required: true },
    notes: { type: String },
    statusHistory: [OrderStatusHistorySchema],
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

// ==========================================
// 4. RESERVATION SCHEMA
// ==========================================
const TableReservationSchema = new Schema<TableReservation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    bookingRef: { type: String, required: true, unique: true, index: true },
    guestName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    guestsCount: { type: Number, required: true },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    tableNumber: { type: String },
    occasion: { type: String },
    specialRequests: { type: String },
    adminNotes: { type: String },
    status: { type: String, required: true, default: 'CONFIRMED', index: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

// ==========================================
// 5. DINING TABLE SCHEMA
// ==========================================
const DiningTableSchema = new Schema<DiningTable>(
  {
    id: { type: String, required: true, unique: true, index: true },
    tableNumber: { type: String, required: true, unique: true, index: true },
    capacity: { type: Number, required: true },
    status: { type: String, default: 'available' },
    currentOrderId: { type: String },
    isActive: { type: Boolean, default: true },
    qrCodeUrl: { type: String, required: true },
  },
  { timestamps: true }
);

// ==========================================
// 6. COUPON SCHEMA
// ==========================================
const CouponSchema = new Schema<Coupon>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    discountType: { type: String, required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    isActive: { type: Boolean, default: true },
    description: { type: String, required: true },
    expiryDate: { type: String },
  },
  { timestamps: true }
);

// ==========================================
// 7. CUSTOMER REVIEW SCHEMA
// ==========================================
const CustomerReviewSchema = new Schema<CustomerReview>(
  {
    id: { type: String, required: true, unique: true, index: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    verifiedOrder: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true, index: true },
    adminReply: { type: String },
    createdAt: { type: String, required: true },
  },
  { timestamps: true }
);

// ==========================================
// 8. SITE SETTINGS SCHEMA
// ==========================================
const SiteSettingsSchema = new Schema<SiteSettings>(
  {
    brandName: { type: String, required: true },
    brandTagline: { type: String, required: true },
    secondaryBrandLine: { type: String, required: true },
    address: { type: String, required: true },
    contactPhone: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    email: { type: String },
    operatingHours: { type: String, required: true },
    deliveryActive: { type: Boolean, default: true },
    pickupActive: { type: Boolean, default: true },
    dineInActive: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 40 },
    freeDeliveryThreshold: { type: Number, default: 599 },
    packagingFee: { type: Number, default: 25 },
    gstRatePercent: { type: Number, default: 5 },
    announcementText: { type: String },
    minOrderValue: { type: Number, default: 150 },
    deliveryRadiusKm: { type: Number, default: 10 },
    estimatedDeliveryTime: { type: String, default: '35-45 mins' },
    estimatedPickupTime: { type: String, default: '15-20 mins' },
    isKitchenAcceptingOrders: { type: Boolean, default: true },
    instagramUrl: { type: String },
    googleMapsUrl: { type: String },
    logoUrl: { type: String },
    heroImageUrl: { type: String },
    footerImageUrl: { type: String },
    footerBannerUrl: { type: String },
  },
  { timestamps: true }
);

// ==========================================
// 9. CMS PAGE SCHEMA
// ==========================================
const CMSPageSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
    fields: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const CMSPageSchema = new Schema<CMSPage>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
    isPublished: { type: Boolean, default: true, index: true },
    updatedAt: { type: String, required: true },
    sections: [CMSPageSectionSchema],
  },
  { timestamps: true }
);

// ==========================================
// 10. AUDIT LOG SCHEMA
// ==========================================
const AuditLogSchema = new Schema(
  {
    timestamp: { type: String, required: true },
    action: { type: String, required: true },
    actor: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// ==========================================
// MODEL EXPORTS (Prevent Mongoose OverwriteModelError)
// ==========================================
export const MenuItemModel: Model<MenuItem> =
  mongoose.models.MenuItem || mongoose.model<MenuItem>('MenuItem', MenuItemSchema);

export const CategoryModel: Model<Category> =
  mongoose.models.Category || mongoose.model<Category>('Category', CategorySchema);

export const OrderModel: Model<Order> =
  mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema);

export const TableReservationModel: Model<TableReservation> =
  mongoose.models.TableReservation ||
  mongoose.model<TableReservation>('TableReservation', TableReservationSchema);

export const DiningTableModel: Model<DiningTable> =
  mongoose.models.DiningTable || mongoose.model<DiningTable>('DiningTable', DiningTableSchema);

export const CouponModel: Model<Coupon> =
  mongoose.models.Coupon || mongoose.model<Coupon>('Coupon', CouponSchema);

export const CustomerReviewModel: Model<CustomerReview> =
  mongoose.models.CustomerReview ||
  mongoose.model<CustomerReview>('CustomerReview', CustomerReviewSchema);

export const SiteSettingsModel: Model<SiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<SiteSettings>('SiteSettings', SiteSettingsSchema);

export const CMSPageModel: Model<CMSPage> =
  mongoose.models.CMSPage || mongoose.model<CMSPage>('CMSPage', CMSPageSchema);

// ==========================================
// 11. ADMIN USER SCHEMA
// ==========================================
const AdminUserSchema = new Schema<AdminUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, default: 'Sapori Manager' },
    role: { type: String, default: 'SUPER_ADMIN' },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminUserModel: Model<AdminUser> =
  mongoose.models.AdminUser || mongoose.model<AdminUser>('AdminUser', AdminUserSchema);

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
