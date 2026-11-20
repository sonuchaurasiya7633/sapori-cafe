import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  ArrowRight,
  Coffee,
  Pizza,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Award,
  UtensilsCrossed,
} from 'lucide-react';
import { dbStore } from '@/lib/db/store';
import ProductCard from '@/components/menu/ProductCard';

export async function generateMetadata(): Promise<Metadata> {
  let homeCMS = dbStore.getCMSPage('home') || dbStore.getCMSPage('/');
  try {
    const { connectToDatabase } = await import('@/lib/db/mongodb');
    const { CMSPageModel } = await import('@/lib/db/models');
    await connectToDatabase();
    const dbDoc = await CMSPageModel.findOne({ $or: [{ slug: '/' }, { slug: 'home' }, { id: 'home' }] }).lean();
    if (dbDoc) {
      homeCMS = dbDoc as any;
    }
  } catch (e) {
    // fallback to store
  }

  const title = homeCMS?.seoTitle || 'SAPORI CAFE | A Place to Pause, Sip & Savour';
  const description =
    homeCMS?.seoDescription ||
    'Discover authentic 48-hour slow-fermented Neapolitan pizzas, precision Arabica roasts, golden handcrafted fries, and cozy Italian moments at Sapori Cafe in Raja Park, Jaipur.';

  return {
    title: {
      absolute: title,
    },
    description,
    keywords:
      homeCMS?.seoKeywords ||
      'Sapori Cafe, SAPORI CAFE, Sapori Cafe Jaipur, Raja Park Cafe, Neapolitan Pizza, Specialty Coffee, Best Cafe in Jaipur',
    openGraph: {
      title,
      description,
      siteName: 'SAPORI CAFE',
      type: 'website',
      images: [
        {
          url: '/images/hero-cafe-hd.webp',
          width: 1200,
          height: 630,
          alt: 'SAPORI CAFE - Artisan Pizza & Specialty Coffee in Raja Park, Jaipur',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/hero-cafe-hd.webp'],
    },
  };
}

export default function HomePage() {
  const homeCMS = dbStore.getCMSPage('home') || dbStore.getCMSPage('/');
  const heroSec = homeCMS?.sections.find((s) => s.id === 'hero');
  const hero = heroSec?.fields || {};
  const heroVisible = heroSec ? heroSec.isVisible : true;

  const pillarsSec = homeCMS?.sections.find((s) => s.id === 'pillars');
  const pillarsVisible = pillarsSec ? pillarsSec.isVisible : true;
  const rawPillars = Array.isArray(pillarsSec?.fields?.items) ? pillarsSec.fields.items : null;

  const catSec = homeCMS?.sections.find((s) => s.id === 'category_discovery');
  const catFields = catSec?.fields || {};
  const catVisible = catSec ? catSec.isVisible : true;

  const sigSec = homeCMS?.sections.find((s) => s.id === 'chef_signatures');
  const sigFields = sigSec?.fields || {};
  const sigVisible = sigSec ? sigSec.isVisible : true;

  const expSec = homeCMS?.sections.find((s) => s.id === 'experience_highlight');
  const expFields = expSec?.fields || {};
  const expVisible = expSec ? expSec.isVisible : true;

  const resSec = homeCMS?.sections.find((s) => s.id === 'reservation_cta');
  const resFields = resSec?.fields || {};
  const resVisible = resSec ? resSec.isVisible : true;

  const settings = dbStore.getSettings();
  const categories = dbStore.getCategories();
  const signatureItems = dbStore.getMenuItems({ signatureOnly: true, availableOnly: true }).slice(0, 6);
  const reviews = dbStore.getReviews(true).slice(0, 3);

  const heroImageSrc = hero.heroImage || settings.heroImageUrl || '/images/hero-cafe.webp';
  const heroMobileImageSrc = hero.heroImageMobile || settings.heroImageMobileUrl || '/images/hero-mobile.jpg';

  return (
    <div className="space-y-0 overflow-x-hidden">
      {/* SECTION 1A: DESKTOP CINEMATIC HERO (Exactly Unchanged) */}
      {heroVisible && (
        <section className="hidden md:flex relative min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] xl:min-h-[540px] items-center overflow-hidden border-b border-[#15370D]/20">
          {/* Photorealistic High-Definition Hero Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImageSrc}
              alt="SAPORI CAFE exterior with fairy lights, specialty coffee and gourmet sandwiches in Raja Park, Jaipur"
              fill
              priority
              quality={95}
              sizes="100vw"
              className="object-cover object-[70%_center] sm:object-[60%_center] lg:object-center select-none"
            />

            {/* Directional Vignettes for Perfect Contrast & Image Clarity */}
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#051403]/90 via-[#071c05]/60 to-transparent pointer-events-none" />
            <div className="block lg:hidden absolute inset-0 bg-gradient-to-t from-[#051403]/95 via-[#071c05]/80 to-[#051403]/40 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#051403]/80 to-transparent pointer-events-none" />
          </div>

          {/* Hero Interactive Content Layer */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
            <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5 text-left">
              {/* Live Branding Pill Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#081e05]/85 border border-[#DEB853]/60 px-3.5 py-1 rounded-full shadow-md backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DEB853] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DEB853]" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5EFE1]">
                  {hero.badge || 'COFFEE • PIZZA • GOOD VIBES'}
                </span>
              </div>

              {/* Main Punchy Luxury Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-black uppercase tracking-tight text-white leading-[1.08] drop-shadow-md">
                {hero.title || 'A Place to Pause,'} <br />
                <span className="font-script font-normal text-[#DEB853] normal-case text-3xl sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_2px_10px_rgba(222,184,83,0.35)] block pt-0.5">
                  {hero.titleScript || 'Sip & Savour'}
                </span>
              </h1>

              {/* Rich Atmosphere Description */}
              <p className="text-xs sm:text-sm md:text-base text-[#F5EFE1]/90 leading-relaxed font-normal max-w-lg drop-shadow-sm">
                {hero.description ||
                  'Discover authentic 48-hour slow-fermented Neapolitan pizzas, precision Arabica roasts, golden handcrafted fries, and cozy Italian moments in Raja Park, Jaipur.'}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-sm sm:max-w-none">
                <Link
                  href={hero.ctaPrimaryLink || '/menu'}
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#DEB853] via-[#E7C769] to-[#D5AD41] hover:from-[#E7C769] hover:to-[#DEB853] text-[#15370D] px-6 sm:px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg hover:shadow-[0_0_15px_rgba(222,184,83,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[44px]"
                >
                  <span>{hero.ctaPrimaryText || 'Explore Menu'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={hero.ctaSecondaryLink || '/reservations'}
                  className="inline-flex items-center justify-center space-x-2 bg-black/40 hover:bg-black/60 text-[#F5EFE1] border border-[#DEB853]/60 hover:border-[#DEB853] px-6 sm:px-7 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[44px]"
                >
                  <Calendar className="w-4 h-4 text-[#DEB853]" />
                  <span>{hero.ctaSecondaryText || 'Reserve Table'}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 1B: MOBILE OPTIMIZED HERO (100% Uncropped Storefront Photo + Non-Overlapping Actions) */}
      {heroVisible && (
        <section className="flex md:hidden flex-col bg-[#071c05] text-[#F5EFE1] border-b border-[#15370D]/20 overflow-hidden">
          {/* 1. Mobile Hero Image Showcase - Uncropped Storefront with Hanging Lights & Cafe Interior */}
          <div className="relative w-full aspect-[4/5] max-h-[56vh] bg-[#071c05] overflow-hidden flex items-center justify-center">
            <Image
              src={heroMobileImageSrc}
              alt="SAPORI CAFE storefront exterior with warm fairy lights and cozy Italian ambience in Raja Park, Jaipur"
              fill
              priority
              quality={95}
              sizes="(max-width: 768px) 100vw, 819px"
              className="object-contain sm:object-cover w-full h-full select-none"
            />
            {/* Ambient vignette transitioning smoothly into the action block */}
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#071c05] via-[#071c05]/60 to-transparent pointer-events-none" />
          </div>

          {/* 2. Mobile Hero Content & Action Panel - Cleanly separated below image so zero text obscures the store */}
          <div className="relative z-10 px-4 pt-1 pb-4 space-y-2.5 bg-[#071c05]">
            {/* Live Indicator Row */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-1.5 bg-[#0b2408] border border-[#DEB853]/60 px-3 py-1 rounded-full shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DEB853] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DEB853]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5EFE1]">
                  {hero.badge || 'COFFEE • PIZZA • GOOD VIBES'}
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#DEB853]/90">
                Raja Park, Jaipur
              </span>
            </div>

            {/* Headline with Brand Script Accent */}
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                {hero.title || 'A Place to Pause,'}{' '}
                <span className="font-script font-normal text-[#DEB853] normal-case text-2xl sm:text-3xl inline-block drop-shadow-[0_2px_8px_rgba(222,184,83,0.3)]">
                  {hero.titleScript || 'Sip & Savour'}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-[#F5EFE1]/80 leading-relaxed font-normal line-clamp-2">
                {hero.description ||
                  'Discover authentic 48-hour slow-fermented Neapolitan pizzas, precision Arabica roasts, golden handcrafted fries, and cozy Italian moments in Raja Park, Jaipur.'}
              </p>
            </div>

            {/* High-Impact Dual Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <Link
                href={hero.ctaPrimaryLink || '/menu'}
                className="inline-flex items-center justify-center space-x-1.5 bg-gradient-to-r from-[#DEB853] via-[#E7C769] to-[#D5AD41] active:from-[#E7C769] active:to-[#DEB853] text-[#15370D] px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-98 transition-all min-h-[44px]"
              >
                <span>{hero.ctaPrimaryText || 'Explore Menu'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={hero.ctaSecondaryLink || '/reservations'}
                className="inline-flex items-center justify-center space-x-1.5 bg-black/40 active:bg-black/60 text-[#F5EFE1] border border-[#DEB853]/60 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md active:scale-98 transition-all min-h-[44px]"
              >
                <Calendar className="w-3.5 h-3.5 text-[#DEB853]" />
                <span>{hero.ctaSecondaryText || 'Reserve Table'}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* QUICK BRAND PILLARS RIBBON */}
      {pillarsVisible && (
        <section className="bg-[#0b2408] text-[#F5EFE1] border-b border-[#DEB853]/25 py-3.5 sm:py-4 relative z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {(
                rawPillars || [
                  { label: '48h Fermented', desc: 'Airy Neapolitan Crust', icon: 'Sparkles' },
                  { label: 'Specialty Arabica', desc: 'Precision Espresso', icon: 'Coffee' },
                  { label: '100% Handcrafted', desc: 'Made Fresh to Order', icon: 'Award' },
                  { label: 'Raja Park, Jaipur', desc: 'Near Panchwati Circle', icon: 'MapPin' },
                ]
              ).map((pillar: any, idx: number) => {
                const IconComponent =
                  pillar.icon === 'Coffee'
                    ? Coffee
                    : pillar.icon === 'Award'
                    ? Award
                    : pillar.icon === 'MapPin'
                    ? MapPin
                    : Sparkles;
                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 p-1.5 sm:p-2 group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DEB853]/15 border border-[#DEB853]/40 flex items-center justify-center text-[#DEB853] flex-shrink-0 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white truncate">
                        {pillar.label}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#F5EFE1]/75 font-medium truncate">
                        {pillar.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: CATEGORY DISCOVERY */}
      {catVisible && (
        <section className="bg-[#FFFFFF] py-16 sm:py-20 border-b border-[#15370D]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70 mb-2">
                  {catFields.badge || 'Curated Selections'}
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#15370D] tracking-tight">
                  {catFields.title || 'Explore Culinary Categories'}
                </h2>
              </div>
              <Link
                href={catFields.ctaLink || '/menu'}
                className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline mt-3 md:mt-0"
              >
                <span>{catFields.ctaText || 'View Complete Menu'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/menu?category=${category.slug}`}
                  className="bg-[#F5EFE1]/60 hover:bg-[#F5EFE1] border border-[#15370D]/15 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:border-[#15370D]/40 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#FFFFFF] border border-[#15370D]/20 flex items-center justify-center text-[#15370D] mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-2xs">
                      {category.slug.includes('pizza') ? (
                        <Pizza className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <h3 className="text-xs sm:text-base font-bold text-[#15370D] mb-1 group-hover:underline leading-snug">
                      {category.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#15370D]/70 line-clamp-2 leading-relaxed hidden sm:block">
                      {category.description}
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4 flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#15370D] opacity-80 group-hover:opacity-100">
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: SIGNATURE SELECTION */}
      {sigVisible && (
        <section className="bg-[#F5EFE1] py-16 sm:py-20 border-b border-[#15370D]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
              <div className="inline-flex items-center space-x-1.5 bg-[#FFFFFF] border border-[#15370D]/20 px-3.5 py-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#15370D]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]">
                  {sigFields.badge || 'Chef & Barista Signatures'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#15370D]">
                {sigFields.title || 'Handcrafted Highlights'}
              </h2>
              <p className="text-xs sm:text-sm text-[#15370D]/75">
                {sigFields.subtitle ||
                  'Distinguished creations featuring single-origin cold brews, white truffle shavings, and slow-steeped mascarpone textures.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {signatureItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>

            <div className="text-center mt-10 sm:mt-12">
              <Link
                href={sigFields.ctaLink || '/menu'}
                className="inline-flex items-center bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow min-h-[44px]"
              >
                <span>{sigFields.ctaText || 'See All 50+ Menu Creations'}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: COFFEE ROASTING & BREWING PHILOSOPHY */}
      <section className="bg-[#15370D] text-[#F5EFE1] py-16 sm:py-24 border-b border-[#15370D]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6">
              <div className="inline-block bg-[#FFFFFF]/10 border border-[#F5EFE1]/20 text-[#FFFFFF] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Specialty Coffee Program
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FFFFFF] leading-tight">
                From Estate Green Beans to the Velvet Crema
              </h2>
              <p className="text-xs sm:text-sm text-[#F5EFE1]/85 leading-relaxed">
                At Sapori, coffee is approached with Italian reverence and modern extraction science. We dial in our 100% specialty Arabica beans each morning, balancing grind micron size, water temperature, and extraction pressure.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  { title: '18-Hour Slow Cold Steeping', desc: 'Smooth, naturally sweet cold brew with zero bitterness.' },
                  { title: 'Oak Barrel-Aged Single Origin', desc: 'Toasted whiskey oak notes in an alcohol-free sensory cold brew.' },
                  { title: 'Velvety Micro-Foam', desc: 'Textured whole dairy and silky plant-based milks poured with care.' },
                ].map((point) => (
                  <div key={point.title} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-[#FFFFFF]/15 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#FFFFFF]">
                      <Award className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#FFFFFF]">{point.title}</div>
                      <div className="text-[11px] text-[#F5EFE1]/75">{point.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  href="/menu?category=specialty-cold-brews-tonics"
                  className="inline-flex items-center bg-[#FFFFFF] text-[#15370D] hover:bg-[#F5EFE1] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]"
                >
                  <span>Explore Coffee Selections</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            <div className="bg-[#FFFFFF]/5 border border-[#F5EFE1]/20 rounded-2xl p-6 sm:p-8 space-y-5 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFFFFF]/10 mx-auto flex items-center justify-center text-[#FFFFFF]">
                <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#FFFFFF]">Barista Masterpicks</h3>
              <div className="space-y-2.5 text-left">
                <div className="bg-[#FFFFFF]/10 p-3 sm:p-3.5 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-[#FFFFFF]">Crème Brûlée Custard Cold Brew</div>
                    <div className="text-[11px] text-[#F5EFE1]/70">Torched caramelized sugar over foam</div>
                  </div>
                  <span className="text-sm font-bold text-[#FFFFFF] tabular-nums">₹260</span>
                </div>
                <div className="bg-[#FFFFFF]/10 p-3 sm:p-3.5 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-[#FFFFFF]">Rum & Whiskey Barrel-Aged Cold Brew</div>
                    <div className="text-[11px] text-[#F5EFE1]/70">Toasted oak barrel aged (Alcohol-free)</div>
                  </div>
                  <span className="text-sm font-bold text-[#FFFFFF] tabular-nums">₹270</span>
                </div>
                <div className="bg-[#FFFFFF]/10 p-3 sm:p-3.5 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-[#FFFFFF]">Mocha Tiramisu Latte</div>
                    <div className="text-[11px] text-[#F5EFE1]/70">Belgian ganache & mascarpone</div>
                  </div>
                  <span className="text-sm font-bold text-[#FFFFFF] tabular-nums">₹250</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TABLE RESERVATIONS CTA */}
      {resVisible && (
        <section className="bg-[#FFFFFF] py-16 sm:py-20 border-b border-[#15370D]/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#F5EFE1] border border-[#15370D]/20 rounded-2xl p-6 sm:p-12 text-center space-y-5 shadow-sm">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFFFFF] border border-[#15370D]/20 mx-auto flex items-center justify-center text-[#15370D]">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#15370D]">
                {resFields.title || 'Reserve Your Café Table'}
              </h2>
              <p className="text-xs sm:text-sm text-[#15370D]/75 max-w-xl mx-auto leading-relaxed">
                {resFields.description ||
                  'Whether it’s a calm morning brew, a working afternoon, or an evening gathering over Neapolitan pizza, we ensure your table is warm, ready, and welcoming.'}
              </p>
              <div className="pt-2">
                <Link
                  href={resFields.ctaLink || '/reservations'}
                  className="inline-flex items-center bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow min-h-[44px]"
                >
                  <span>{resFields.ctaText || 'Book a Table Now'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: GUEST REVIEWS */}
      <section className="bg-[#F5EFE1] py-16 sm:py-20 border-b border-[#15370D]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
              Community Love
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15370D]">
              Words from Our Guests
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-[#15370D]">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <span key={idx} className="text-sm font-bold">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-[#15370D]/80 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-[#15370D]/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#15370D]">{rev.authorName}</span>
                  {rev.verifiedOrder && (
                    <span className="text-[10px] font-semibold text-[#15370D]/60 uppercase tracking-wider">
                      Verified Guest
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: LOCATION & CONTACT */}
      <section className="bg-[#FFFFFF] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6">
              <div className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
                Finding Sapori
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15370D]">
                Visit Us in Raja Park, Jaipur
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-[#15370D]/80">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                  <div>
                    <span className="font-bold text-[#15370D]">Location Address:</span>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                  <div>
                    <span className="font-bold text-[#15370D]">Operating Hours:</span>
                    <p className="text-xs mt-0.5">Monday – Sunday: 10:00 AM – 11:30 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                  <div>
                    <span className="font-bold text-[#15370D]">Direct Telephone:</span>
                    <p className="text-xs mt-0.5 font-bold">
                      <a href="tel:+916367373302" className="hover:underline">
                        +91 63673 73302
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="tel:+916367373302"
                  className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Us</span>
                </a>
                <a
                  href="https://wa.me/916367373302"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/30 hover:bg-[#FFFFFF] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 min-h-[44px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                </a>
              </div>
            </div>

            <div className="bg-[#F5EFE1] border border-[#15370D]/15 rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-[#15370D] uppercase tracking-wider">
                Table QR Dine-In Ordering
              </h3>
              <p className="text-xs text-[#15370D]/75 leading-relaxed">
                Visiting our café in person? Every table features a contactless QR code. Scan the code on your table to open the live menu with table context, customize toppings, and send orders straight to the kitchen.
              </p>
              <div className="pt-2">
                <Link
                  href="/table/01"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#15370D] underline"
                >
                  <span>Preview Table 01 QR Mode</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
