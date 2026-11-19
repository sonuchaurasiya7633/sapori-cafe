import { SiteSettings, MenuItem } from '@/types';
import { dbStore } from '@/lib/db/store';

/**
 * Returns the canonical base URL for the project.
 * Strictly outputs the custom production domain (https://saporicafe.in)
 * so that Google Search Console sitemaps never fail with "URL not allowed".
 */
export function getBaseUrl(customSettings?: SiteSettings): string {
  // 1. Check SiteSettings canonicalDomain in DB (e.g. saporicafe.in or https://saporicafe.in)
  try {
    const settings = customSettings || dbStore.getSettings();
    if (settings?.canonicalDomain && settings.canonicalDomain.trim().length > 0) {
      let cd = settings.canonicalDomain.trim();
      if (!cd.startsWith('http://') && !cd.startsWith('https://')) {
        cd = `https://${cd}`;
      }
      return cd.replace(/\/+$/, '');
    }
  } catch (e) {
    // ignore
  }

  // 2. Explicit custom app URL env var (ignoring localhost and vercel preview subdomains)
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') &&
    !process.env.NEXT_PUBLIC_APP_URL.includes('.vercel.app')
  ) {
    let appUrl = process.env.NEXT_PUBLIC_APP_URL.trim();
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
      appUrl = `https://${appUrl}`;
    }
    return appUrl.replace(/\/+$/, '');
  }

  // 3. Official custom production domain for Sapori Cafe
  return 'https://saporicafe.in';
}

/**
 * Schema.org Restaurant & LocalBusiness JSON-LD
 * Perfectly structured for Google Local Search, Google Maps, and Rich Results.
 */
export function getRestaurantSchema(settings?: SiteSettings) {
  const currentSettings = settings || dbStore.getSettings();
  const baseUrl = getBaseUrl();

  const heroImage =
    currentSettings.heroImageUrl?.startsWith('http')
      ? currentSettings.heroImageUrl
      : `${baseUrl}${currentSettings.heroImageUrl || '/images/hero-cafe.webp'}`;

  const logoImage =
    currentSettings.logoUrl?.startsWith('http')
      ? currentSettings.logoUrl
      : `${baseUrl}${currentSettings.logoUrl || '/images/hero-cafe-hd.webp'}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${baseUrl}/#restaurant`,
    name: currentSettings.brandName || 'SAPORI CAFÉ & EATERY',
    alternateName: ['Sapori Cafe', 'Sapori Eatery Jaipur', 'Sapori Cafe Raja Park'],
    description:
      currentSettings.brandTagline ||
      'Handcrafted 48-hour slow-fermented Neapolitan pizzas, specialty Arabica cold brews, and comforting Italian bakery pairings in Raja Park, Jaipur.',
    url: baseUrl,
    logo: logoImage,
    image: [
      heroImage,
      `${baseUrl}/images/hero-cafe-hd.webp`,
      `${baseUrl}/images/hero-cafe-native.webp`,
    ],
    telephone: currentSettings.contactPhone || '+91 63673 73302',
    email: currentSettings.email || 'hello@saporicafe.in',
    priceRange: '₹₹ (₹200 - ₹800)',
    servesCuisine: [
      'Italian',
      'Neapolitan Pizza',
      'Specialty Coffee',
      'Artisanal Bakery',
      'European',
      'Vegetarian Friendly',
    ],
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Google Pay, PhonePe, Paytm, Net Banking',
    currenciesAccepted: 'INR',
    acceptsReservations: 'True',
    menu: `${baseUrl}/menu`,
    hasMenu: `${baseUrl}/menu`,
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        currentSettings.address ||
        '217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302004',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.8916,
      longitude: 75.8277,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '10:00',
        closes: '23:30',
      },
    ],
    sameAs: [
      currentSettings.instagramUrl || 'https://instagram.com/saporicafejaipur',
      currentSettings.googleMapsUrl || 'https://maps.google.com/?q=Sapori+Cafe+Raja+Park+Jaipur',
    ],
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/reservations`,
        inLanguage: 'en-IN',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'FoodEstablishmentReservation',
        name: 'Reserve a Table at Sapori Café',
      },
    },
  };
}

/**
 * Schema.org WebSite JSON-LD with Sitelinks Searchbox
 */
export function getWebSiteSchema(settings?: SiteSettings) {
  const currentSettings = settings || dbStore.getSettings();
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: currentSettings.brandName || 'SAPORI CAFÉ & EATERY',
    description:
      'Official website of Sapori Café & Eatery in Raja Park, Jaipur. Artisan Italian pizzas and specialty coffee.',
    publisher: {
      '@id': `${baseUrl}/#restaurant`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-IN',
  };
}

/**
 * Schema.org MenuItem & Product JSON-LD for single food items
 */
export function getMenuItemSchema(item: MenuItem, settings?: SiteSettings) {
  const currentSettings = settings || dbStore.getSettings();
  const baseUrl = getBaseUrl();

  const itemImage = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${baseUrl}${item.image}`
    : `${baseUrl}/images/hero-cafe.webp`;

  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    '@id': `${baseUrl}/menu/${item.slug}#menuitem`,
    name: item.name,
    description:
      item.description ||
      `Artisanal ${item.name} prepared fresh with authentic Italian technique at Sapori Café, Jaipur.`,
    image: itemImage,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'INR',
      availability: item.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/menu/${item.slug}`,
      seller: {
        '@type': 'Restaurant',
        name: currentSettings.brandName || 'SAPORI CAFÉ & EATERY',
      },
    },
    suitableForDiet: item.isVegan
      ? 'https://schema.org/VeganDiet'
      : 'https://schema.org/VegetarianDiet',
    nutrition: {
      '@type': 'NutritionInformation',
      servings: '1 person',
    },
  };
}

/**
 * Schema.org BreadcrumbList JSON-LD
 */
export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}
