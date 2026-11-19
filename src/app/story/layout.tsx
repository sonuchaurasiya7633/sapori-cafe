import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('story');

  const title = cms?.seoTitle || 'Our Philosophy & 48-Hour Fermentation Story';
  const description =
    cms?.seoDescription ||
    'Discover our obsession with slow 48-hour cold fermented Neapolitan dough and specialty Arabica extraction science in Raja Park, Jaipur.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/story`,
    },
    openGraph: {
      title: `${title} | Sapori Café Jaipur`,
      description,
      url: `${baseUrl}/story`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Our Story', path: '/story' },
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
