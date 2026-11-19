import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const cms = dbStore.getCMSPage('faq');
  return {
    title: cms?.seoTitle || 'Frequently Asked Questions | SAPORI CAFÉ & EATERY',
    description: cms?.seoDescription || 'Answers to common questions regarding our authentic Neapolitan pizzas, alcohol-free barrel-aged cold brews, table bookings and contactless QR ordering.',
    keywords: cms?.seoKeywords || 'Sapori Cafe FAQs, Pizza Jaipur, Table Booking',
  };
}

export default function FAQPage() {
  const cms = dbStore.getCMSPage('faq');
  const headerSec = cms?.sections.find((s) => s.id === 'faq_header');
  const header = headerSec?.fields || {};

  const listSec = cms?.sections.find((s) => s.id === 'faq_list');
  const rawFaqs = Array.isArray(listSec?.fields?.items) ? listSec.fields.items : null;

  const defaultFaqs = [
    {
      q: 'Where is Sapori Café located in Jaipur?',
      a: 'We are located at 217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India.',
    },
    {
      q: 'What makes your pizzas authentic Neapolitan style?',
      a: 'We cold-ferment our dough for 48 hours to create an airy, digestible crust with signature blistered leopard charring, baked at intense deck temperatures.',
    },
    {
      q: 'Is the Rum & Whiskey Barrel-Aged Cold Brew alcoholic?',
      a: 'No. As stated on our official menu, our barrel-aged cold brew is completely alcohol-free. It absorbs fragrant toasted oak and caramel notes from cured barrels while remaining 100% non-alcoholic.',
    },
    {
      q: 'Can I customize my pizza with extra cheese?',
      a: 'Yes! You can add Fresh Mozzarella Cheese (+₹65) or Grated Aged Parmesan Cheese (+₹65) to any pizza directly when adding it to your basket.',
    },
    {
      q: 'Do you offer dine-in table reservations?',
      a: 'Yes, you can reserve a table anytime through our website under the Reservations tab or by calling +91 63673 73302.',
    },
    {
      q: 'How does table QR ordering work?',
      a: 'When seated at Sapori, scan the QR code located on your table. Your browser will open the menu with your table number pre-selected. You can add items, customize preferences, and submit directly to our kitchen.',
    },
  ];

  const faqs = rawFaqs || defaultFaqs;

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            {header.badge || 'Common Inquiries'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#15370D]">
            {header.title || 'Frequently Asked Questions'}
          </h1>
          <p className="text-sm text-[#15370D]/80 leading-relaxed">
            {header.description ||
              'Everything you need to know about our dough fermentation, cold brews, reservations, and dining policies.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-6 space-y-2 shadow-xs"
            >
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-[#15370D] flex-shrink-0 mt-0.5" />
                <h3 className="text-sm sm:text-base font-bold text-[#15370D]">{faq.q}</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#15370D]/80 leading-relaxed pl-8">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-6 text-center space-y-3">
          <h3 className="text-sm font-bold text-[#15370D]">Still have questions?</h3>
          <p className="text-xs text-[#15370D]/70">
            Feel free to give us a call at +91 63673 73302 or send a WhatsApp message anytime.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] underline"
            >
              Go to Contact Page &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
