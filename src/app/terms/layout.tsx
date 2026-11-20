import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SAPORI CAFE',
  description: 'Official terms and conditions for orders, table reservations, and dining services at Sapori Cafe, Jaipur.',
  alternates: {
    canonical: `${getBaseUrl()}/terms`,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
