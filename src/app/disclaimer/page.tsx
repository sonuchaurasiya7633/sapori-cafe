import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, AlertCircle, ShieldAlert, Info, Scale } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  return {
    title: `Website & Culinary Disclaimer | ${settings.brandName || 'SAPORI CAFE'}`,
    description:
      'Official website disclaimer covering menu illustrations, seasonal ingredient availability, dietary allergen notices, and balanced liability limits under Indian law.',
    keywords:
      'website disclaimer, food allergy warning, sapori cafe jaipur terms, culinary disclaimer',
  };
}

export default function DisclaimerPage() {
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
              <AlertCircle className="w-4 h-4" />
              <span>Legal Disclaimers &amp; Culinary Notices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#15370D]">
              Website &amp; Food Disclaimer
            </h1>
            <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider mt-2">
              SAPORI CAFÉ &amp; EATERY • Raja Park, Jaipur • Last Revised: November 19, 2026
            </p>
          </div>

          <div className="text-xs sm:text-[13px] text-[#15370D]/85 leading-relaxed space-y-6">
            {/* 1. Menu Representations & Fresh Variations */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">1. Visual Representations &amp; Artisan Craft Variations</h2>
              <p>
                Photographs, digital mockups, and illustrations displayed on this website represent actual culinary creations crafted in our kitchen. However, because our pizzas are hand-kneaded, naturally fermented for 48 hours, and baked in high-temperature pizza ovens, natural variations in dough blistering (leopard spotting), crust rise, herb garnishing, and cheese melting patterns will occur on each freshly made item.
              </p>
            </section>

            {/* 2. Allergen Advisory */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">2. Allergen &amp; Cross-Contact Advisory</h2>
              <p>
                Sapori processes a variety of agricultural ingredients across its beverage bar, bakery stations, and deck ovens. We take food safety seriously and adhere to FSSAI hygiene standards.
              </p>
              <div className="bg-[#DEB853]/15 border border-[#DEB853]/35 rounded-2xl p-4 space-y-1.5">
                <p className="font-bold text-[#15370D]">Important Allergen Warning:</p>
                <p className="text-[11px] text-[#15370D]/80">
                  Items prepared in our kitchen may contain or come into contact with common allergens including <strong>milk/dairy, wheat/gluten, tree nuts (pine nuts, walnuts), and soy</strong>. While kitchen staff sanitizes preparation surfaces between batches, 100% allergen-free environments cannot be guaranteed. Guests with severe or life-threatening food allergies dine at their own discretion and must notify staff prior to ordering.
                </p>
              </div>
            </section>

            {/* 3. Third-Party Links & Services */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">3. External Links &amp; Third-Party Services</h2>
              <p>
                This website integrates third-party tools such as Google Maps (for directions), Google Analytics (for site optimization), Cloudinary (for media delivery), and Razorpay (for payment aggregation). While we partner exclusively with established enterprise providers, Sapori does not control and is not liable for third-party server downtimes, external network latency, or external web content.
              </p>
            </section>

            {/* 4. Limitation of Liability */}
            <section className="border-t border-[#15370D]/15 pt-6 space-y-2">
              <div className="flex items-center space-x-2 text-[#15370D] font-black text-base">
                <Scale className="w-4 h-4 text-[#DEB853]" />
                <span>4. Balanced Limitation of Liability</span>
              </div>
              <p>
                To the fullest extent permissible under the Consumer Protection Act, 2019 and applicable Indian laws, Sapori Café &amp; Eatery shall not be liable for indirect, incidental, or consequential damages resulting from technical interruptions, internet carrier failures, or temporary website maintenance.
              </p>
              <p>
                Nothing in this disclaimer shall exclude or limit liability for gross negligence, willful misconduct, consumer rights protected by law, or proven food safety violations where liability cannot be excluded under the Food Safety and Standards Act, 2006.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
