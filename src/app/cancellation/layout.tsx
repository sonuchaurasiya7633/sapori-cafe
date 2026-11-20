import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | SAPORI CAFE',
  description: 'Official cancellation, change, and refund policy for orders and reservations at Sapori Cafe, Jaipur.',
  alternates: {
    canonical: `${getBaseUrl()}/cancellation`,
  },
};

export default function CancellationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
