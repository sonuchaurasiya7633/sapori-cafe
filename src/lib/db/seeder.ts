import mongoose from 'mongoose';
import {
  MenuItemModel,
  CategoryModel,
  DiningTableModel,
  CouponModel,
  CustomerReviewModel,
  SiteSettingsModel,
  CMSPageModel,
  AuditLogModel,
} from '@/lib/db/models';
import { SEED_CATEGORIES, SEED_MENU_ITEMS, DEFAULT_SITE_SETTINGS } from '@/data/seedMenu';
import { SEED_CMS_PAGES } from '@/data/seedCMS';
import { INITIAL_TABLES, INITIAL_COUPONS, INITIAL_REVIEWS } from '@/lib/db/store';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://saporikitchens_db_user:8IeVakI0LgjcUnrJ@cluster0.yvurarx.mongodb.net/sapori_cafe?retryWrites=true&w=majority';

export async function runMongoDBSeeder() {
  console.log('====================================================');
  console.log('🚀 SAPORI CAFÉ — MONGODB ATLAS SEEDER ENGINE');
  console.log('====================================================');

  const conn = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`✅ Connected to MongoDB Atlas! Database: "${conn.connection.name}"`);

  // 1. Seed Categories
  await CategoryModel.deleteMany({});
  const categoriesResult = await CategoryModel.insertMany(SEED_CATEGORIES);

  // 2. Seed Menu Items
  await MenuItemModel.deleteMany({});
  const menuResult = await MenuItemModel.insertMany(SEED_MENU_ITEMS);

  // 3. Seed Dining Tables
  await DiningTableModel.deleteMany({});
  const tablesResult = await DiningTableModel.insertMany(INITIAL_TABLES);

  // 4. Seed Coupons & Offers
  await CouponModel.deleteMany({});
  const couponsResult = await CouponModel.insertMany(INITIAL_COUPONS);

  // 5. Seed Customer Reviews
  await CustomerReviewModel.deleteMany({});
  const reviewsResult = await CustomerReviewModel.insertMany(INITIAL_REVIEWS);

  // 6. Seed Site Settings
  await SiteSettingsModel.deleteMany({});
  await SiteSettingsModel.create(DEFAULT_SITE_SETTINGS);

  // 7. Seed Dynamic CMS Pages
  await CMSPageModel.deleteMany({});
  const cmsResult = await CMSPageModel.insertMany(SEED_CMS_PAGES);

  // Audit Log Entry
  await AuditLogModel.create({
    timestamp: new Date().toISOString(),
    action: 'MONGODB_ATLAS_SEED',
    actor: 'system_bootstrap',
    details: {
      categories: categoriesResult.length,
      menuItems: menuResult.length,
      tables: tablesResult.length,
      coupons: couponsResult.length,
      reviews: reviewsResult.length,
      cmsPages: cmsResult.length,
    },
  });

  const stats = [
    { Collection: 'categories', Documents: await CategoryModel.countDocuments() },
    { Collection: 'menuitems', Documents: await MenuItemModel.countDocuments() },
    { Collection: 'diningtables', Documents: await DiningTableModel.countDocuments() },
    { Collection: 'coupons', Documents: await CouponModel.countDocuments() },
    { Collection: 'customerreviews', Documents: await CustomerReviewModel.countDocuments() },
    { Collection: 'sitesettings', Documents: await SiteSettingsModel.countDocuments() },
    { Collection: 'cmspages', Documents: await CMSPageModel.countDocuments() },
    { Collection: 'auditlogs', Documents: await AuditLogModel.countDocuments() },
  ];

  return { success: true, database: conn.connection.name, stats };
}
