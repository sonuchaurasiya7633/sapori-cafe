import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Camera, Pizza, Coffee, Sparkles } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const cms = dbStore.getCMSPage('gallery');
  return {
    title: cms?.seoTitle || 'Café Gallery & Atmosphere | SAPORI CAFE',
    description: cms?.seoDescription || 'Browse photography of our artisanal pizzas, specialty coffee brews, and serene cafe ambiance in Raja Park, Jaipur.',
    keywords: cms?.seoKeywords || 'Sapori Cafe Gallery, Photos, Raja Park Jaipur Cafe',
  };
}

export default function GalleryPage() {
  const cms = dbStore.getCMSPage('gallery');
  const headerSec = cms?.sections.find((s) => s.id === 'gallery_header');
  const header = headerSec?.fields || {};

  const gridSec = cms?.sections.find((s) => s.id === 'gallery_grid');
  const rawItems = Array.isArray(gridSec?.fields?.items) ? gridSec.fields.items : null;

  const defaultItems = [
    { title: 'The Wood-Deck Crust', category: 'Neapolitan Pizzas', subtitle: '48-hour slow fermentation blistered at high heat' },
    { title: 'Specialty Cold Brew Tap', category: 'Espresso Bar', subtitle: '18-hour cold steeped single-origin Arabica' },
    { title: 'Artisanal Brioche Toast', category: 'Bakery', subtitle: 'Torched vanilla bean crème brûlée pastry' },
    { title: 'Hand-Pulled Flat White', category: 'Espresso Bar', subtitle: 'Glossy textured whole milk & double ristretto' },
    { title: 'Stone-Baked Panuozzo', category: 'Italian Sandwiches', subtitle: 'Caprese mozzarella and fresh Genovese basil' },
    { title: 'Tiramisu Affogato', category: 'Frappé & Gelato', subtitle: 'Madagascar vanilla gelato drowned in hot espresso' },
    { title: 'Truffle & Parmesan Frites', category: 'Frites', subtitle: 'Hand-cut fries perfumed with white truffle oil' },
    { title: 'Peaceful Raja Park Dining', category: 'Café Atmosphere', subtitle: 'A warm sanctuary to pause, sip and savor' },
  ];

  const galleryItems = rawItems || defaultItems;

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            {header.badge || 'Visual Story'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#15370D]">
            {header.title || 'Café Gallery & Moments'}
          </h1>
          <p className="text-sm text-[#15370D]/80 leading-relaxed">
            {header.description ||
              'A glimpse into our kitchen craft, artisanal espresso extractions, and the cozy corners of Sapori in Raja Park, Jaipur.'}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-6 flex flex-col justify-between hover:border-[#15370D]/40 transition-all shadow-sm hover:shadow-md group h-64"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5EFE1] border border-[#15370D]/20 flex items-center justify-center text-[#15370D] group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/60 block">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-[#15370D] group-hover:underline">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-[#15370D]/70 pt-2 border-t border-[#15370D]/10">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom invitation */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <h3 className="text-xl font-bold text-[#15370D]">Join Us in Person</h3>
          <p className="text-xs text-[#15370D]/75">
            Nothing compares to the aroma of freshly blistered pizza dough and freshly pulled espresso. We look forward to welcoming you.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/reservations"
              className="bg-[#15370D] text-[#FFFFFF] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90 transition-colors"
            >
              Reserve Table
            </Link>
            <Link
              href="/menu"
              className="bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FFFFFF] transition-colors"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
