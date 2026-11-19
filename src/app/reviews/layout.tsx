import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('reviews');

  const title = cms?.seoTitle || 'Guest Reviews & Experiences | Sapori Café Jaipur';
  const description =
    cms?.seoDescription ||
    'Read real guest reviews and ratings on authentic Neapolitan pizzas, specialty coffee brews, and hospitality at Sapori Café in Raja Park, Jaipur.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/reviews`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/reviews`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Reviews', path: '/reviews' },
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
