'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, ShieldCheck, Compass, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/data/seedMenu';

// Google Maps Brand Pin Icon
const GoogleMapsPinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill="#D93025"
    />
    <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
  </svg>
);

// WhatsApp Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.97.58 3.86 1.67 5.48L2 22l4.78-1.55c1.55.99 3.37 1.51 5.26 1.51 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.68 0-3.29-.48-4.69-1.39l-.34-.22-3.11 1.01 1.03-3.03-.24-.37c-1.02-1.57-1.56-3.39-1.56-5.24 0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2zm4.56-6.14c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.13-.17.25-.66.81-.81.98-.15.17-.3.19-.55.07-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.43-.57-.43h-.48c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.46 1.04 2.63c.13.17 1.79 2.73 4.34 3.83.61.26 1.08.42 1.45.54.61.19 1.17.17 1.61.1.49-.07 1.48-.61 1.69-1.19.21-.58.21-1.09.15-1.19-.07-.1-.23-.17-.48-.29z" />
  </svg>
);

// Social Media Icons in Circular Rings
const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.brandName) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const cleanPhone = settings.contactPhone.replace(/\D/g, '').slice(-10);
  const cleanWa = settings.whatsappNumber.replace(/\D/g, '').slice(-10);

  const exploreLinks = [
    { label: 'Full Menu & Pairings', href: '/menu' },
    { label: 'Reserve a Table', href: '/reservations' },
    { label: 'Our Philosophy & Story', href: '/story' },
    { label: 'Café Gallery', href: '/gallery' },
    { label: 'Guest Reviews', href: '/reviews' },
    { label: 'Offers & Promotions', href: '/offers' },
  ];

  return (
    <footer className="relative bg-[#0d2a0a] text-[#F5EFE1] overflow-hidden select-none">
      {/* Main Content Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* Column 1: Branding & Philosophy (Clean background - no ghosted logo) */}
          <div className="lg:col-span-4 space-y-3.5 pr-0 lg:pr-4">
            <div className="flex flex-col items-start space-y-1">
              {/* Elegant Golden Oval Logo */}
              <div className="text-[#DEB853]">
                <svg
                  viewBox="0 0 240 100"
                  width="170"
                  height="70"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-200"
                >
                  <g transform="translate(120, 24)">
                    <ellipse cx="0" cy="0" rx="46" ry="18" fill="none" stroke="#DEB853" strokeWidth="1.8" />
                    <ellipse cx="0" cy="0" rx="42" ry="15" fill="none" stroke="#DEB853" strokeWidth="0.9" />
                    <path
                      d="M -16 -4 C -7 -12, 10 -11, 19 -1 C 21 0, 19 2, 16 1 C 8 -5, -4 -6, -14 0 Z"
                      fill="#DEB853"
                    />
                    <path d="M -16 -4 C -21 -6, -23 -3, -20 -1 Z" fill="#DEB853" />
                    <path
                      d="M -23 4 C -12 -3, 8 -3, 29 4 C 33 6, 27 8, 22 7 C 5 2, -10 2, -20 7 Z"
                      fill="#DEB853"
                    />
                    <path d="M -24 4 C -28 3, -31 5, -29 8 Z" fill="#DEB853" />
                  </g>
                  <text
                    x="120"
                    y="72"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: 900,
                      fontSize: "34px",
                      letterSpacing: "4px",
                    }}
                  >
                    SAPORI
                  </text>
                  <text
                    x="120"
                    y="91"
                    textAnchor="middle"
                    fill="#DEB853"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: 600,
                      fontSize: "9px",
                      letterSpacing: "6px",
                    }}
                  >
                    — CAFÉ & EATERY —
                  </text>
                </svg>
              </div>

              {/* Tagline in Golden Script */}
              <p className="font-script text-[#DEB853] text-2xl sm:text-[26px] leading-tight pt-1">
                A Place to Pause, Sip &amp; Savour
              </p>

              {/* Coffee Bean Motif */}
              <div className="flex items-center space-x-2 py-0.5 text-[#DEB853]/70">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#DEB853]" />
                <svg className="w-3 h-3 fill-current text-[#DEB853]" viewBox="0 0 24 24">
                  <path d="M18.5 4.5c-3.5-2-8.5-1-12 2.5s-4.5 8.5-2.5 12 8.5 1 12-2.5 4.5-8.5 2.5-12zm-3.8 3.5c1.2 2 1 4.5-.4 6.5s-3.7 3-6.1 2.8c-1.2-2-1-4.5.4-6.5s3.7-3 6.1-2.8z" />
                </svg>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#DEB853]" />
              </div>

              {/* Tracked Categories Line */}
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#F5EFE1]/90 uppercase pt-0.5">
                {settings.secondaryBrandLine || 'FOOD • COFFEE • GOOD VIBES'}
              </p>
            </div>

            <p className="text-xs sm:text-[13px] text-[#F5EFE1]/75 leading-relaxed pt-1 max-w-sm">
              Artisanal Neapolitan pizzas fermented for 48 hours, precision specialty Arabica roasts, and comforting Italian bakery pairings in Raja Park, Jaipur.
            </p>
          </div>

          {/* Column 2: Explore (Col span 2) */}
          <div className="lg:col-span-2 lg:border-r border-[#DEB853]/20 lg:pr-6">
            <div className="flex items-center space-x-2 text-[#DEB853] mb-4 pb-1">
              <div className="w-6 h-6 rounded-full border border-[#DEB853]/70 flex items-center justify-center text-[#DEB853]">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">
                Explore
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between text-[#F5EFE1]/80 hover:text-white transition-colors duration-150 py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-150">
                      {link.label}
                    </span>
                    <span className="text-[#DEB853]/70 group-hover:text-[#DEB853] group-hover:translate-x-1 transition-all text-xs font-semibold">
                      &gt;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Visit & Connect (Col span 3) */}
          <div className="lg:col-span-3 space-y-3 lg:px-2">
            <div className="flex items-center space-x-2 text-[#DEB853] mb-4 pb-1">
              <div className="w-6 h-6 rounded-full border border-[#DEB853]/70 flex items-center justify-center text-[#DEB853]">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">
                Visit &amp; Connect
              </h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-[13px]">
              <li className="flex items-start space-x-2.5 text-[#F5EFE1]/85">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#DEB853]" />
                <span className="leading-snug text-xs">
                  {settings.address || '217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India'}
                </span>
              </li>
              <li className="flex items-center space-x-2.5 text-[#F5EFE1]/85">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#DEB853]" />
                <a href={`tel:+91${cleanPhone}`} className="hover:text-white font-medium transition-colors">
                  {settings.contactPhone || '+91 63673 73302'}
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-[#F5EFE1]/85">
                <WhatsAppIcon className="w-4 h-4 flex-shrink-0 text-[#DEB853]" />
                <a
                  href={`https://wa.me/91${cleanWa}?text=Hello%20Sapori%20Cafe%2C%20I%20would%20like%20to%20place%20an%20order.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline font-medium transition-colors"
                >
                  WhatsApp Ordering &amp; Support
                </a>
              </li>
              <li className="flex items-start space-x-2.5 text-[#F5EFE1]/85">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#DEB853]" />
                <span className="text-xs leading-snug">
                  {settings.operatingHours || 'Monday – Sunday: 10:00 AM – 11:30 PM'}
                </span>
              </li>
            </ul>

            {/* Golden Get Directions Pill Button */}
            <div className="pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Sapori+Cafe+%26+Eatery+Raja+Park+Jaipur"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#DEB853] via-[#E7C769] to-[#D5AD41] hover:from-[#E7C769] hover:to-[#DEB853] text-[#15370D] font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <GoogleMapsPinIcon className="w-3.5 h-3.5" />
                <span>Get Directions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 4: Assurance & Security (Col span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <div className="flex items-center space-x-2 text-[#DEB853] mb-4 pb-1">
              <div className="w-6 h-6 rounded-full border border-[#DEB853]/70 flex items-center justify-center text-[#DEB853]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">
                Assurance
              </h3>
            </div>
            <p className="text-xs text-[#F5EFE1]/80 leading-relaxed">
              Every pizza is hand-stretched to order. We adhere to authentic slow-cold fermentation, high-temperature deck baking, and ethically sourced coffee roasts.
            </p>

            {/* Branded Security Card */}
            <div className="bg-[#15380e]/90 border border-[#3b6b2f]/60 rounded-2xl p-4 shadow-sm space-y-1.5 backdrop-blur-sm">
              <div className="flex items-center text-white font-bold space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#DEB853] flex-shrink-0" />
                <span>Secure Kitchen &amp; Payments</span>
              </div>
              <p className="text-[11px] text-[#F5EFE1]/75 leading-relaxed">
                PCI-DSS certified payment workflows, encrypted session credentials, and hygienic culinary workflows.
              </p>
            </div>
          </div>

        </div>

        {/* Center Sub-Row: Stay Connected with Golden Flourish & Social Circle Pills */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 border-t border-[#DEB853]/15">
          <div className="flex flex-col items-center">
            <span className="font-script text-[#DEB853] text-xl sm:text-2xl leading-none">
              Stay Connected
            </span>
            <svg className="w-28 h-2 text-[#DEB853]/60 -mt-0.5" viewBox="0 0 100 8" fill="none">
              <path d="M 0 4 Q 50 8, 100 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center space-x-3.5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sapori on Instagram"
              className="w-8 h-8 rounded-full border border-white/40 hover:border-[#DEB853] flex items-center justify-center text-white/85 hover:text-[#DEB853] hover:shadow-[0_0_12px_rgba(222,184,83,0.5)] hover:scale-105 transition-all duration-200"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sapori on Facebook"
              className="w-8 h-8 rounded-full border border-white/40 hover:border-[#DEB853] flex items-center justify-center text-white/85 hover:text-[#DEB853] hover:shadow-[0_0_12px_rgba(222,184,83,0.5)] hover:scale-105 transition-all duration-200"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sapori on YouTube"
              className="w-8 h-8 rounded-full border border-white/40 hover:border-[#DEB853] flex items-center justify-center text-white/85 hover:text-[#DEB853] hover:shadow-[0_0_12px_rgba(222,184,83,0.5)] hover:scale-105 transition-all duration-200"
            >
              <YouTubeIcon className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sapori on LinkedIn"
              className="w-8 h-8 rounded-full border border-white/40 hover:border-[#DEB853] flex items-center justify-center text-white/85 hover:text-[#DEB853] hover:shadow-[0_0_12px_rgba(222,184,83,0.5)] hover:scale-105 transition-all duration-200"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Sweeping Golden Wave Divider Container */}
      <div className="relative w-full overflow-hidden leading-none z-10 -mb-[1px]">
        <svg
          className="relative block w-full h-8 sm:h-12 md:h-16"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          {/* Base cream wave fill */}
          <path
            d="M 0,80 C 400,120 900,20 1440,65 L 1440,120 L 0,120 Z"
            fill="#F5EFE1"
          />
          {/* Elegant gold accent curve line */}
          <path
            d="M 0,80 C 400,120 900,20 1440,65"
            fill="none"
            stroke="#DEB853"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Dynamic Culinary Art / Banner Visual (Desktop View: Softly Feathered, Unclipped) */}
      {settings.footerImageUrl ? (
        <div className="hidden lg:block absolute bottom-0 right-0 z-20 pointer-events-none select-none">
          <img
            src={settings.footerImageUrl}
            alt="Artisanal Cafe Culinary Craft"
            className="w-72 xl:w-88 2xl:w-96 h-auto object-contain object-bottom"
          />
        </div>
      ) : null}

      {/* Bottom Legal & Policy Bar on Warm Cream */}
      <div className="relative bg-[#F5EFE1] text-[#15370D] py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 border-t border-[#DEB853]/40 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-start text-xs sm:text-[13px] text-[#15370D]/85 space-y-2 md:space-y-0 text-center md:text-left font-medium">
          <p className="mr-0 md:mr-4">© {currentYear} {settings.brandName || 'SAPORI CAFÉ & EATERY'}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[13px] text-[#15370D]/80">
            <span className="hidden md:inline text-[#15370D]/35">|</span>
            <Link href="/privacy" className="hover:text-[#15370D] hover:underline transition-colors py-0.5">
              Privacy Policy
            </Link>
            <span className="text-[#15370D]/35">|</span>
            <Link href="/terms" className="hover:text-[#15370D] hover:underline transition-colors py-0.5">
              Terms &amp; Conditions
            </Link>
            <span className="text-[#15370D]/35">|</span>
            <Link href="/cancellation" className="hover:text-[#15370D] hover:underline transition-colors py-0.5">
              Cancellation &amp; Refund Policy
            </Link>
            <span className="text-[#15370D]/35">|</span>
            <Link href="/faq" className="hover:text-[#15370D] hover:underline transition-colors py-0.5">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;