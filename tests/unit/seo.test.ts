import { describe, it, expect } from 'vitest';
import {
  getBaseUrl,
  getRestaurantSchema,
  getWebSiteSchema,
  getMenuItemSchema,
  getBreadcrumbSchema,
} from '@/lib/seo';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { MenuItem } from '@/types';

describe('Technical SEO & Structured Data Schemas', () => {
  it('getBaseUrl returns a clean valid canonical URL without trailing slashes', () => {
    const url = getBaseUrl();
    expect(url).toMatch(/^https?:\/\//);
    expect(url.endsWith('/')).toBe(false);
  });

  it('generates a valid Schema.org Restaurant schema for Google Search & Local SEO', () => {
    const schema = getRestaurantSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Restaurant');
    expect(schema.name).toContain('SAPORI CAFÉ');
    expect(schema.address['@type']).toBe('PostalAddress');
    expect(schema.address.addressLocality).toBe('Jaipur');
    expect(schema.address.addressRegion).toBe('Rajasthan');
    expect(schema.address.postalCode).toBe('302004');
    expect(schema.address.addressCountry).toBe('IN');
    expect(schema.geo['@type']).toBe('GeoCoordinates');
    expect(schema.geo.latitude).toBeCloseTo(26.8916);
    expect(schema.geo.longitude).toBeCloseTo(75.8277);
    expect(schema.currenciesAccepted).toBe('INR');
    expect(schema.openingHoursSpecification).toBeInstanceOf(Array);
    expect(schema.potentialAction['@type']).toBe('ReserveAction');
  });

  it('generates a valid Schema.org WebSite schema with Sitelinks Searchbox', () => {
    const websiteSchema = getWebSiteSchema();
    expect(websiteSchema['@context']).toBe('https://schema.org');
    expect(websiteSchema['@type']).toBe('WebSite');
    expect(websiteSchema.name).toContain('SAPORI CAFÉ');
    expect(websiteSchema.potentialAction['@type']).toBe('SearchAction');
    expect(websiteSchema.potentialAction.target.urlTemplate).toContain('/search?q={search_term_string}');
  });

  it('generates a valid Schema.org MenuItem schema with correct pricing and INR currency', () => {
    const sampleItem: MenuItem = {
      id: 'pizza-test-1',
      name: 'Margherita Verace D.O.P.',
      slug: 'margherita-verace-dop',
      description: 'San Marzano D.O.P. tomatoes, fresh Buffalo Mozzarella, fresh basil, EVOO',
      price: 525,
      category: 'pizzas',
      image: '/images/menu/pizza-margherita.webp',
      dietary: ['veg'],
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isBestseller: true,
      isAvailable: true,
      preparationTimeMinutes: 15,
      rating: 4.9,
      reviewsCount: 38,
      ingredients: ['San Marzano D.O.P.', 'Buffalo Mozzarella', 'EVOO'],
      tags: ['pizza', 'neapolitan'],
    };

    const itemSchema = getMenuItemSchema(sampleItem);
    expect(itemSchema['@context']).toBe('https://schema.org');
    expect(itemSchema['@type']).toBe('MenuItem');
    expect(itemSchema.name).toBe('Margherita Verace D.O.P.');
    expect(itemSchema.offers['@type']).toBe('Offer');
    expect(itemSchema.offers.price).toBe(525);
    expect(itemSchema.offers.priceCurrency).toBe('INR');
    expect(itemSchema.offers.availability).toBe('https://schema.org/InStock');
    expect(itemSchema.suitableForDiet).toBe('https://schema.org/VegetarianDiet');
  });

  it('generates a valid Schema.org BreadcrumbList schema', () => {
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Menu', path: '/menu' },
      { name: 'Neapolitan Pizzas', path: '/menu?category=pizzas' },
    ];

    const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);
    expect(breadcrumbSchema['@context']).toBe('https://schema.org');
    expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');
    expect(breadcrumbSchema.itemListElement).toHaveLength(3);
    expect(breadcrumbSchema.itemListElement[0].position).toBe(1);
    expect(breadcrumbSchema.itemListElement[0].name).toBe('Home');
    expect(breadcrumbSchema.itemListElement[2].position).toBe(3);
    expect(breadcrumbSchema.itemListElement[2].name).toBe('Neapolitan Pizzas');
  });

  it('dynamic sitemap includes all public routes and excludes admin or private paths', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(10);

    const urls = entries.map((e) => e.url);

    // Verify key public routes are present
    expect(urls.some((u) => u.endsWith('/menu'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/story'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/reservations'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/contact'))).toBe(true);

    // Verify private routes are strictly excluded
    expect(urls.some((u) => u.includes('/admin'))).toBe(false);
    expect(urls.some((u) => u.includes('/cart'))).toBe(false);
    expect(urls.some((u) => u.includes('/checkout'))).toBe(false);
    expect(urls.some((u) => u.includes('/table/'))).toBe(false);

    // Verify food item dynamic routes are populated
    expect(urls.some((u) => u.includes('/menu/'))).toBe(true);
  });

  it('dynamic robots.txt permits public crawl and disallows private admin/order routes', () => {
    const robotRules = robots();
    expect(robotRules.sitemap).toContain('/sitemap.xml');
    expect(robotRules.rules).toBeInstanceOf(Array);

    const universalRule = (robotRules.rules as any[]).find((r) => r.userAgent === '*');
    expect(universalRule).toBeDefined();
    expect(universalRule.allow).toBe('/');
    expect(universalRule.disallow).toContain('/admin/');
    expect(universalRule.disallow).toContain('/checkout');
    expect(universalRule.disallow).toContain('/cart');
  });
});
