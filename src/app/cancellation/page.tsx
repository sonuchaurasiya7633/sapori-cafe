import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, RefreshCw, Clock, CheckCircle2, AlertCircle, Banknote, ShieldCheck } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  return {
    title: `Cancellation & Refund Policy | Turnaround Guidelines | ${settings.brandName || 'SAPORI CAFÉ & EATERY'}`,
    description:
      'Review official order cancellation rules, kitchen preparation cut-offs, refund turnaround schedules, and payment reversal timelines at Sapori Café Jaipur.',
    keywords:
      'cancellation policy, refunds jaipur, sapori cafe turnaround, payment reversal, UPI refund timelines',
  };
}

export default function CancellationRefundPage() {
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
              <RefreshCw className="w-4 h-4" />
              <span>Consumer Protection Guidelines Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#15370D]">
              Cancellation &amp; Refund Policy
            </h1>
            <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider mt-2">
              SAPORI CAFÉ &amp; EATERY • Raja Park, Jaipur • Last Revised: November 19, 2026
            </p>
          </div>

          <div className="text-xs sm:text-[13px] text-[#15370D]/85 leading-relaxed space-y-6">
            {/* 1. Perishable Food Nature & Cancellation Window */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">1. Nature of Culinary Goods &amp; Cancellation Windows</h2>
              <p>
                Our Neapolitan pizzas, artisanal bakery items, and specialty coffee drinks are prepared fresh upon order placement using perishable ingredients and temperature-controlled fermentation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="border border-green-800/20 bg-green-50/50 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-2 text-green-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                    <span>Eligible for 100% Cancellation</span>
                  </div>
                  <p className="text-[11px] text-green-950/80">
                    Orders may be cancelled free of charge <strong>before</strong> the kitchen marks the status as <em>ACCEPTED</em> or <em>PREPARING</em> (typically within 3–5 minutes of placement).
                  </p>
                </div>
                <div className="border border-red-800/20 bg-red-50/50 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-2 text-red-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Ineligible for Cancellation</span>
                  </div>
                  <p className="text-[11px] text-red-950/80">
                    Once dough stretching, topping, and wood-fired baking or coffee extraction has commenced, orders cannot be cancelled or recalled due to food safety and perishability.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Refund Processing Timelines */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">2. Refund Turnaround Timelines by Payment Method</h2>
              <p>
                When an order cancellation is approved or a payment is reversed due to a technical error, refunds are processed directly back to the original source instrument via our payment gateway:
              </p>
              <div className="border border-[#15370D]/15 rounded-2xl overflow-hidden mt-3">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#15370D] text-[#F5EFE1]">
                      <th className="p-3 font-bold">Payment Instrument</th>
                      <th className="p-3 font-bold">Gateway Reversal SLA</th>
                      <th className="p-3 font-bold">Customer Bank Credit Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15370D]/10">
                    <tr className="hover:bg-[#F5EFE1]/30">
                      <td className="p-3 font-semibold">Unified Payments Interface (UPI)</td>
                      <td className="p-3">Immediate (Instant initiation)</td>
                      <td className="p-3"><strong>24 to 48 Hours</strong> (Often instant)</td>
                    </tr>
                    <tr className="hover:bg-[#F5EFE1]/30">
                      <td className="p-3 font-semibold">Debit &amp; Credit Cards</td>
                      <td className="p-3">Within 24 Hours</td>
                      <td className="p-3"><strong>3 to 5 Banking Days</strong> (Per card issuing bank)</td>
                    </tr>
                    <tr className="hover:bg-[#F5EFE1]/30">
                      <td className="p-3 font-semibold">NetBanking</td>
                      <td className="p-3">Within 24 Hours</td>
                      <td className="p-3"><strong>3 to 7 Working Days</strong></td>
                    </tr>
                    <tr className="hover:bg-[#F5EFE1]/30">
                      <td className="p-3 font-semibold">Digital Wallets (Paytm/PhonePe)</td>
                      <td className="p-3">Within 24 Hours</td>
                      <td className="p-3"><strong>24 to 48 Hours</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Damaged, Incorrect, or Spilled Items */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">3. Quality Issues, Spillage &amp; Missing Items</h2>
              <p>
                In the rare instance an item is received in a damaged condition, temperature-compromised, or missing:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Please notify our dispatch team within <strong>30 minutes</strong> of delivery receipt via phone or WhatsApp at <strong>+91 63673 73302</strong> with a clear photograph of the packaging and food item.</li>
                <li>Upon verification, our manager will arrange an immediate priority hot replacement or issue an instant credit note/full refund for the affected item.</li>
              </ul>
            </section>

            {/* 4. Table Reservation Cancellations */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">4. Table Reservation Cancellations</h2>
              <p>
                Table reservations may be cancelled or rescheduled at any point prior to arrival without penalty. As a courtesy to fellow café patrons waiting for seating, please inform our hosts at least <strong>30 minutes in advance</strong> if your plans change.
              </p>
            </section>

            {/* 5. Support Escalation */}
            <section className="border-t border-[#15370D]/15 pt-6 space-y-2">
              <h2 className="text-base font-black text-[#15370D]">5. Refund Status Assistance &amp; Escalation</h2>
              <p>
                If your refund has not credited within the estimated banking window, please contact our support desk with your <strong>Order Number (e.g. SAP-ORD-XXXX)</strong>:
              </p>
              <div className="bg-[#15370D] text-[#F5EFE1] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[#DEB853]">Dedicated Guest Billing Desk</p>
                  <p>Email: hello@saporicafe.in • WhatsApp: +91 63673 73302</p>
                </div>
                <Link
                  href="/contact"
                  className="bg-[#DEB853] text-[#15370D] px-4 py-2 rounded-xl font-bold uppercase tracking-wider hover:opacity-95 transition-opacity"
                >
                  Contact Support
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
