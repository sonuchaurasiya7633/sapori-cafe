import { describe, it, expect } from 'vitest';
import { connectToDatabase, getDatabaseStatus } from '../../src/lib/db/mongodb';
import {
  MenuItemModel,
  CategoryModel,
  CMSPageModel,
  SiteSettingsModel,
  DiningTableModel,
} from '../../src/lib/db/models';

describe('MongoDB Atlas Database Connection', () => {
  it('connects to MongoDB Atlas cluster and verifies active readyState', async () => {
    const conn = await connectToDatabase();
    expect(conn).toBeDefined();
    expect(conn?.connection.readyState).toBe(1); // 1 = connected
    expect(conn?.connection.name).toBe('sapori_cafe');
  }, 15000);

  it('retrieves database status report with connected flag true', async () => {
    const status = await getDatabaseStatus();
    expect(status.connected).toBe(true);
    expect(status.database).toBe('sapori_cafe');
    expect(status.status).toBe('Connected to MongoDB Atlas');
  }, 15000);

  it('verifies that all seeded collections and schemas exist in MongoDB Atlas', async () => {
    await connectToDatabase();

    const categoriesCount = await CategoryModel.countDocuments();
    expect(categoriesCount).toBeGreaterThanOrEqual(8);

    const menuCount = await MenuItemModel.countDocuments();
    expect(menuCount).toBeGreaterThanOrEqual(50);

    const cmsCount = await CMSPageModel.countDocuments();
    expect(cmsCount).toBeGreaterThanOrEqual(8);

    const tablesCount = await DiningTableModel.countDocuments();
    expect(tablesCount).toBeGreaterThanOrEqual(8);

    const settings = await SiteSettingsModel.findOne();
    expect(settings).toBeDefined();
    expect(settings?.brandName).toBe('SAPORI CAFÉ & EATERY');
  }, 15000);
});
