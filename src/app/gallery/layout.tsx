import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('gallery');

  const title = cms?.seoTitle || 'Visual Moments & Café Ambience';
  const description =
    cms?.seoDescription ||
    'Explore visual moments of wood-deck Neapolitan pizzas, specialty Arabica cold brew bar, and peaceful Raja Park cafe atmosphere at Sapori Café.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/gallery`,
    },
    openGraph: {
      title: `${title} | Sapori Café Jaipur`,
      description,
      url: `${baseUrl}/gallery`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
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
