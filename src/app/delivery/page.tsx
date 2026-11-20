import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Truck, Clock, MapPin, AlertCircle, ShieldCheck } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  return {
    title: `Delivery Policy | Order Fulfillment Guidelines | ${settings.brandName || 'SAPORI CAFE'}`,
    description:
      'Review official doorstep delivery zones, packaging fees, minimum order values, and estimated preparation turnaround across Raja Park and Jaipur.',
    keywords:
      'delivery policy jaipur, pizza delivery raja park, sapori cafe delivery times, food delivery charges jaipur',
  };
}

export default function DeliveryPolicyPage() {
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
              <Truck className="w-4 h-4" />
              <span>Doorstep Delivery Operations &amp; Guidelines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#15370D]">
              Delivery &amp; Fulfillment Policy
            </h1>
            <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider mt-2">
              SAPORI CAFÉ &amp; EATERY • Raja Park, Jaipur • Last Revised: November 19, 2026
            </p>
          </div>

          <div className="text-xs sm:text-[13px] text-[#15370D]/85 leading-relaxed space-y-6">
            {/* 1. Serviceable Radius */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">1. Designated Serviceable Delivery Radius</h2>
              <p>
                To maintain the temperature, crispness, and blistered crust integrity of our artisanal Neapolitan pizzas and the freshness of specialty cold brews, we enforce a strict delivery radius:
              </p>
              <div className="bg-[#15370D]/5 border border-[#15370D]/15 rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-bold text-[#15370D] flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#DEB853]" />
                  <span>Primary Operating Kitchen: 217/1, Ramgali Number 1, Raja Park, Jaipur</span>
                </p>
                <p>
                  <strong>Service Radius:</strong> Up to <strong>{settings.deliveryRadiusKm || 8}–10 Kilometers</strong> radius covering Raja Park, Tilak Nagar, Jawahar Nagar, Adarsh Nagar, C-Scheme, Bapu Nagar, Malviya Nagar, and adjacent Jaipur sectors.
                </p>
                <p className="text-[11px] text-[#15370D]/70">
                  Locations exceeding this radius are restricted in our checkout engine to prevent thermal degradation during transit.
                </p>
              </div>
            </section>

            {/* 2. Turnaround & Dispatch Timelines */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">2. Preparation &amp; Transit Turnaround Times</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Estimated Delivery Time:</strong> Typically <strong>{settings.estimatedDeliveryTime || '35-45 minutes'}</strong> from order acceptance under standard weather and traffic conditions.</li>
                <li><strong>Artisanal Preparation Window:</strong> Because our pizza dough is slow-fermented and each pie is hand-stretched to order, kitchen baking requires 15–20 minutes before dispatch.</li>
                <li><strong>Peak Hours &amp; Inclement Weather:</strong> During weekend rush periods, festive days, or monsoon rains, transit times may extend by 10–15 minutes. Any delay is actively communicated via live tracking and SMS.</li>
              </ul>
            </section>

            {/* 3. Delivery Fees & Packaging Surcharges */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">3. Delivery Fees &amp; Food-Safe Thermal Packaging</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Standard Delivery Fee:</strong> Flat ₹{settings.deliveryFee || 49} applies to standard doorstep dispatches.</li>
                <li><strong>Complimentary Delivery:</strong> Orders exceeding <strong>₹{settings.freeDeliveryThreshold || 599}</strong> qualify for complimentary free doorstep delivery.</li>
                <li><strong>Eco-Friendly Thermal Packaging Fee:</strong> A nominal packaging fee of ₹{settings.packagingFee || 25} is applied to cover specialized vented, food-grade corrugated pizza boxes and insulated drink sleeves that prevent condensation sogginess.</li>
                <li><strong>Minimum Order Value:</strong> Doorstep orders require a minimum subtotal of <strong>₹{settings.minOrderValue || 199}</strong>.</li>
              </ul>
            </section>

            {/* 4. Delivery Protocol & Unreachable Customers */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">4. Handover Protocol &amp; Unreachable Customers</h2>
              <p>
                Our delivery partner will arrive at the designated location and attempt to contact you via telephone. To safeguard food hygiene:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>The delivery executive will wait at the location for up to <strong>10 minutes</strong>.</li>
                <li>If the customer remains unreachable after multiple phone attempts and WhatsApp messages, the order will be returned to the café to prevent food spoilage. Because food items cannot be restocked once prepared, refunds cannot be issued for failed handovers due to incorrect addresses or unreachable contact numbers.</li>
              </ul>
            </section>

            {/* 5. Contact */}
            <section className="border-t border-[#15370D]/15 pt-6 space-y-2">
              <h2 className="text-base font-black text-[#15370D]">5. Live Dispatch Assistance</h2>
              <p>
                For real-time inquiries regarding an active order dispatch, please contact our kitchen supervisor:
              </p>
              <div className="bg-[#15370D] text-[#F5EFE1] p-4 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#DEB853]">Direct Delivery Hotline</p>
                  <p>Phone / WhatsApp: +91 63673 73302</p>
                </div>
                <Link
                  href="/menu"
                  className="bg-[#DEB853] text-[#15370D] px-4 py-2 rounded-xl font-bold uppercase tracking-wider hover:opacity-95"
                >
                  Order Online
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
