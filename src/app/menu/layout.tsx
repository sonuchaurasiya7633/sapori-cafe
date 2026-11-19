import { Metadata } from 'next';
import { getBaseUrl, getBreadcrumbSchema } from '@/lib/seo';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cms = dbStore.getCMSPage('menu');

  const title = cms?.seoTitle || 'Artisanal Culinary Menu & Specialties';
  const description =
    cms?.seoDescription ||
    'Explore our 48-hour slow-fermented Neapolitan pizzas, double-cooked frites, handcrafted panuozzos, and specialty Arabica roasts at Sapori Café, Raja Park, Jaipur.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/menu`,
    },
    openGraph: {
      title: `${title} | Sapori Café Jaipur`,
      description,
      url: `${baseUrl}/menu`,
      images: [
        {
          url: '/images/hero-cafe-hd.webp',
          width: 1200,
          height: 630,
          alt: 'Sapori Cafe Artisanal Menu in Raja Park Jaipur',
        },
      ],
    },
  };
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
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
