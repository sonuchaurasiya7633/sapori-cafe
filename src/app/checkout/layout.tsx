import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | SAPORI CAFE',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
