import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dine-In Table Order | SAPORI CAFE',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
