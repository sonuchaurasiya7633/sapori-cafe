import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const cms = dbStore.getCMSPage('cancellation');
  return {
    title: cms?.seoTitle || 'Cancellation & Refund Policy | SAPORI CAFÉ & EATERY',
    description: cms?.seoDescription || 'Review our order cancellation window, kitchen acceptance terms, and payment refund turnaround guidelines.',
    keywords: cms?.seoKeywords || 'cancellation policy, refunds, sapori cafe jaipur',
  };
}

export default function CancellationRefundPage() {
  const cms = dbStore.getCMSPage('cancellation');
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
            <RefreshCw className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-black">
              {fields.title || 'Cancellation & Refund Policy'}
            </h1>
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
                <h3 className="text-sm font-bold text-[#15370D]">1. Order Cancellations</h3>
                <p>
                  Food orders can be cancelled only before the kitchen marks the order as ACCEPTED or PREPARING. Once dough stretching and baking has commenced, orders cannot be cancelled due to perishable preparation.
                </p>
                <h3 className="text-sm font-bold text-[#15370D]">2. Online Payment Refunds</h3>
                <p>
                  If a transaction fails or an eligible cancellation is approved before preparation, the refund is initiated through our payment gateway back to the original payment source (UPI/Card/Bank) within 5–7 business days.
                </p>
                <h3 className="text-sm font-bold text-[#15370D]">3. Quality & Service Discrepancies</h3>
                <p>
                  If there is an issue with your dish or missing items, please report it immediately to our management at +91 63673 73302. We prioritize your dining satisfaction and will resolve it promptly with a fresh remake or appropriate credit.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
