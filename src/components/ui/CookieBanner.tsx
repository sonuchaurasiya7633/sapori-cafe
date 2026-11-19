'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem('sapori_cookie_consent');
    if (!consent) {
      // Delay showing banner by 1.2s for pleasant UX
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sapori_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('sapori_cookie_consent', 'declined');
    // Disable Google Analytics if tracking exists
    if (typeof window !== 'undefined') {
      const gaId = (window as any).SAPORI_GA_ID;
      if (gaId) {
        (window as any)[`ga-disable-${gaId}`] = true;
      }
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#15370D] text-[#F5EFE1] border border-[#DEB853]/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="w-8 h-8 rounded-full bg-[#DEB853]/20 border border-[#DEB853]/40 flex items-center justify-center text-[#DEB853] flex-shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Your Privacy &amp; Cookie Choices
            </h3>
            <p className="text-[11px] sm:text-xs text-[#F5EFE1]/80 leading-relaxed">
              We use strictly necessary cookies to process orders, alongside privacy-conscious analytics to optimize our artisanal menu in compliance with the DPDP Act 2023.{' '}
              <Link href="/cookies" className="text-[#DEB853] underline hover:text-white transition-colors">
                Learn more
              </Link>
            </p>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Dismiss cookie notice"
            className="text-[#F5EFE1]/60 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end space-x-2 text-xs">
          <button
            onClick={handleDecline}
            className="px-3.5 py-1.5 rounded-full border border-white/20 text-[#F5EFE1]/80 hover:text-white hover:border-white/40 transition-colors text-[11px] font-semibold"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="bg-[#DEB853] text-[#15370D] px-4 py-1.5 rounded-full font-bold hover:bg-[#DEB853]/90 transition-colors text-[11px] uppercase tracking-wider shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
