'use client';

import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  const [position, setPosition] = useState<'top-right' | 'top-center'>('top-right');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPosition('top-center');
      } else {
        setPosition('top-right');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Toaster
      position={position}
      expand={true}
      richColors={false}
      closeButton={true}
      duration={3500}
      visibleToasts={5}
      offset={16}
      toastOptions={{
        className:
          '!bg-white !text-[#15370D] !border !border-[#15370D]/15 !shadow-xl !rounded-2xl !p-4 !font-sans !text-xs sm:!text-sm !transition-all',
        style: {
          fontFamily: 'inherit',
        },
      }}
    />
  );
}
