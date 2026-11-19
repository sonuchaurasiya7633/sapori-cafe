import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const cms = dbStore.getCMSPage('privacy');
  return {
    title: cms?.seoTitle || 'Privacy Policy | SAPORI CAFÉ & EATERY',
    description: cms?.seoDescription || 'Read our guest privacy practices, PCI-DSS payment security, and data protection policies.',
    keywords: cms?.seoKeywords || 'privacy policy, sapori cafe terms, guest data security',
  };
}

export default function PrivacyPolicyPage() {
  const cms = dbStore.getCMSPage('privacy');
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
            <ShieldCheck className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-black">{fields.title || 'Privacy Policy'}</h1>
          </div>
          <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider">
            Last Updated: {fields.lastUpdated || 'November 2026'} • SAPORI CAFÉ & EATERY
          </p>

          <div className="text-xs text-[#15370D]/85 leading-relaxed space-y-4 pt-2">
            <p>
              {fields.intro ||
                'SAPORI CAFÉ & EATERY located at 217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India values your trust. This Privacy Policy outlines how we collect, handle, and protect your personal information during café ordering, table reservations, and digital interactions.'}
            </p>

            {sectionsList.length > 0 ? (
              sectionsList.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-sm font-bold text-[#15370D] pt-2">{sec.title}</h3>
                  <p>{sec.text}</p>
                </div>
              ))
            ) : (
              <>
                <h3 className="text-sm font-bold text-[#15370D] pt-2">1. Information We Collect</h3>
                <p>
                  When placing an order or reserving a table, we collect necessary guest details such as your name, contact phone number, delivery address (for delivery orders), and optional email address.
                </p>
                <h3 className="text-sm font-bold text-[#15370D] pt-2">2. Payment Security</h3>
                <p>
                  Online transactions are securely processed through PCI-DSS compliant payment gateway providers (Razorpay). We do not store raw card credentials or bank passwords on our servers.
                </p>
                <h3 className="text-sm font-bold text-[#15370D] pt-2">3. How Information Is Used</h3>
                <p>
                  We use your contact details solely to confirm orders, provide kitchen status notifications, coordinate table reservations, and ensure seamless delivery in Raja Park, Jaipur.
                </p>
                <h3 className="text-sm font-bold text-[#15370D] pt-2">4. Contact Inquiries</h3>
                <p>
                  For privacy inquiries, please contact us via phone or WhatsApp at +91 63673 73302.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
