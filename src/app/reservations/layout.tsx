import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('reservations');

  const title = cms?.seoTitle || 'Reserve a Table | Dining Experience in Raja Park';
  const description =
    cms?.seoDescription ||
    'Reserve an intimate table or private gathering at Sapori Cafe, Raja Park, Jaipur. Experience artisanal Italian dining and specialty brews.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/reservations`,
    },
    openGraph: {
      title: `${title} | Sapori Café Jaipur`,
      description,
      url: `${baseUrl}/reservations`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Reservations', path: '/reservations' },
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
