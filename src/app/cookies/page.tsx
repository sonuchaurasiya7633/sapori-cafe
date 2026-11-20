import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Cookie, ShieldCheck, CheckCircle2, Sliders, ToggleLeft } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  return {
    title: `Cookie Policy & Tracking Preferences | ${settings.brandName || 'SAPORI CAFE'}`,
    description:
      'Learn about how Sapori Café uses essential and analytics cookies, and manage your cookie consent preferences in compliance with the DPDP Act 2023.',
    keywords:
      'cookie policy, sapori cafe cookies, consent management, DPDP tracking preferences, google analytics cookies',
  };
}

export default function CookiePolicyPage() {
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
              <Cookie className="w-4 h-4" />
              <span>DPDP Act (India) &amp; Global Privacy Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#15370D]">
              Cookie Policy &amp; Tracking Notice
            </h1>
            <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider mt-2">
              SAPORI CAFÉ &amp; EATERY • Raja Park, Jaipur • Last Revised: November 19, 2026
            </p>
          </div>

          <div className="text-xs sm:text-[13px] text-[#15370D]/85 leading-relaxed space-y-6">
            {/* 1. What are cookies */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">1. What Are Cookies and Local Storage?</h2>
              <p>
                Cookies are small text files placed on your browser or device when you visit a website. Together with HTML5 Local Storage, they enable the site to remember your preferences (such as your shopping cart items and active session) and understand how visitors interact with our digital culinary experience.
              </p>
            </section>

            {/* 2. Categorization */}
            <section className="space-y-3">
              <h2 className="text-base font-black text-[#15370D]">2. Categories of Cookies Used on Sapori Café</h2>

              <div className="space-y-3">
                <div className="border border-[#15370D]/20 rounded-2xl p-4 bg-[#F5EFE1]/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15370D] flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-700" />
                      <span>Strictly Necessary Cookies (Always Active)</span>
                    </span>
                    <span className="bg-[#15370D] text-[#DEB853] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Mandatory
                    </span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/80">
                    Essential for secure authentication, shopping cart persistence, CSRF protection, and checkout processing. These cookies cannot be disabled without breaking the core ordering functionality.
                  </p>
                  <p className="text-[10px] font-mono text-[#15370D]/60 pt-1">
                    Examples: <code>sapori_admin_session</code> (Encrypted session token, HttpOnly, Secure, 7 days), <code>sapori_cart_v1</code> (Local Storage, shopping bag retention).
                  </p>
                </div>

                <div className="border border-[#15370D]/20 rounded-2xl p-4 bg-[#F5EFE1]/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15370D] flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-[#DEB853]" />
                      <span>Functional &amp; Preference Cookies</span>
                    </span>
                    <span className="bg-[#DEB853]/30 text-[#15370D] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/80">
                    Remembers your table number, delivery address, and banner preferences for a smoother subsequent visit.
                  </p>
                  <p className="text-[10px] font-mono text-[#15370D]/60 pt-1">
                    Examples: <code>sapori_cookie_consent</code> (Stores your cookie preferences, 365 days).
                  </p>
                </div>

                <div className="border border-[#15370D]/20 rounded-2xl p-4 bg-[#F5EFE1]/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15370D] flex items-center space-x-2">
                      <ToggleLeft className="w-4 h-4 text-amber-700" />
                      <span>Analytics &amp; Performance Cookies (Google Analytics 4)</span>
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Consent Required
                    </span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/80">
                    Aggregated analytics that help us monitor page load speeds, popular artisan dishes, and site usability. All IP addresses are automatically masked.
                  </p>
                  <p className="text-[10px] font-mono text-[#15370D]/60 pt-1">
                    Examples: <code>_ga</code>, <code>_ga_*</code> (Google Analytics, 2 years).
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Managing Preferences */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">3. How to Manage or Withdraw Cookie Consent</h2>
              <p>
                You maintain complete control over cookie storage. You can adjust your consent at any time:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Interactive Cookie Banner:</strong> When visiting Sapori Café, our consent banner allows you to &quot;Accept All&quot; or &quot;Decline Non-Essential Cookies&quot;.</li>
                <li><strong>Browser Settings:</strong> You can block or delete cookies through your browser settings (Chrome, Safari, Firefox, Edge). Note that blocking essential cookies may disable your shopping cart and online checkout.</li>
              </ul>
            </section>

            {/* 4. Contact */}
            <section className="border-t border-[#15370D]/15 pt-6 space-y-2">
              <h2 className="text-base font-black text-[#15370D]">4. Privacy &amp; Cookie Inquiries</h2>
              <p>
                If you have questions regarding our cookie practices, please contact our Data Protection Desk at <strong>hello@saporicafe.in</strong> or review our full <Link href="/privacy" className="text-[#15370D] font-bold underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
