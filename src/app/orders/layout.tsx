import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Status & Tracking | SAPORI CAFE',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
