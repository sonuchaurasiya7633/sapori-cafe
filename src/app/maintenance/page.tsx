import React from 'react';
import Link from 'next/link';
import { ChefHat, Phone, Clock } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function MaintenancePage() {
  return (
    <div className="bg-[#F5EFE1] min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-10 max-w-lg w-full text-center space-y-6 shadow-sm">
        <Logo size="lg" variant="green" />

        <div className="w-16 h-16 rounded-full bg-[#F5EFE1] mx-auto flex items-center justify-center text-[#15370D]">
          <ChefHat className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            Scheduled Maintenance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15370D]">
            Curating New Culinary Delights
          </h1>
          <p className="text-xs text-[#15370D]/80 leading-relaxed">
            Our platform is undergoing routine maintenance to enhance kitchen performance and order synchronization. We will be back online shortly.
          </p>
        </div>

        <div className="bg-[#F5EFE1] p-4 rounded-xl text-xs text-[#15370D] space-y-1">
          <div className="font-bold">For Immediate Café Inquiries & Table Reservations:</div>
          <div>Call us at: <a href="tel:+916367373302" className="underline font-bold">+91 63673 73302</a></div>
        </div>

        <div>
          <Link
            href="/"
            className="inline-block bg-[#15370D] text-[#FFFFFF] px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider shadow"
          >
            Check System Status
          </Link>
        </div>
      </div>
    </div>
  );
}
