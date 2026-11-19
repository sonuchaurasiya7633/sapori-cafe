import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Search Dishes, Artisanal Pizzas & Specialty Coffee | Sapori Café',
  description: 'Search our full menu of 48-hour fermented Neapolitan pizzas, double-cooked frites, panuozzos, and specialty roasts at Sapori Café Jaipur.',
  alternates: {
    canonical: `${getBaseUrl()}/search`,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
