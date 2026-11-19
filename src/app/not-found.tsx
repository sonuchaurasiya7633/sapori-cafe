import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Coffee } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="bg-[#F5EFE1] min-h-[75vh] flex items-center justify-center py-20 px-4">
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-10 max-w-md w-full text-center space-y-6 shadow-sm">
        <Logo size="md" variant="green" />
        <div className="w-16 h-16 rounded-full bg-[#F5EFE1] mx-auto flex items-center justify-center text-[#15370D]">
          <Coffee className="w-8 h-8 opacity-60" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#15370D]">404</h1>
          <h2 className="text-base font-bold text-[#15370D]">Page Not Found</h2>
          <p className="text-xs text-[#15370D]/70">
            The café page or culinary item you requested could not be found.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-[#15370D] text-[#FFFFFF] px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
