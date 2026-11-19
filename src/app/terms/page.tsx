import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, FileText } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const cms = dbStore.getCMSPage('terms');
  return {
    title: cms?.seoTitle || 'Terms & Conditions | SAPORI CAFÉ & EATERY',
    description: cms?.seoDescription || 'Review the dining terms, online ordering guidelines, and table reservation policies of Sapori Cafe.',
    keywords: cms?.seoKeywords || 'terms and conditions, sapori cafe policies, raja park jaipur',
  };
}

export default function TermsPage() {
  const cms = dbStore.getCMSPage('terms');
  const contentSec = cms?.sections.find((s) => s.id === 'content');
  const fields = contentSec?.fields || {};
  const sectionsList = Array.isArray(fields.sections) ? fields.sections : [];

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

        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 sm:p-12 space-y-6 shadow-sm">
          <div className="flex items-center space-x-2 text-[#15370D]">
            <FileText className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-black">{fields.title || 'Terms & Conditions'}</h1>
          </div>
          <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider">
            SAPORI CAFÉ & EATERY • Raja Park, Jaipur
          </p>

          <div className="text-xs text-[#15370D]/85 leading-relaxed space-y-4 pt-2">
            {sectionsList.length > 0 ? (
              sectionsList.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-sm font-bold text-[#15370D] pt-2">{sec.title}</h3>
                  <p>{sec.text}</p>
                </div>
              ))
            ) : (
              <>
                <h3 className="text-sm font-bold text-[#15370D]">1. Menu & Pricing</h3>
                <p>
                  All prices are listed in Indian Rupees (INR). Applicable taxes and packaging/delivery fees are calculated and clearly disclosed prior to order confirmation. Menu items and availability may vary based on fresh daily ingredient stock.
                </p>
                <h3 className="text-sm font-bold text-[#15370D]">2. Table Reservations</h3>
                <p>
                  Reserved tables are held for up to 15 minutes past the scheduled booking time. If you expect a delay, please contact our hospitality team at +91 63673 73302.
                </p>
                <h3 className="text-sm font-bold text-[#15370D]">3. Kitchen Preparation</h3>
                <p>
                  Because our pizzas and coffees are handcrafted to order, preparation times may vary during peak hours. Estimated preparation windows are provided in good faith.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
