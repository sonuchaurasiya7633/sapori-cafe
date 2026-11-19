import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('faq');

  const title = cms?.seoTitle || 'Frequently Asked Questions (FAQ) | Sapori Café';
  const description =
    cms?.seoDescription ||
    'Find answers to common questions about our 48-hour fermented Neapolitan dough, specialty coffee beans, dining options, and table bookings in Raja Park, Jaipur.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/faq`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/faq`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
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
