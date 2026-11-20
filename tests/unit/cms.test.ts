import { describe, it, expect } from 'vitest';
import { dbStore } from '../../src/lib/db/store';

describe('CMS Database Store & Dynamic Content Engine', () => {
  it('loads all seeded CMS pages with complete section metadata', () => {
    const pages = dbStore.getCMSPages();
    expect(pages.length).toBeGreaterThanOrEqual(8);

    const ids = pages.map((p) => p.id);
    expect(ids).toContain('home');
    expect(ids).toContain('story');
    expect(ids).toContain('gallery');
    expect(ids).toContain('faq');
    expect(ids).toContain('contact');
    expect(ids).toContain('privacy');
    expect(ids).toContain('terms');
    expect(ids).toContain('cancellation');
  });

  it('retrieves the homepage CMS configuration with hero section fields', () => {
    const home = dbStore.getCMSPage('home');
    expect(home).toBeDefined();
    expect(home?.slug).toBe('/');
    expect(home?.isPublished).toBe(true);

    const heroSection = home?.sections.find((s) => s.id === 'hero');
    expect(heroSection).toBeDefined();
    expect(heroSection?.isVisible).toBe(true);
    expect(heroSection?.fields.badge).toContain('COFFEE');
    expect(heroSection?.fields.title).toBe('A Place to Pause,');
    expect(heroSection?.fields.heroImage).toBe('/images/hero-cafe.webp');
  });

  it('updates CMS page SEO metadata and section fields with database persistence', () => {
    const home = dbStore.getCMSPage('home')!;
    const originalSeoTitle = home.seoTitle;

    // Update SEO title
    const updated = dbStore.updateCMSPage('home', {
      seoTitle: 'SAPORI CAFE | Artisan Pizza & Specialty Coffee Jaipur',
    });

    expect(updated).toBeDefined();
    expect(updated?.seoTitle).toBe('SAPORI CAFE | Artisan Pizza & Specialty Coffee Jaipur');

    // Verify persistence via fresh get
    const fresh = dbStore.getCMSPage('home');
    expect(fresh?.seoTitle).toBe('SAPORI CAFE | Artisan Pizza & Specialty Coffee Jaipur');

    // Update section fields
    const updatedSection = dbStore.updateCMSSection(
      'home',
      'hero',
      {
        badge: 'SPECIALTY COFFEE • 48H PIZZA • GOOD VIBES',
      },
      true
    );

    expect(updatedSection).toBeDefined();
    const heroFieldBadge = updatedSection?.sections.find((s) => s.id === 'hero')?.fields.badge;
    expect(heroFieldBadge).toBe('SPECIALTY COFFEE • 48H PIZZA • GOOD VIBES');

    // Restore original values
    dbStore.updateCMSPage('home', { seoTitle: originalSeoTitle });
    dbStore.updateCMSSection('home', 'hero', { badge: 'COFFEE • PIZZA • GOOD VIBES' }, true);
  });

  it('toggles section visibility cleanly', () => {
    // Hide pillars
    const hidden = dbStore.updateCMSSection('home', 'pillars', undefined, false);
    const hiddenPillar = hidden?.sections.find((s) => s.id === 'pillars');
    expect(hiddenPillar?.isVisible).toBe(false);

    // Unhide pillars
    const visible = dbStore.updateCMSSection('home', 'pillars', undefined, true);
    const visiblePillar = visible?.sections.find((s) => s.id === 'pillars');
    expect(visiblePillar?.isVisible).toBe(true);
  });

  it('allows toggling publication status between Published and Draft', () => {
    const original = dbStore.getCMSPage('faq')!.isPublished;

    // Toggle publish
    const toggled = dbStore.publishCMSPage('faq');
    expect(toggled?.isPublished).toBe(!original);

    // Toggle back
    const restored = dbStore.publishCMSPage('faq');
    expect(restored?.isPublished).toBe(original);
  });
});
