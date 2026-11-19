import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import AppShell from '@/components/layout/AppShell';
import ToastProvider from '@/components/ui/ToastProvider';

export const metadata: Metadata = {
  title: 'SAPORI CAFÉ & EATERY | A Place to Pause, Sip & Savour | Raja Park, Jaipur',
  description:
    'Handcrafted 48-hour slow-fermented Neapolitan pizzas, specialty Arabica cold brews, and comforting Italian bakery pairings in Raja Park, Jaipur.',
  keywords: [
    'Sapori Cafe Jaipur',
    'Sapori Cafe Raja Park',
    'Cafe in Raja Park Jaipur',
    'Coffee Shop Raja Park Jaipur',
    'Neapolitan Pizza Jaipur',
    'Specialty Coffee Jaipur',
  ],
  authors: [{ name: 'Sapori Café & Eatery' }],
  openGraph: {
    title: 'SAPORI CAFÉ & EATERY | Jaipur',
    description: 'A Place to Pause, Sip & Savour. Handcrafted Neapolitan Pizzas & Specialty Coffee.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F5EFE1] text-[#15370D] min-h-screen flex flex-col antialiased selection:bg-[#15370D] selection:text-[#F5EFE1]">
        <ToastProvider />
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
