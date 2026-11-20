import { CMSPage } from '@/types';

export const SEED_CMS_PAGES: CMSPage[] = [
  {
    id: 'home',
    slug: '/',
    title: 'Homepage',
    seoTitle: 'SAPORI CAFE | A Place to Pause, Sip & Savour',
    seoDescription: 'Handcrafted 48-hour slow-fermented Neapolitan pizzas, specialty Arabica cold brews, and comforting Italian bakery pairings in Raja Park, Jaipur.',
    seoKeywords: 'Sapori Cafe, SAPORI CAFE, Sapori Cafe Jaipur, Raja Park Cafe, Neapolitan Pizza, Specialty Coffee, Best Cafe in Jaipur',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        name: 'Hero Banner & Main Visual',
        isVisible: true,
        fields: {
          badge: 'COFFEE • PIZZA • GOOD VIBES',
          title: 'A Place to Pause,',
          titleScript: 'Sip & Savour',
          description: 'Discover authentic 48-hour slow-fermented Neapolitan pizzas, precision Arabica roasts, golden handcrafted fries, and cozy Italian moments in Raja Park, Jaipur.',
          ctaPrimaryText: 'Explore Menu',
          ctaPrimaryLink: '/menu',
          ctaSecondaryText: 'Reserve Table',
          ctaSecondaryLink: '/reservations',
          heroImage: '/images/hero-cafe.webp',
        },
      },
      {
        id: 'pillars',
        name: 'Brand Craft Pillars (Ribbon)',
        isVisible: true,
        fields: {
          items: [
            { label: '48h Fermented', desc: 'Airy Neapolitan Crust', icon: 'Sparkles' },
            { label: 'Specialty Arabica', desc: 'Precision Espresso', icon: 'Coffee' },
            { label: '100% Handcrafted', desc: 'Made Fresh to Order', icon: 'Award' },
            { label: 'Raja Park, Jaipur', desc: 'Near Panchwati Circle', icon: 'MapPin' },
          ],
        },
      },
      {
        id: 'category_discovery',
        name: 'Categories Discovery',
        isVisible: true,
        fields: {
          badge: 'Curated Selections',
          title: 'Explore Culinary Categories',
          subtitle: 'From blistered Neapolitan crusts to artisanal cold brews, each category represents Italian technique and precision.',
          ctaText: 'View All Menu',
          ctaLink: '/menu',
        },
      },
      {
        id: 'chef_signatures',
        name: "Chef's Signature Creations",
        isVisible: true,
        fields: {
          badge: 'Handcrafted Specialties',
          title: "Chef's Signature Selections",
          description: 'Our most celebrated culinary pairings, prepared with 48-hour fermented dough and precision-roasted Arabica beans.',
        },
      },
      {
        id: 'philosophy',
        name: 'Artisanal Craft & Story Preview',
        isVisible: true,
        fields: {
          badge: 'The Artisanal Craft',
          title: '48-Hour Cold Fermentation & Precision Extraction',
          paragraph1: 'Our Neapolitan dough rests in temperature-controlled cold fermentation for 48 hours. This patient technique breaks down complex starches, creating an extraordinarily light, digestible cornicione (crust) with natural leopard charring.',
          paragraph2: 'At our espresso bar, single-origin Arabica beans are extracted with micro-calibrated water temperature and pressure. Whether ordering a silky Flat White or an 18-hour Cold Brew, perfection is never rushed.',
          ctaText: 'Discover Our Philosophy',
          ctaLink: '/story',
        },
      },
    ],
  },
  {
    id: 'story',
    slug: '/story',
    title: 'Philosophy & Story',
    seoTitle: 'Our Philosophy & Story | SAPORI CAFE, Jaipur',
    seoDescription: 'Learn about our 48-hour slow cold fermentation dough, specialty Arabica espresso science, and artisanal culinary craft in Raja Park, Jaipur.',
    seoKeywords: 'Sapori story, Neapolitan dough fermentation, cold brew science, artisanal cafe Jaipur',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'header',
        name: 'Page Header',
        isVisible: true,
        fields: {
          badge: 'Our Heritage & Craft',
          title: 'A Place to Pause, Sip & Savour',
          description: 'Born from an obsession with authentic Neapolitan slow-fermentation and artisanal coffee extraction in Raja Park, Jaipur.',
        },
      },
      {
        id: 'narrative_1',
        name: 'The 48-Hour Neapolitan Philosophy',
        isVisible: true,
        fields: {
          title: 'The 48-Hour Neapolitan Philosophy',
          paragraph1: 'At Sapori, our pizza dough is never rushed. We practice a dedicated 48-hour cold fermentation process using high-protein Italian milled flour, pure water, sea salt, and minimal yeast.',
          paragraph2: 'This patient fermentation converts complex starches, resulting in a feather-light cornicione (crust) with signature leopard-spotted charring that is naturally digestible and bursting with rustic flavor.',
          icon: 'Pizza',
        },
      },
      {
        id: 'narrative_2',
        name: 'Specialty Coffee & Cold Brew Science',
        isVisible: true,
        fields: {
          title: 'Specialty Coffee & Cold Brew Science',
          paragraph1: 'Our coffee bar operates on micro-calibrated precision. Sourcing specialty Arabica beans, we slow-steep our signature cold brew for over 18 hours to extract velvety sweetness without the acidity.',
          paragraph2: 'From our toasted oak barrel-aged single-origin cold brews to handcrafted French custard creams and classic flat whites, each cup is an invitation to pause and savor.',
          icon: 'Coffee',
        },
      },
      {
        id: 'pillars',
        name: 'Culinary Pillars',
        isVisible: true,
        fields: {
          items: [
            { title: '48h Fermentation', desc: 'Patience transforms flour, water, and yeast into an airy, cloud-like digestible crust.' },
            { title: '100% Arabica Precision', desc: 'Directly sourced, ethically harvested coffee beans extracted at calibrated temperatures.' },
            { title: 'Raja Park Hospitality', desc: 'A serene sanctuary designed for meaningful conversations, slow sips, and authentic connection.' },
          ],
        },
      },
    ],
  },
  {
    id: 'gallery',
    slug: '/gallery',
    title: 'Café Gallery',
    seoTitle: 'Café Gallery & Culinary Moments | Sapori Café Jaipur',
    seoDescription: 'Explore visual moments of our wood-deck Neapolitan pizzas, specialty Arabica cold brew bar, and peaceful Raja Park cafe atmosphere.',
    seoKeywords: 'Sapori gallery, cafe photos Jaipur, wood fired pizza photos, cold brew tap',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'header',
        name: 'Page Header',
        isVisible: true,
        fields: {
          badge: 'Visual Story',
          title: 'Café Gallery & Moments',
          description: 'A glimpse into our kitchen craft, artisanal espresso extractions, and the cozy corners of Sapori in Raja Park, Jaipur.',
        },
      },
      {
        id: 'items',
        name: 'Gallery Cards',
        isVisible: true,
        fields: {
          items: [
            { title: 'The Wood-Deck Crust', category: 'Neapolitan Pizzas', subtitle: '48-hour slow fermentation blistered at high heat' },
            { title: 'Specialty Cold Brew Tap', category: 'Espresso Bar', subtitle: '18-hour cold steeped single-origin Arabica' },
            { title: 'Artisanal Brioche Toast', category: 'Bakery', subtitle: 'Torched vanilla bean crème brûlée pastry' },
            { title: 'Hand-Pulled Flat White', category: 'Espresso Bar', subtitle: 'Glossy textured whole milk & double ristretto' },
            { title: 'Stone-Baked Panuozzo', category: 'Italian Sandwiches', subtitle: 'Caprese mozzarella and fresh Genovese basil' },
            { title: 'Tiramisu Affogato', category: 'Frappé & Gelato', subtitle: 'Madagascar vanilla gelato drowned in hot espresso' },
            { title: 'Truffle & Parmesan Frites', category: 'Frites', subtitle: 'Hand-cut fries perfumed with white truffle oil' },
            { title: 'Peaceful Raja Park Dining', category: 'Café Atmosphere', subtitle: 'A warm sanctuary to pause, sip and savor' },
          ],
        },
      },
      {
        id: 'invitation',
        name: 'Bottom Invitation Card',
        isVisible: true,
        fields: {
          title: 'Join Us in Person',
          description: 'Experience the aromas of bubbling mozzarella and freshly ground Arabica beans in Raja Park, Jaipur.',
          buttonText: 'Reserve Your Table',
          buttonLink: '/reservations',
        },
      },
    ],
  },
  {
    id: 'faq',
    slug: '/faq',
    title: 'Frequently Asked Questions',
    seoTitle: 'Frequently Asked Questions (FAQ) | SAPORI CAFE',
    seoDescription: 'Answers to common questions about our location, Neapolitan pizza fermentation, alcohol-free barrel-aged cold brew, and table reservations.',
    seoKeywords: 'Sapori FAQ, Jaipur cafe questions, Neapolitan pizza ingredients, cold brew halal',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'header',
        name: 'Page Header',
        isVisible: true,
        fields: {
          badge: 'Common Inquiries',
          title: 'Frequently Asked Questions',
        },
      },
      {
        id: 'faqs',
        name: 'Question & Answer List',
        isVisible: true,
        fields: {
          items: [
            {
              q: 'Where is Sapori Café located in Jaipur?',
              a: 'We are located at 217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India.',
            },
            {
              q: 'What makes your pizzas authentic Neapolitan style?',
              a: 'We cold-ferment our dough for 48 hours to create an airy, digestible crust with signature blistered leopard charring, baked at intense deck temperatures.',
            },
            {
              q: 'Is the Rum & Whiskey Barrel-Aged Cold Brew alcoholic?',
              a: 'No. As stated on our official menu, our barrel-aged cold brew is completely alcohol-free. It absorbs fragrant toasted oak and caramel notes from cured barrels while remaining 100% non-alcoholic.',
            },
            {
              q: 'Can I customize my pizza with extra cheese?',
              a: 'Yes! You can add Fresh Mozzarella Cheese (+₹65) or Grated Aged Parmesan Cheese (+₹65) to any pizza directly when adding it to your basket.',
            },
            {
              q: 'Do you offer dine-in table reservations?',
              a: 'Yes, you can reserve a table anytime through our website under the Reservations tab or by calling +91 63673 73302.',
            },
            {
              q: 'How does table QR ordering work?',
              a: 'When seated at Sapori, scan the QR code located on your table. Your browser will open the menu with your table number pre-selected. You can add items, customize preferences, and submit directly to our kitchen.',
            },
          ],
        },
      },
      {
        id: 'support_box',
        name: 'Still Have Questions Prompt',
        isVisible: true,
        fields: {
          title: 'Still have questions?',
          description: 'Our hospitality team in Raja Park is delighted to assist you directly.',
          ctaText: 'WhatsApp Hospitality Desk',
          ctaLink: 'https://wa.me/916367373302',
        },
      },
    ],
  },
  {
    id: 'contact',
    slug: '/contact',
    title: 'Visit & Contact',
    seoTitle: 'Contact Us & Location | SAPORI CAFE Raja Park, Jaipur',
    seoDescription: 'Find contact numbers, WhatsApp ordering link, business hours, and Google Maps directions for Sapori Café in Raja Park, Jaipur.',
    seoKeywords: 'Sapori contact, Sapori phone number, cafe in Raja Park Jaipur map, WhatsApp order',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'header',
        name: 'Page Header',
        isVisible: true,
        fields: {
          badge: 'Reach Out',
          title: 'Visit & Contact Us',
          description: 'We are nestled in Raja Park, Jaipur. Feel free to give us a call, send a WhatsApp inquiry, or stop by.',
        },
      },
      {
        id: 'form_info',
        name: 'Inquiry Form Description',
        isVisible: true,
        fields: {
          cardTitle: 'Send a Direct Note',
          cardSubtitle: 'Have a special request, catering inquiry, or feedback? Share your note with our management.',
        },
      },
    ],
  },
  {
    id: 'privacy',
    slug: '/privacy',
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy | SAPORI CAFE',
    seoDescription: 'Read our guest privacy practices, PCI-DSS payment security, and data protection policies.',
    seoKeywords: 'privacy policy, sapori cafe terms, guest data security',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'content',
        name: 'Policy Content',
        isVisible: true,
        fields: {
          title: 'Privacy Policy',
          lastUpdated: 'November 2026',
          intro: 'SAPORI CAFE located at 217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India values your trust. This Privacy Policy outlines how we collect, handle, and protect your personal information during café ordering, table reservations, and digital interactions.',
          sections: [
            {
              title: '1. Information We Collect',
              text: 'When placing an order or reserving a table, we collect necessary guest details such as your name, contact phone number, delivery address (for delivery orders), and optional email address.',
            },
            {
              title: '2. Payment Security',
              text: 'Online transactions are securely processed through PCI-DSS compliant payment gateway providers (Razorpay). We do not store raw card credentials or bank passwords on our servers.',
            },
            {
              title: '3. How Information Is Used',
              text: 'We use your contact details solely to confirm orders, provide kitchen status notifications, coordinate table reservations, and ensure seamless delivery in Raja Park, Jaipur.',
            },
            {
              title: '4. Contact Inquiries',
              text: 'For privacy inquiries, please contact us via phone or WhatsApp at +91 63673 73302.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'terms',
    slug: '/terms',
    title: 'Terms & Conditions',
    seoTitle: 'Terms & Conditions | SAPORI CAFE',
    seoDescription: 'Review the terms and conditions for ordering, table reservations, and digital services at Sapori Café.',
    seoKeywords: 'terms and conditions, sapori dining terms, order policy',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'content',
        name: 'Terms Content',
        isVisible: true,
        fields: {
          title: 'Terms & Conditions',
          subtitle: 'SAPORI CAFE • Raja Park, Jaipur',
          sections: [
            {
              title: '1. Menu & Pricing',
              text: 'All prices are listed in Indian Rupees (INR). Applicable taxes and packaging/delivery fees are calculated and clearly disclosed prior to order confirmation. Menu items and availability may vary based on fresh daily ingredient stock.',
            },
            {
              title: '2. Table Reservations',
              text: 'Reserved tables are held for up to 15 minutes past the scheduled booking time. If you expect a delay, please contact our hospitality team at +91 63673 73302.',
            },
            {
              title: '3. Kitchen Preparation',
              text: 'Because our pizzas and coffees are handcrafted to order, preparation times may vary during peak hours. Estimated preparation windows are provided in good faith.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'cancellation',
    slug: '/cancellation',
    title: 'Cancellation & Refund Policy',
    seoTitle: 'Cancellation & Refund Policy | SAPORI CAFE',
    seoDescription: 'Understand our policies regarding order cancellations, payment refunds, and dish discrepancies.',
    seoKeywords: 'cancellation policy, refund policy, sapori cafe jaipur',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'content',
        name: 'Cancellation Content',
        isVisible: true,
        fields: {
          title: 'Cancellation & Refund Policy',
          subtitle: 'SAPORI CAFE • Raja Park, Jaipur',
          sections: [
            {
              title: '1. Order Cancellations',
              text: 'Food orders can be cancelled only before the kitchen marks the order as ACCEPTED or PREPARING. Once dough stretching and baking has commenced, orders cannot be cancelled due to perishable preparation.',
            },
            {
              title: '2. Online Payment Refunds',
              text: 'If a transaction fails or an eligible cancellation is approved before preparation, the refund is initiated through our payment gateway back to the original payment source (UPI/Card/Bank) within 5–7 business days.',
            },
            {
              title: '3. Quality & Service Discrepancies',
              text: 'If there is an issue with your dish or missing items, please report it immediately to our management at +91 63673 73302. We prioritize your dining satisfaction and will resolve it promptly with a fresh remake or appropriate credit.',
            },
          ],
        },
      },
    ],
  },
];
