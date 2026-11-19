import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('contact');
  const settings = dbStore.getSettings();

  const title = cms?.seoTitle || 'Contact Us, Location & Directions | Raja Park, Jaipur';
  const description =
    cms?.seoDescription ||
    `Visit Sapori Café & Eatery at ${settings.address}. Call us on ${settings.contactPhone} for orders, inquiries, and reservations.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
    openGraph: {
      title: `${title} | Sapori Café`,
      description,
      url: `${baseUrl}/contact`,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
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
