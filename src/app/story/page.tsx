import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Coffee, Pizza, Sparkles, Heart, Award, ShieldCheck } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const storyCMS = dbStore.getCMSPage('story');
  return {
    title: storyCMS?.seoTitle || 'Our Story & Philosophy | SAPORI CAFÉ & EATERY',
    description: storyCMS?.seoDescription || 'The story behind Sapori Cafe, 48-hour slow-fermentation Neapolitan pizza, and specialty coffee science in Raja Park, Jaipur.',
    keywords: storyCMS?.seoKeywords || 'Sapori Story, Neapolitan Pizza Jaipur, Specialty Coffee',
  };
}

export default function StoryPage() {
  const storyCMS = dbStore.getCMSPage('story');

  const introSec = storyCMS?.sections.find((s) => s.id === 'intro');
  const intro = introSec?.fields || {};
  const introVisible = introSec ? introSec.isVisible : true;

  const narrativeSec = storyCMS?.sections.find((s) => s.id === 'narrative');
  const narrative = narrativeSec?.fields || {};
  const narrativeVisible = narrativeSec ? narrativeSec.isVisible : true;

  const coffeeSec = storyCMS?.sections.find((s) => s.id === 'coffee_philosophy');
  const coffee = coffeeSec?.fields || {};
  const coffeeVisible = coffeeSec ? coffeeSec.isVisible : true;

  const pillarsSec = storyCMS?.sections.find((s) => s.id === 'craft_pillars');
  const pillarsVisible = pillarsSec ? pillarsSec.isVisible : true;
  const rawPillars = Array.isArray(pillarsSec?.fields?.items) ? pillarsSec.fields.items : null;

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        {introVisible && (
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
              {intro.badge || 'Our Heritage & Craft'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#15370D] leading-tight">
              {intro.title || 'A Place to Pause, Sip & Savour'}
            </h1>
            <p className="text-sm text-[#15370D]/80 leading-relaxed">
              {intro.description ||
                'Born from an obsession with authentic Neapolitan slow-fermentation and artisanal coffee extraction in Raja Park, Jaipur.'}
            </p>
          </div>
        )}

        {/* Narrative Section 1 */}
        {narrativeVisible && (
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-8 sm:p-12 space-y-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F5EFE1] border border-[#15370D]/20 flex items-center justify-center text-[#15370D]">
              <Pizza className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#15370D]">
              {narrative.title || 'The 48-Hour Neapolitan Philosophy'}
            </h2>
            <div className="text-sm text-[#15370D]/80 leading-relaxed space-y-4">
              <p>
                {narrative.storyPart1 ||
                  'At Sapori, our pizza dough is never rushed. We practice a dedicated 48-hour cold fermentation process using high-protein Italian milled flour, pure water, sea salt, and minimal yeast.'}
              </p>
              <p>
                {narrative.storyPart2 ||
                  'This patient fermentation converts complex starches, resulting in a feather-light cornicione (crust) with signature leopard-spotted charring that is naturally digestible and bursting with rustic flavor.'}
              </p>
            </div>
          </div>
        )}

        {/* Narrative Section 2 */}
        {coffeeVisible && (
          <div className="bg-[#15370D] text-[#F5EFE1] rounded-2xl p-8 sm:p-12 space-y-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FFFFFF]/10 border border-[#F5EFE1]/20 flex items-center justify-center text-[#FFFFFF]">
              <Coffee className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#FFFFFF]">
              {coffee.title || 'Specialty Coffee & Cold Brew Science'}
            </h2>
            <div className="text-sm text-[#F5EFE1]/85 leading-relaxed space-y-4">
              <p>
                {coffee.storyPart1 ||
                  'Our coffee bar operates on micro-calibrated precision. Sourcing specialty Arabica beans, we slow-steep our signature cold brew for over 18 hours to extract velvety sweetness without the acidity.'}
              </p>
              <p>
                {coffee.storyPart2 ||
                  'From our toasted oak barrel-aged single-origin cold brews to handcrafted French custard creams and classic flat whites, each cup is an invitation to pause and savor.'}
              </p>
            </div>
          </div>
        )}

        {/* Pillars */}
        {pillarsVisible && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(
              rawPillars || [
                {
                  title: 'Artisanal Integrity',
                  desc: 'No artificial flavorings, shortcuts or pre-made crusts. Everything is hand-stretched and pulled to order.',
                  icon: 'Award',
                },
                {
                  title: 'Warm Hospitality',
                  desc: 'An inviting, serene sanctuary designed for conversations, solitary reading, and shared Italian warmth.',
                  icon: 'Heart',
                },
                {
                  title: 'Hygienic Standards',
                  desc: 'Pristine culinary workflows, filtered mineral extraction water, and premium dairy handling.',
                  icon: 'ShieldCheck',
                },
              ]
            ).map((pillar: any) => {
              const Icon =
                pillar.icon === 'Heart'
                  ? Heart
                  : pillar.icon === 'ShieldCheck'
                  ? ShieldCheck
                  : Award;
              return (
                <div
                  key={pillar.title}
                  className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-xl p-6 space-y-3 shadow-sm text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F5EFE1] mx-auto flex items-center justify-center text-[#15370D]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#15370D]">{pillar.title}</h3>
                  <p className="text-xs text-[#15370D]/75 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to visit */}
        <div className="text-center pt-6 space-y-4">
          <h3 className="text-xl font-bold text-[#15370D]">Experience It in Person</h3>
          <p className="text-xs text-[#15370D]/75 max-w-md mx-auto">
            Visit us near Panchwati Circle in Raja Park, Jaipur or reserve a table for your next occasion.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/menu"
              className="bg-[#15370D] text-[#FFFFFF] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90 transition-colors"
            >
              Explore Menu
            </Link>
            <Link
              href="/reservations"
              className="bg-[#FFFFFF] border border-[#15370D] text-[#15370D] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#F5EFE1] transition-colors"
            >
              Reserve Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
