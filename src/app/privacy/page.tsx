import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, ShieldCheck, Mail, MapPin, Phone, Lock, Eye, Trash2, RefreshCw } from 'lucide-react';
import { dbStore } from '@/lib/db/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = dbStore.getSettings();
  return {
    title: `Privacy Policy | Digital Data Protection | ${settings.brandName || 'SAPORI CAFÉ & EATERY'}`,
    description:
      'Learn how Sapori Café collects, processes, and protects your personal data under the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian laws.',
    keywords:
      'privacy policy, sapori cafe data protection, DPDP act compliance, guest privacy jaipur, customer rights',
  };
}

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP Act (India) 2023 &amp; IT Act Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#15370D]">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="text-xs text-[#15370D]/60 font-semibold uppercase tracking-wider mt-2">
              Effective Date: November 2026 • Last Reviewed: November 19, 2026 • SAPORI CAFÉ &amp; EATERY
            </p>
          </div>

          <div className="text-xs sm:text-[13px] text-[#15370D]/85 leading-relaxed space-y-6">
            {/* Introduction */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">1. Introduction &amp; Data Fiduciary Identity</h2>
              <p>
                <strong>SAPORI CAFÉ &amp; EATERY</strong> (&quot;Sapori&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operating its artisanal culinary establishment at 217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India, serves as the <strong>Data Fiduciary</strong> regarding the processing of your personal data collected through our official website (https://saporicafe.in) and dining establishment.
              </p>
              <p>
                This Policy is published in strict adherence to the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>.
              </p>
            </section>

            {/* Data Collected */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">2. Categories of Personal Data Collected</h2>
              <p>We strictly practice <em>data minimization</em>, collecting solely information essential to fulfill your dining experience and orders:</p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li><strong>Identity &amp; Contact Information:</strong> Full name, 10-digit mobile phone number, and email address (for digital order receipts and reservation confirmation notices).</li>
                <li><strong>Delivery &amp; Location Details:</strong> Street address, landmark, and delivery notes provided voluntarily for doorstep orders within our designated Raja Park delivery radius.</li>
                <li><strong>Table Reservation Preferences:</strong> Guest headcount, requested dining time, seating preferences, and special dietary/allergen notes.</li>
                <li><strong>Transaction Records:</strong> Order numbers, item selection, amount paid, and timestamp. <em>Note: Sensitive card numbers, CVVs, or UPI PINs are processed directly by our RBI-licensed payment aggregator (Razorpay) over encrypted TLS channels and are NEVER stored on our servers.</em></li>
                <li><strong>Technical &amp; Analytics Data:</strong> IP address, device type, browser information, and aggregated website usage through privacy-conscious Google Analytics 4 (anonymized IP enabled).</li>
              </ul>
            </section>

            {/* Purpose of Processing */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">3. Lawful Grounds &amp; Specific Purposes of Processing</h2>
              <p>Your personal data is processed solely under lawful grounds under Section 4 and Section 7 of the DPDP Act, 2023:</p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li>Processing and fulfilling your dine-in, takeaway, and delivery orders.</li>
                <li>Transmitting real-time SMS or WhatsApp order status updates and reservation tokens.</li>
                <li>Facilitating secure, encrypted payment verification through authorized gateways.</li>
                <li>Fulfilling statutory tax compliance and mandatory accounting under the Central Goods and Services Tax (CGST) Act, 2017.</li>
                <li>Responding promptly to guest inquiries, dietary clarifications, and grievance tickets.</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">4. Data Retention &amp; Erasure Schedules</h2>
              <p>
                In compliance with statutory obligations and privacy principles:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li><strong>Invoicing &amp; Order Financial Data:</strong> Retained for a mandatory duration of <strong>7 years</strong> from the end of the relevant financial year as mandated under Section 36 of the CGST Act and the Companies Act, 2013 for accounting audits.</li>
                <li><strong>Table Reservation Records:</strong> Retained for <strong>180 days</strong> post-booking to resolve customer service inquiries, following which personal details are systematically anonymized.</li>
                <li><strong>Customer Inquiries &amp; Feedback:</strong> Retained for <strong>90 days</strong> from resolution date.</li>
                <li><strong>Server Access Logs:</strong> Automatically rotated and purged after <strong>90 days</strong>.</li>
              </ul>
            </section>

            {/* Data Principal Rights */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">5. Your Rights as a Data Principal (DPDP Act, 2023)</h2>
              <p>As a verified Data Principal under Indian law, you are entitled to exercise the following rights free of charge:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="border border-[#15370D]/15 rounded-xl p-3 bg-[#F5EFE1]/40">
                  <div className="flex items-center space-x-1.5 font-bold text-[#15370D]">
                    <Eye className="w-4 h-4 text-[#DEB853]" />
                    <span>Right to Access &amp; Summary</span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/75 mt-1">Request a structured summary of personal data held and processed by Sapori.</p>
                </div>
                <div className="border border-[#15370D]/15 rounded-xl p-3 bg-[#F5EFE1]/40">
                  <div className="flex items-center space-x-1.5 font-bold text-[#15370D]">
                    <RefreshCw className="w-4 h-4 text-[#DEB853]" />
                    <span>Right to Correction</span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/75 mt-1">Update or correct any inaccurate, incomplete, or out-of-date personal information.</p>
                </div>
                <div className="border border-[#15370D]/15 rounded-xl p-3 bg-[#F5EFE1]/40">
                  <div className="flex items-center space-x-1.5 font-bold text-[#15370D]">
                    <Trash2 className="w-4 h-4 text-[#DEB853]" />
                    <span>Right to Erasure</span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/75 mt-1">Request erasure of data when the processing purpose is fulfilled, subject to statutory tax retention.</p>
                </div>
                <div className="border border-[#15370D]/15 rounded-xl p-3 bg-[#F5EFE1]/40">
                  <div className="flex items-center space-x-1.5 font-bold text-[#15370D]">
                    <Lock className="w-4 h-4 text-[#DEB853]" />
                    <span>Right to Grievance Redressal</span>
                  </div>
                  <p className="text-[11px] text-[#15370D]/75 mt-1">Prompt resolution of any privacy concerns through our designated Grievance Officer.</p>
                </div>
              </div>
            </section>

            {/* Technical Security Measures */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-[#15370D]">6. Technical &amp; Operational Security Measures</h2>
              <p>
                We enforce stringent technical controls in accordance with ISO/IEC 27001 guidelines and OWASP best practices:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li><strong>Transport Layer Security (TLS 1.3):</strong> End-to-end HTTPS encryption across all public and administrative communication with automated HSTS enforcement.</li>
                <li><strong>Database Isolation:</strong> Production data resides in an isolated MongoDB Atlas cluster with encryption at rest (AES-256) and least-privilege network rules.</li>
                <li><strong>Role-Based Access Control:</strong> Administrative access requires multi-factor session validation with HttpOnly, Secure, and SameSite attributes.</li>
                <li><strong>PCI-DSS Compliance:</strong> Zero cardholder data environment on Sapori servers; card payments are tokenized directly by Razorpay.</li>
              </ul>
            </section>

            {/* Grievance Officer */}
            <section className="border-t border-[#15370D]/15 pt-6 space-y-3">
              <h2 className="text-base font-black text-[#15370D]">7. Grievance Officer &amp; Statutory Contact Details</h2>
              <p>
                Pursuant to Section 12 of the DPDP Act, 2023 and Rule 5(9) of the IT (Reasonable Security Practices) Rules, 2011, inquiries and rights requests must be directed to:
              </p>
              <div className="bg-[#15370D] text-[#F5EFE1] p-5 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-[#DEB853] text-sm">Grievance Redressal Officer — Sapori Café &amp; Eatery</p>
                <p className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-[#DEB853] flex-shrink-0" /><span>217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan 302004, India</span></p>
                <p className="flex items-center space-x-2"><Mail className="w-3.5 h-3.5 text-[#DEB853] flex-shrink-0" /><span>Email: hello@saporicafe.in (Subject: Attention: Grievance Officer)</span></p>
                <p className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5 text-[#DEB853] flex-shrink-0" /><span>Helpline: +91 63673 73302 (10:00 AM – 8:00 PM IST, Monday to Saturday)</span></p>
                <p className="text-[11px] text-[#F5EFE1]/70 pt-1">Acknowledged within 24 hours and addressed within a maximum of 15 business days.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
