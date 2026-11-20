import { describe, it, expect } from 'vitest';
import { dbStore } from '../../src/lib/db/store';

describe('Store Settings & Operational Rules', () => {
  it('retrieves default site settings with required brand fields', () => {
    const settings = dbStore.getSettings();
    expect(settings.brandName).toContain('SAPORI CAFE');
    expect(settings.address).toContain('Raja Park, Jaipur');
    expect(settings.contactPhone).toBe('+91 63673 73302');
    expect(settings.gstRatePercent).toBe(5);
  });

  it('updates store operational settings and persists changes', () => {
    const original = dbStore.getSettings();

    const updated = dbStore.updateSettings({
      deliveryFee: 55,
      freeDeliveryThreshold: 699,
      packagingFee: 30,
      announcementText: 'Special Weekend Tasting Menu Available!',
    });

    expect(updated.deliveryFee).toBe(55);
    expect(updated.freeDeliveryThreshold).toBe(699);
    expect(updated.packagingFee).toBe(30);
    expect(updated.announcementText).toBe('Special Weekend Tasting Menu Available!');

    // Re-fetch to ensure persistence
    const reFetched = dbStore.getSettings();
    expect(reFetched.deliveryFee).toBe(55);

    // Restore original settings
    dbStore.updateSettings({
      deliveryFee: original.deliveryFee,
      freeDeliveryThreshold: original.freeDeliveryThreshold,
      packagingFee: original.packagingFee,
      announcementText: original.announcementText,
    });
  });

  it('allows toggling kitchen accepting orders switch', () => {
    const original = dbStore.getSettings();

    // Toggle off
    const toggledOff = dbStore.updateSettings({ isKitchenAcceptingOrders: false });
    expect(toggledOff.isKitchenAcceptingOrders).toBe(false);

    // Toggle back on
    const toggledOn = dbStore.updateSettings({ isKitchenAcceptingOrders: true });
    expect(toggledOn.isKitchenAcceptingOrders).toBe(true);

    // Clean up
    dbStore.updateSettings({ isKitchenAcceptingOrders: original.isKitchenAcceptingOrders });
  });

  it('allows dynamically updating brand visuals (hero image, footer art, logo)', () => {
    const updated = dbStore.updateSettings({
      heroImageUrl: 'https://res.cloudinary.com/drrfrsrl/image/upload/custom-hero.webp',
      footerImageUrl: 'https://res.cloudinary.com/drrfrsrl/image/upload/custom-footer.webp',
      logoUrl: 'https://res.cloudinary.com/drrfrsrl/image/upload/custom-logo.png',
    });

    expect(updated.heroImageUrl).toBe(
      'https://res.cloudinary.com/drrfrsrl/image/upload/custom-hero.webp'
    );
    expect(updated.footerImageUrl).toBe(
      'https://res.cloudinary.com/drrfrsrl/image/upload/custom-footer.webp'
    );
    expect(updated.logoUrl).toBe(
      'https://res.cloudinary.com/drrfrsrl/image/upload/custom-logo.png'
    );

    const reFetched = dbStore.getSettings();
    expect(reFetched.heroImageUrl).toBe(
      'https://res.cloudinary.com/drrfrsrl/image/upload/custom-hero.webp'
    );
  });

  it('persists and retrieves Google Verification Code and GA4 Measurement ID via settings API', async () => {
    const { PUT, GET } = await import('../../src/app/api/settings/route');
    const { NextRequest } = await import('next/server');
    const { SiteSettingsModel } = await import('../../src/lib/db/models');
    const { connectToDatabase } = await import('../../src/lib/db/mongodb');

    await connectToDatabase();
    const originalDoc = await SiteSettingsModel.findOne().lean();

    const testGSC = `gsc-token-test-${Date.now()}`;
    const testGA4 = 'G-TEST123456';

    try {
      const putReq = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleVerificationCode: testGSC,
          googleAnalyticsId: testGA4,
          canonicalDomain: 'https://saporicafe.in',
        }),
      });

      const putRes = await PUT(putReq);
      const putData = await putRes.json();
      expect(putRes.status).toBe(200);
      expect(putData.success).toBe(true);
      expect(putData.settings.googleVerificationCode).toBe(testGSC);
      expect(putData.settings.googleAnalyticsId).toBe(testGA4);

      // Now test GET returns the same persisted values
      const getRes = await GET();
      const getData = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getData.googleVerificationCode).toBe(testGSC);
      expect(getData.googleAnalyticsId).toBe(testGA4);
    } finally {
      // Restore original production document so unit tests never overwrite live Atlas settings!
      if (originalDoc) {
        const { _id, __v, ...cleanOrig } = originalDoc as any;
        await SiteSettingsModel.findOneAndUpdate({}, { $set: cleanOrig });
      }
    }
  }, 15000);
});
