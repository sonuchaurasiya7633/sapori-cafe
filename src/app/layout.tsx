import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import AppShell from '@/components/layout/AppShell';
import ToastProvider from '@/components/ui/ToastProvider';
import { dbStore } from '@/lib/db/store';
import { getBaseUrl, getRestaurantSchema, getWebSiteSchema } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  const baseUrl = getBaseUrl();

  const titleTemplate =
    settings.metaTitleTemplate || '%s | SAPORI CAFÉ & EATERY | Raja Park, Jaipur';
  const defaultTitle =
    'SAPORI CAFÉ & EATERY | A Place to Pause, Sip & Savour | Raja Park, Jaipur';
  const description =
    settings.defaultMetaDescription ||
    'Handcrafted 48-hour slow-fermented Neapolitan pizzas, specialty Arabica cold brews, and comforting Italian bakery pairings in Raja Park, Jaipur.';
  const keywords =
    settings.defaultKeywords?.split(',').map((k) => k.trim()) || [
      'Sapori Cafe Jaipur',
      'Sapori Cafe Raja Park',
      'Cafe in Raja Park Jaipur',
      'Best Cafe in Jaipur',
      'Neapolitan Pizza Jaipur',
      'Specialty Coffee Jaipur',
      'Italian Cafe Jaipur',
    ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description,
    keywords,
    authors: [{ name: settings.brandName || 'Sapori Café & Eatery' }],
    creator: settings.brandName || 'Sapori Café & Eatery',
    publisher: settings.brandName || 'Sapori Café & Eatery',
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'SAPORI CAFÉ & EATERY | Artisan Pizza & Specialty Coffee in Jaipur',
      description,
      url: baseUrl,
      siteName: settings.brandName || 'Sapori Café & Eatery',
      images: [
        {
          url: '/images/hero-cafe-hd.webp',
          width: 1200,
          height: 630,
          alt: 'Sapori Cafe & Eatery Raja Park Jaipur exterior and dining atmosphere',
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SAPORI CAFÉ & EATERY | Raja Park, Jaipur',
      description,
      images: ['/images/hero-cafe-hd.webp'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google:
        settings.googleVerificationCode ||
        process.env.GOOGLE_SITE_VERIFICATION ||
        undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = dbStore.getSettings();
  const restaurantSchema = getRestaurantSchema(settings);
  const websiteSchema = getWebSiteSchema(settings);

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {(() => {
          const gaId = settings.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID;
          if (!gaId) return null;
          return (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          );
        })()}
      </head>
      <body className="bg-[#F5EFE1] text-[#15370D] min-h-screen flex flex-col antialiased selection:bg-[#15370D] selection:text-[#F5EFE1]">
        <ToastProvider />
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
