'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, X, Calendar, Phone, Search } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import UserMenu from '@/components/auth/UserMenu';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();

  // Prevent background scrolling when mobile navigation is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Our Story', href: '/story' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Reservations', href: '/reservations' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F5EFE1]/95 backdrop-blur-md border-b border-[#15370D]/10 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Logo size="md" variant="green" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs lg:text-sm font-bold tracking-wider uppercase transition-colors relative py-1 ${
                      isActive
                        ? 'text-[#15370D]'
                        : 'text-[#15370D]/75 hover:text-[#15370D]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#15370D] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search link */}
              <Link
                href="/search"
                className="w-10 h-10 flex items-center justify-center text-[#15370D] hover:bg-[#FFFFFF] rounded-full transition-colors"
                aria-label="Search Menu Dishes and Drinks"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Reserve CTA */}
              <Link
                href="/reservations"
                className="hidden sm:inline-flex items-center border border-[#15370D] text-[#15370D] hover:bg-[#15370D] hover:text-[#FFFFFF] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                <span>Book Table</span>
              </Link>

              {/* User Account / Login Button */}
              <UserMenu />

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative w-10 h-10 bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                aria-label={`View cart with ${itemCount} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FFFFFF] text-[#15370D] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-[#15370D]/20 shadow-sm animate-pulse tabular-nums">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Admin shortcut on desktop */}
              <Link
                href="/admin"
                className="hidden xl:inline-block text-xs font-bold uppercase tracking-widest text-[#15370D]/60 hover:text-[#15370D] px-2 py-1"
              >
                Admin
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center text-[#15370D] hover:bg-[#FFFFFF] rounded-md transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#15370D]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#FFFFFF] border-l border-[#15370D]/15 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto pb-safe">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-4">
                <Logo size="sm" variant="green" withLink={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#15370D] hover:bg-[#F5EFE1]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5" aria-label="Mobile Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-[#15370D] text-[#FFFFFF]'
                          : 'text-[#15370D] hover:bg-[#F5EFE1]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-[#15370D] bg-[#DEB853]/15 border border-[#DEB853]/40 hover:bg-[#DEB853]/25"
                >
                  <ShoppingBag className="w-4 h-4 mr-2 text-[#15370D]" />
                  <span>My Orders &amp; Tracking</span>
                </Link>

                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-[#15370D] hover:bg-[#F5EFE1]"
                >
                  <Search className="w-4 h-4 mr-2 text-[#15370D]" />
                  <span>Search Dishes</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-[#15370D] bg-[#F5EFE1] border border-[#15370D]/15"
                >
                  Admin Operations
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#15370D]/10 space-y-3">
              <a
                href="tel:+916367373302"
                className="flex items-center justify-center w-full py-3 bg-[#15370D] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span>Call +91 63673 73302</span>
              </a>
              <p className="text-[11px] text-center text-[#15370D]/60 font-medium">
                217/1, Ramgali Number 1, Raja Park, Jaipur
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
