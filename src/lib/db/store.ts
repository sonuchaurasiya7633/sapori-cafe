import fs from 'fs';
import path from 'path';
import {
  Category,
  CMSPage,
  Coupon,
  CustomerReview,
  DiningTable,
  MenuItem,
  Order,
  OrderStatus,
  PaymentStatus,
  SiteSettings,
  TableReservation,
  AdminUser,
} from '@/types';
import {
  DEFAULT_SITE_SETTINGS,
  SEED_CATEGORIES,
  SEED_MENU_ITEMS,
} from '@/data/seedMenu';
import { SEED_CMS_PAGES } from '@/data/seedCMS';

interface DatabaseSchema {
  menuItems: MenuItem[];
  categories: Category[];
  orders: Order[];
  reservations: TableReservation[];
  tables: DiningTable[];
  coupons: Coupon[];
  reviews: CustomerReview[];
  settings: SiteSettings;
  cmsPages?: CMSPage[];
  adminUser?: AdminUser;
  auditLogs: { timestamp: string; action: string; actor: string; details?: any }[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'sapori_store.json');

// Asynchronous real-time sync with MongoDB Atlas Cloud
async function syncToMongo(
  collection: 'settings' | 'menu' | 'categories' | 'orders' | 'reservations' | 'tables' | 'coupons' | 'reviews' | 'cms' | 'admin',
  operation: 'upsert' | 'delete',
  filter: Record<string, any>,
  doc?: any
) {
  try {
    const { connectToDatabase } = await import('@/lib/db/mongodb');
    await connectToDatabase();
    const models = await import('@/lib/db/models');

    switch (collection) {
      case 'settings':
        if (operation === 'upsert') {
          await models.SiteSettingsModel.findOneAndUpdate({}, doc, { upsert: true });
        }
        break;
      case 'menu':
        if (operation === 'upsert') {
          await models.MenuItemModel.findOneAndUpdate(filter, doc, { upsert: true });
        } else if (operation === 'delete') {
          await models.MenuItemModel.deleteOne(filter);
        }
        break;
      case 'categories':
        if (operation === 'upsert') {
          await models.CategoryModel.findOneAndUpdate(filter, doc, { upsert: true });
        } else if (operation === 'delete') {
          await models.CategoryModel.deleteOne(filter);
        }
        break;
      case 'orders':
        if (operation === 'upsert') {
          await models.OrderModel.findOneAndUpdate(filter, doc, { upsert: true });
        }
        break;
      case 'reservations':
        if (operation === 'upsert') {
          await models.TableReservationModel.findOneAndUpdate(filter, doc, { upsert: true });
        }
        break;
      case 'tables':
        if (operation === 'upsert') {
          await models.DiningTableModel.findOneAndUpdate(filter, doc, { upsert: true });
        }
        break;
      case 'coupons':
        if (operation === 'upsert') {
          await models.CouponModel.findOneAndUpdate(filter, doc, { upsert: true });
        } else if (operation === 'delete') {
          await models.CouponModel.deleteOne(filter);
        }
        break;
      case 'reviews':
        if (operation === 'upsert') {
          await models.CustomerReviewModel.findOneAndUpdate(filter, doc, { upsert: true });
        } else if (operation === 'delete') {
          await models.CustomerReviewModel.deleteOne(filter);
        }
        break;
      case 'cms':
        if (operation === 'upsert') {
          await models.CMSPageModel.findOneAndUpdate(filter, doc, { upsert: true });
        }
        break;
    }
  } catch (err: any) {
    console.warn(`[MongoDB Sync ${collection}]`, err.message);
  }
}

export const INITIAL_TABLES: DiningTable[] = [
  { id: 'tbl-1', tableNumber: '01', capacity: 2, status: 'available', isActive: true, qrCodeUrl: '/table/01' },
  { id: 'tbl-2', tableNumber: '02', capacity: 4, status: 'available', isActive: true, qrCodeUrl: '/table/02' },
  { id: 'tbl-3', tableNumber: '03', capacity: 4, status: 'available', isActive: true, qrCodeUrl: '/table/03' },
  { id: 'tbl-4', tableNumber: '04', capacity: 6, status: 'available', isActive: true, qrCodeUrl: '/table/04' },
  { id: 'tbl-5', tableNumber: '05', capacity: 2, status: 'available', isActive: true, qrCodeUrl: '/table/05' },
  { id: 'tbl-6', tableNumber: '06', capacity: 8, status: 'available', isActive: true, qrCodeUrl: '/table/06' },
  { id: 'tbl-7', tableNumber: '07', capacity: 4, status: 'available', isActive: true, qrCodeUrl: '/table/07' },
  { id: 'tbl-8', tableNumber: '08', capacity: 4, status: 'available', isActive: true, qrCodeUrl: '/table/08' },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-sapori10',
    code: 'SAPORI10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 100,
    isActive: true,
    description: '10% off on handcrafted orders above ₹499 (Max ₹100)',
  },
  {
    id: 'cpn-sipwelcome',
    code: 'SIPANDSAVOUR',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 399,
    isActive: true,
    description: 'Flat ₹50 off on your artisanal café experience above ₹399',
  },
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    authorName: 'Aarav Sharma',
    rating: 5,
    comment: 'The Truffle Mushroom Pizza and Crème Brûlée Custard Cold Brew were sensational. Best café ambience in Raja Park!',
    verifiedOrder: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isApproved: true,
  },
  {
    id: 'rev-2',
    authorName: 'Meera Deshmukh',
    rating: 5,
    comment: 'Authentic Neapolitan dough with real blistered crust. The Pesto Stracciatella is a masterclass in Italian flavours.',
    verifiedOrder: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isApproved: true,
    adminReply: 'Thank you Meera! We ferment our dough for 48 hours to achieve that authentic airy crust. See you soon!',
  },
  {
    id: 'rev-3',
    authorName: 'Kabir Singhania',
    rating: 5,
    comment: 'Exceptional Vietnamese Coffee Tiramisu and Barrel-Aged Cold Brew. Elegant, serene space to work and unwind.',
    verifiedOrder: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    isApproved: true,
  },
];

// In-memory singleton with file persistence
class SaporiDataStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(fileContent);
        if (!parsed.cmsPages || parsed.cmsPages.length === 0) {
          parsed.cmsPages = SEED_CMS_PAGES;
          this.saveData(parsed);
        }
        if (!parsed.adminUser) {
          parsed.adminUser = {
            id: 'admin-master',
            email: 'admin@saporicafe.in',
            password: 'admin123',
            name: 'Sapori Manager',
            role: 'SUPER_ADMIN',
            updatedAt: new Date().toISOString(),
          };
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing store file, initializing default:', e);
    }

    const defaultData: DatabaseSchema = {
      menuItems: SEED_MENU_ITEMS,
      categories: SEED_CATEGORIES,
      orders: [],
      reservations: [],
      tables: INITIAL_TABLES,
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      settings: DEFAULT_SITE_SETTINGS,
      cmsPages: SEED_CMS_PAGES,
      adminUser: {
        id: 'admin-master',
        email: 'admin@saporicafe.in',
        password: 'admin123',
        name: 'Sapori Manager',
        role: 'SUPER_ADMIN',
        updatedAt: new Date().toISOString(),
      },
      auditLogs: [
        {
          timestamp: new Date().toISOString(),
          action: 'SYSTEM_BOOTSTRAP',
          actor: 'system',
          details: { message: 'Database initialized with official Sapori seed data' },
        },
      ],
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist store to file:', e);
    }
  }

  // --- MENU ITEMS ---
  getMenuItems(filter?: { category?: string; availableOnly?: boolean; signatureOnly?: boolean }): MenuItem[] {
    let items = [...this.data.menuItems];
    if (filter?.category && filter.category !== 'all') {
      items = items.filter((i) => i.category === filter.category);
    }
    if (filter?.availableOnly) {
      items = items.filter((i) => i.isAvailable);
    }
    if (filter?.signatureOnly) {
      items = items.filter((i) => i.isSignature);
    }
    return items;
  }

  getMenuItemBySlug(slug: string): MenuItem | undefined {
    return this.data.menuItems.find((i) => i.slug === slug);
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.data.menuItems.find((i) => i.id === id);
  }

  createMenuItem(item: MenuItem): MenuItem {
    this.data.menuItems.unshift(item);
    this.logAudit('CREATE_MENU_ITEM', 'admin', { itemId: item.id, name: item.name });
    this.saveData(this.data);
    syncToMongo('menu', 'upsert', { id: item.id }, item);
    return item;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
    const index = this.data.menuItems.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.data.menuItems[index] = { ...this.data.menuItems[index], ...updates };
    this.logAudit('UPDATE_MENU_ITEM', 'admin', { itemId: id, updates });
    this.saveData(this.data);
    syncToMongo('menu', 'upsert', { id }, this.data.menuItems[index]);
    return this.data.menuItems[index];
  }

  deleteMenuItem(id: string): boolean {
    const prevCount = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter((i) => i.id !== id);
    if (this.data.menuItems.length !== prevCount) {
      this.logAudit('DELETE_MENU_ITEM', 'admin', { itemId: id });
      this.saveData(this.data);
      syncToMongo('menu', 'delete', { id });
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.displayPriority - b.displayPriority);
  }

  createCategory(category: Category): Category {
    this.data.categories.push(category);
    this.logAudit('CREATE_CATEGORY', 'admin', { id: category.id, name: category.name });
    this.saveData(this.data);
    syncToMongo('categories', 'upsert', { id: category.id }, category);
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveData(this.data);
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.saveData(this.data);
    return true;
  }

  // --- ORDERS ---
  getOrders(filter?: { status?: OrderStatus; mode?: string }): Order[] {
    let orders = [...this.data.orders];
    if (filter?.status) {
      orders = orders.filter((o) => o.status === filter.status);
    }
    if (filter?.mode && filter.mode !== 'all') {
      orders = orders.filter((o) => o.orderMode === filter.mode);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.logAudit('CREATE_ORDER', 'customer', { orderId: order.id, total: order.total });
    this.saveData(this.data);
    return order;
  }

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    actor: 'customer' | 'admin' | 'kitchen' | 'system',
    note?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor,
      note,
    });

    this.logAudit('UPDATE_ORDER_STATUS', actor, { orderId, newStatus, note });

    // Dine-In Table Status Sync
    if (order.orderMode === 'dine_in' && order.customer.tableNumber) {
      const tblNum = order.customer.tableNumber;
      if (['PLACED', 'ACCEPTED', 'PREPARING', 'READY_TO_SERVE'].includes(newStatus)) {
        this.updateTableStatus(tblNum, 'occupied');
      } else if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(newStatus)) {
        const hasActiveOrders = this.data.orders.some(
          (o) =>
            o.id !== order.id &&
            o.orderMode === 'dine_in' &&
            o.customer.tableNumber === tblNum &&
            ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_TO_SERVE'].includes(o.status)
        );
        const hasActiveReservation = this.data.reservations.some(
          (r) => r.tableNumber === tblNum && r.status === 'ARRIVED'
        );
        if (!hasActiveOrders && !hasActiveReservation) {
          this.updateTableStatus(tblNum, 'available');
        }
      }
    }

    this.saveData(this.data);
    return order;
  }

  updateOrderPayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentDetails?: { razorpayPaymentId?: string; razorpayOrderId?: string }
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    order.paymentDetails = {
      ...order.paymentDetails,
      ...paymentDetails,
      paidAt: paymentStatus === 'PAID' ? (order.paymentDetails?.paidAt || new Date().toISOString()) : undefined,
    };

    this.logAudit('UPDATE_ORDER_PAYMENT', 'system', { orderId, paymentStatus });
    this.saveData(this.data);
    return order;
  }

  deleteOrder(id: string, actor: string = 'admin'): boolean {
    const idx = this.data.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return false;
    const order = this.data.orders[idx];
    this.data.orders.splice(idx, 1);
    this.logAudit('DELETE_ORDER', actor, { orderId: order.id, orderNumber: order.orderNumber });

    if (order.orderMode === 'dine_in' && order.customer.tableNumber) {
      const tblNum = order.customer.tableNumber;
      const hasActiveOrders = this.data.orders.some(
        (o) =>
          o.orderMode === 'dine_in' &&
          o.customer.tableNumber === tblNum &&
          ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_TO_SERVE'].includes(o.status)
      );
      const hasActiveReservation = this.data.reservations.some(
        (r) => r.tableNumber === tblNum && r.status === 'ARRIVED'
      );
      if (!hasActiveOrders && !hasActiveReservation) {
        this.updateTableStatus(tblNum, 'available');
      }
    }

    this.saveData(this.data);
    return true;
  }

  // --- RESERVATIONS ---
  getReservations(): TableReservation[] {
    return [...this.data.reservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getReservationById(id: string): TableReservation | undefined {
    return this.data.reservations.find((r) => r.id === id || r.bookingRef === id);
  }

  createReservation(reservation: TableReservation): TableReservation {
    this.data.reservations.unshift(reservation);
    this.logAudit('CREATE_RESERVATION', 'customer', {
      bookingRef: reservation.bookingRef,
      date: reservation.date,
      time: reservation.timeSlot,
    });
    this.saveData(this.data);
    return reservation;
  }

  updateReservationStatus(
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
    actor: string = 'admin'
  ): TableReservation | null {
    return this.updateReservation(id, { status }, actor);
  }

  updateReservation(
    id: string,
    updates: Partial<TableReservation>,
    actor: string = 'admin'
  ): TableReservation | null {
    const res = this.data.reservations.find((r) => r.id === id || r.bookingRef === id);
    if (!res) return null;

    const previousTable = res.tableNumber;
    const previousStatus = res.status;

    Object.assign(res, updates);
    res.updatedAt = new Date().toISOString();

    // Bidirectional Table State Sync
    const activeTableNum = res.tableNumber || previousTable;
    if (activeTableNum) {
      if (res.status === 'ARRIVED') {
        this.updateTableStatus(activeTableNum, 'occupied');
      } else if (res.status === 'CONFIRMED' && res.tableNumber) {
        const tbl = this.data.tables.find((t) => t.tableNumber === activeTableNum);
        if (tbl && tbl.status === 'available') {
          this.updateTableStatus(activeTableNum, 'reserved');
        }
      } else if (res.status === 'COMPLETED' || res.status === 'CANCELLED' || res.status === 'NO_SHOW') {
        const tbl = this.data.tables.find((t) => t.tableNumber === activeTableNum);
        if (tbl && (tbl.status === 'occupied' || tbl.status === 'reserved')) {
          this.updateTableStatus(activeTableNum, 'available');
        }
      }
    }

    // If table assignment changed, release the previous table
    if (previousTable && res.tableNumber && previousTable !== res.tableNumber) {
      const prevTbl = this.data.tables.find((t) => t.tableNumber === previousTable);
      if (prevTbl && (prevTbl.status === 'reserved' || prevTbl.status === 'occupied')) {
        this.updateTableStatus(previousTable, 'available');
      }
      if (res.status === 'ARRIVED') {
        this.updateTableStatus(res.tableNumber, 'occupied');
      } else if (res.status === 'CONFIRMED') {
        this.updateTableStatus(res.tableNumber, 'reserved');
      }
    }

    this.logAudit('UPDATE_RESERVATION', actor, { id, updates });
    this.saveData(this.data);
    return res;
  }

  deleteReservation(id: string, actor: string = 'admin'): boolean {
    const index = this.data.reservations.findIndex((r) => r.id === id || r.bookingRef === id);
    if (index === -1) return false;

    const res = this.data.reservations[index];
    if (res.tableNumber) {
      const tbl = this.data.tables.find((t) => t.tableNumber === res.tableNumber);
      if (tbl && (tbl.status === 'reserved' || tbl.status === 'occupied')) {
        this.updateTableStatus(res.tableNumber, 'available');
      }
    }

    this.data.reservations.splice(index, 1);
    this.logAudit('DELETE_RESERVATION', actor, { id, bookingRef: res.bookingRef });
    this.saveData(this.data);
    return true;
  }

  // --- TABLES ---
  getTables(): DiningTable[] {
    return [...this.data.tables];
  }

  updateTableStatus(
    tableNumber: string,
    status: 'available' | 'occupied' | 'reserved' | 'cleaning',
    currentOrderId?: string
  ): DiningTable | null {
    const tbl = this.data.tables.find((t) => t.tableNumber === tableNumber);
    if (!tbl) return null;
    tbl.status = status;
    tbl.currentOrderId = currentOrderId;
    this.saveData(this.data);
    syncToMongo('tables', 'upsert', { tableNumber }, tbl);
    return tbl;
  }

  // --- COUPONS ---
  getCoupons(): Coupon[] {
    return [...this.data.coupons];
  }

  getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  }

  createCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.saveData(this.data);
    syncToMongo('coupons', 'upsert', { id: coupon.id }, coupon);
    return coupon;
  }

  // --- REVIEWS ---
  getReviews(approvedOnly = true): CustomerReview[] {
    if (approvedOnly) {
      return this.data.reviews.filter((r) => r.isApproved);
    }
    return [...this.data.reviews];
  }

  createReview(review: CustomerReview): CustomerReview {
    this.data.reviews.unshift(review);
    this.saveData(this.data);
    syncToMongo('reviews', 'upsert', { id: review.id }, review);
    return review;
  }

  replyReview(reviewId: string, reply: string): CustomerReview | null {
    const rev = this.data.reviews.find((r) => r.id === reviewId);
    if (!rev) return null;
    rev.adminReply = reply;
    this.saveData(this.data);
    return rev;
  }

  updateReview(reviewId: string, updates: Partial<CustomerReview>): CustomerReview | null {
    const rev = this.data.reviews.find((r) => r.id === reviewId);
    if (!rev) return null;
    Object.assign(rev, updates);
    this.saveData(this.data);
    return rev;
  }

  deleteReview(reviewId: string): boolean {
    const idx = this.data.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    this.saveData(this.data);
    return true;
  }

  // --- SITE SETTINGS ---
  getSettings(): SiteSettings {
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.logAudit('UPDATE_SETTINGS', 'admin', updates);
    this.saveData(this.data);
    return this.data.settings;
  }

  // --- CMS PAGE & CONTENT MANAGEMENT ---
  getCMSPages(): CMSPage[] {
    if (!this.data.cmsPages || this.data.cmsPages.length === 0) {
      this.data.cmsPages = [...SEED_CMS_PAGES];
      this.saveData(this.data);
    }
    return this.data.cmsPages;
  }

  getCMSPage(id: string): CMSPage | undefined {
    const pages = this.getCMSPages();
    return pages.find((p) => p.id === id || p.slug === id);
  }

  updateCMSPage(id: string, updates: Partial<CMSPage>): CMSPage | null {
    const pages = this.getCMSPages();
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    pages[idx] = {
      ...pages[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('UPDATE_CMS_PAGE', 'admin', { pageId: id, updates });
    this.saveData(this.data);
    syncToMongo('cms', 'upsert', { id }, pages[idx]);
    return pages[idx];
  }

  updateCMSSection(
    pageId: string,
    sectionId: string,
    fields: Record<string, any>,
    isVisible?: boolean
  ): CMSPage | null {
    const page = this.getCMSPage(pageId);
    if (!page) return null;
    const secIdx = page.sections.findIndex((s) => s.id === sectionId);
    if (secIdx === -1) {
      page.sections.push({
        id: sectionId,
        name: sectionId.replace(/_/g, ' ').toUpperCase(),
        isVisible: isVisible !== undefined ? isVisible : true,
        fields,
      });
    } else {
      page.sections[secIdx].fields = {
        ...page.sections[secIdx].fields,
        ...fields,
      };
      if (isVisible !== undefined) {
        page.sections[secIdx].isVisible = isVisible;
      }
    }
    page.updatedAt = new Date().toISOString();
    this.logAudit('UPDATE_CMS_SECTION', 'admin', { pageId, sectionId, fields, isVisible });
    this.saveData(this.data);
    syncToMongo('cms', 'upsert', { id: pageId }, page);
    return page;
  }

  publishCMSPage(id: string, forceStatus?: boolean): CMSPage | null {
    const page = this.getCMSPage(id);
    if (!page) return null;
    page.isPublished = typeof forceStatus === 'boolean' ? forceStatus : !page.isPublished;
    page.updatedAt = new Date().toISOString();
    this.logAudit(page.isPublished ? 'PUBLISH_CMS_PAGE' : 'UNPUBLISH_CMS_PAGE', 'admin', { pageId: id });
    this.saveData(this.data);
    syncToMongo('cms', 'upsert', { id }, page);
    return page;
  }

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return [...this.data.auditLogs].reverse();
  }

  // --- ADMIN AUTHENTICATION & CREDENTIALS ---
  getAdminUser(): AdminUser {
    if (!this.data.adminUser) {
      this.data.adminUser = {
        id: 'admin-master',
        email: 'admin@saporicafe.in',
        password: 'admin123',
        name: 'Sapori Manager',
        role: 'SUPER_ADMIN',
        updatedAt: new Date().toISOString(),
      };
      this.saveData(this.data);
    }
    return { ...this.data.adminUser };
  }

  updateAdminCredentials(updates: { email?: string; password?: string; name?: string }): AdminUser {
    const current = this.getAdminUser();
    const updated: AdminUser = {
      ...current,
      ...(updates.email ? { email: updates.email.trim().toLowerCase() } : {}),
      ...(updates.password ? { password: updates.password.trim() } : {}),
      ...(updates.name ? { name: updates.name.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.data.adminUser = updated;
    this.logAudit('CHANGE_ADMIN_CREDENTIALS', 'admin', {
      updatedEmail: updated.email,
      updatedName: updated.name,
    });
    this.saveData(this.data);
    return updated;
  }

  private logAudit(action: string, actor: string, details?: any) {
    this.data.auditLogs.push({
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
    });
  }
}

// Global singleton instance
declare global {
  var __sapori_store__: SaporiDataStore | undefined;
}

export const dbStore = globalThis.__sapori_store__ || new SaporiDataStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__sapori_store__ = dbStore;
}
