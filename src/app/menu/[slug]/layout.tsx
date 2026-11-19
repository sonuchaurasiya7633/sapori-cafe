import { Metadata } from 'next';
import { dbStore } from '@/lib/db/store';
import { getBaseUrl, getMenuItemSchema, getBreadcrumbSchema } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  const item = dbStore.getMenuItemBySlug(slug) || dbStore.getMenuItemById(slug);

  if (!item) {
    return {
      title: 'Culinary Dish Not Found',
      description: 'The requested dish or specialty beverage could not be found at Sapori Café.',
    };
  }

  const title = `${item.name} | Culinary Specialties`;
  const description =
    item.description ||
    `Order ${item.name} handcrafted fresh at Sapori Café & Eatery, Raja Park, Jaipur. Artisan Neapolitan crusts and specialty coffee.`;
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${baseUrl}${item.image}`
    : `${baseUrl}/images/hero-cafe-hd.webp`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/menu/${item.slug}`,
    },
    openGraph: {
      title: `${item.name} | Sapori Café Raja Park, Jaipur`,
      description,
      url: `${baseUrl}/menu/${item.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: `${item.name} at Sapori Café Jaipur`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.name} - ₹${item.price}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailLayout({ params, children }: Props) {
  const { slug } = await params;
  const item = dbStore.getMenuItemBySlug(slug) || dbStore.getMenuItemById(slug);
  const settings = dbStore.getSettings();

  const menuItemSchema = item ? getMenuItemSchema(item, settings) : null;
  const breadcrumbSchema = item
    ? getBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Menu', path: '/menu' },
        { name: item.name, path: `/menu/${item.slug}` },
      ])
    : null;

  return (
    <>
      {menuItemSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(menuItemSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {children}
    </>
  );
}
