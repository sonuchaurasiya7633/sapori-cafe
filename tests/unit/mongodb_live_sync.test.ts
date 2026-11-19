import { describe, it, expect } from 'vitest';
import { connectToDatabase } from '@/lib/db/mongodb';
import { MenuItemModel, CMSPageModel } from '@/lib/db/models';
import { dbStore } from '@/lib/db/store';

describe('Live Admin to MongoDB Atlas Cloud Real-Time Sync', () => {
  it('updates Menu Item price and availability and verifies direct persistence in MongoDB Atlas', async () => {
    await connectToDatabase();

    const sampleItem = dbStore.getMenuItems()[0];
    expect(sampleItem).toBeDefined();

    const updatedPrice = sampleItem.price === 500 ? 525 : 500;
    dbStore.updateMenuItem(sampleItem.id, {
      price: updatedPrice,
      isAvailable: true,
    });

    // Wait for async MongoDB sync
    await new Promise((r) => setTimeout(r, 1200));

    // Check directly in MongoDB Atlas collection
    const mongoItem = await MenuItemModel.findOne({ id: sampleItem.id }).lean();
    expect(mongoItem).toBeDefined();
    expect(mongoItem?.price).toBe(updatedPrice);
    expect(mongoItem?.isAvailable).toBe(true);
  }, 20000);

  it('updates CMS SEO metadata and verifies direct persistence in MongoDB Atlas', async () => {
    await connectToDatabase();

    const testSeoTitle = `Sapori Cafe Jaipur | Artisanal Neapolitan ${Date.now()}`;
    dbStore.updateCMSPage('home', {
      seoTitle: testSeoTitle,
    });

    // Wait for async MongoDB sync
    await new Promise((r) => setTimeout(r, 1200));

    // Check directly in MongoDB Atlas
    const homePage = await CMSPageModel.findOne({ id: 'home' }).lean();
    expect(homePage).toBeDefined();
    expect(homePage?.seoTitle).toBe(testSeoTitle);
  }, 20000);
});
