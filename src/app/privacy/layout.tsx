import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sapori Café & Eatery',
  description: 'Official privacy policy and customer data handling practices of Sapori Café & Eatery, Raja Park, Jaipur.',
  alternates: {
    canonical: `${getBaseUrl()}/privacy`,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
