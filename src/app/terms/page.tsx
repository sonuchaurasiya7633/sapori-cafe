import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, ShieldAlert } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  return {
    title: `Terms & Conditions | Guest Dining Agreement | ${settings.brandName || 'SAPORI CAFE'}`,
    description:
      'Official Terms and Conditions for dining, online ordering, reservations, and payment processing at Sapori Cafe, Raja Park, Jaipur under applicable Indian laws.',
    keywords:
      'terms and conditions, sapori cafe terms, dining agreement, consumer protection e-commerce rules, jaipur rajasthan jurisdiction',
  };
}

export default function TermsPage() {
  const settings = dbStore.getSettings();

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Return to Homepage</span>
        </Link>

        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-8 sm:p-12 space-y-8 shadow-xs">
          {/* Header */}
          <div className="border-b border-[#15370D]/10 pb-6">
            <div className="inline-flex items-center space-x-2 text-[#DEB853] bg-[#15370D] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
              <FileText className="w-4 h-4" />
              <span>Consumer Protection (E-Commerce) Rules, 2020 Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#15370D]">
              Terms &amp; Conditions of Service
            </h1>
            <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider mt-2">
              SAPORI CAFÉ &amp; EATERY • Raja Park, Jaipur • Last Revised: November 19, 2026
            </p>
          </div>

          <div className="text-xs sm:text-[13px] text-[#15370D]/85 leading-relaxed space-y-6">
            {/* 1. Operating Model Disclosure */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">1. Standalone Restaurant Model Disclosure</h2>
              <p>
                <strong>SAPORI CAFÉ &amp; EATERY</strong> operates exclusively as a <strong>single-brand, inventory-led food and beverage establishment</strong> with its culinary facility located at 217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan 302004, India.
              </p>
              <p>
                This platform is an official direct-ordering channel operated solely by the restaurant and does <strong>not</strong> operate as a multi-seller e-commerce marketplace or third-party intermediary.
              </p>
            </section>

            {/* 2. Menu, Pricing & Invoicing */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">2. Menu Accuracy, Pricing &amp; GST Invoicing</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All prices listed on our menu are in <strong>Indian National Rupees (INR)</strong> and reflect current artisanal preparation rates.</li>
                <li>In accordance with GST Council regulations for restaurants, applicable <strong>Goods &amp; Services Tax (GST @ 5% without ITC)</strong>, mandatory packaging charges, and delivery fees are computed transparently and displayed prior to order checkout.</li>
                <li>A complete digital GST tax invoice is issued upon order confirmation and made available via the order tracking page and WhatsApp notification.</li>
                <li>Menu items are subject to seasonal ingredient freshness (e.g. Italian San Marzano style tomatoes, imported olive oils, fresh mozzarella fior di latte). In the rare event an item is unavailable after placement, our culinary team will contact you immediately to provide a fresh alternative or instant refund.</li>
              </ul>
            </section>

            {/* 3. Table Reservations */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">3. Table Reservation Protocol</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Confirmed table reservations are held for up to <strong>15 minutes</strong> past the scheduled arrival time. If running late, guests are encouraged to notify our reception desk via phone at +91 63673 73302.</li>
                <li>Table reservations are complimentary and do not constitute a commercial ticket or non-refundable cover charge unless expressly agreed for private dining events.</li>
                <li>Special seating preferences (e.g., alfresco terrace, window view, barista counter) are allocated on a best-effort basis subject to dine-in availability.</li>
              </ul>
            </section>

            {/* 4. Food Safety & Allergen Notice */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">4. Food Safety &amp; FSSAI Standards</h2>
              <p>
                Sapori operates in strict compliance with the <strong>Food Safety and Standards Act, 2006</strong>, following high-temperature baking and hygienic food-handling procedures.
              </p>
              <div className="bg-[#DEB853]/15 border border-[#DEB853]/40 rounded-2xl p-4 space-y-1">
                <div className="flex items-center space-x-2 text-[#15370D] font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#DEB853] flex-shrink-0" />
                  <span>Allergen Notice:</span>
                </div>
                <p className="text-[11px] text-[#15370D]/80">
                  Our bakery and kitchen prepare dishes containing <strong>dairy (cheese, milk, butter), gluten (wheat dough), nuts (pinenuts, walnuts in pestos), and soy</strong>. While we practice rigorous station sanitation, cross-contact is possible. Guests with severe dietary allergies must inform our culinary team prior to placing orders.
                </p>
              </div>
            </section>

            {/* 5. Online Payments & Anti-Fraud Controls */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">5. Payment Processing &amp; Anti-Fraud Controls</h2>
              <p>
                Online transactions are settled via RBI-regulated payment aggregators (including UPI, NetBanking, Debit/Credit Cards, and digital wallets). Any unauthorized attempts to manipulate order payloads, tamper with client-side total amounts, or submit spoofed webhook events are logged with IP signatures and reported under the Information Technology Act, 2000.
              </p>
            </section>

            {/* 6. Intellectual Property */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">6. Intellectual Property Rights</h2>
              <p>
                All trademarks, logos, menu photography, typography, proprietary recipes, and visual assets associated with &quot;SAPORI CAFÉ &amp; EATERY&quot; belong exclusively to Sapori. Unauthorized reproduction, web scraping, or commercial misuse is strictly prohibited without prior written consent.
              </p>
            </section>

            {/* 7. Governing Law & Dispute Resolution */}
            <section className="border-t border-[#15370D]/15 pt-6 space-y-2">
              <div className="flex items-center space-x-2 text-[#15370D] font-black text-base">
                <Scale className="w-4 h-4 text-[#DEB853]" />
                <span>7. Governing Law &amp; Jurisdiction</span>
              </div>
              <p>
                These Terms and Conditions shall be governed by, construed, and enforced in accordance with the <strong>laws of the Republic of India</strong>. In the event of any dispute, claim, or controversy arising out of or relating to your dining experience or online ordering, the parties agree to first seek mutual amicable resolution through our designated Grievance Officer.
              </p>
              <p>
                If unresolved, any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts in <strong>Jaipur, Rajasthan, India</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
