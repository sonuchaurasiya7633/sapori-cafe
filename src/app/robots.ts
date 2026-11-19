import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/orders/',
          '/table/',
          '/maintenance',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/orders/',
          '/table/',
          '/maintenance',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
