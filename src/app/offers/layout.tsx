import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('offers');

  const title = cms?.seoTitle || 'Special Culinary Offers & Promos | Sapori Café';
  const description =
    cms?.seoDescription ||
    'Discover current artisanal coffee tastings, pizza pairing promotions, and dining offers at Sapori Café, Raja Park, Jaipur.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/offers`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/offers`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Offers', path: '/offers' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
