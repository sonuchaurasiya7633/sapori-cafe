'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, ShoppingBag, Calendar, Shield, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu() {
  const { user, customerProfile, loading, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#15370D]/10 animate-pulse hidden sm:block" />
    );
  }

  // If not logged in: Show "Sign In" button
  if (!user) {
    return (
      <button
        onClick={() => openAuthModal('google')}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
        title="Sign in to Sapori"
      >
        <User className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  // User Initial for avatar fallback
  const displayName = customerProfile?.name || user.displayName || 'Customer';
  const displayEmailOrPhone = user.email || user.phoneNumber || '';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-[#FFFFFF] hover:bg-[#F5EFE1] border border-[#15370D]/20 rounded-full transition-all cursor-pointer shadow-2xs"
        aria-expanded={dropdownOpen}
        title={`Account: ${displayName}`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover border border-[#15370D]/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#15370D] to-[#1e4a14] text-[#DEB853] flex items-center justify-center font-bold text-xs shadow-xs">
            {initial}
          </div>
        )}
        <span className="hidden md:inline text-xs font-bold text-[#15370D] max-w-[100px] truncate">
          {displayName.split(' ')[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-[#15370D]/60" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] border border-[#15370D]/20 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          {/* User Card Header */}
          <div className="border-b border-[#15370D]/10 pb-3 px-1">
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#15370D]/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#15370D] text-[#DEB853] flex items-center justify-center font-bold text-sm shadow-xs">
                  {initial}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#15370D] truncate">{displayName}</p>
                <p className="text-[11px] text-[#15370D]/65 truncate">{displayEmailOrPhone}</p>
                {customerProfile && customerProfile.totalOrdersCount !== undefined && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#DEB853]/20 text-[#071c05] font-bold text-[9px]">
                    {customerProfile.totalOrdersCount} {customerProfile.totalOrdersCount === 1 ? 'Order' : 'Orders'} Placed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Links */}
          <div className="space-y-1">
            <Link
              href="/orders"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#15370D] bg-[#F5EFE1]/70 hover:bg-[#F5EFE1] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#15370D]" />
                <span>My Orders &amp; Tracking</span>
              </div>
              {customerProfile?.totalOrdersCount ? (
                <span className="w-5 h-5 rounded-full bg-[#15370D] text-[#FFFFFF] text-[10px] font-black flex items-center justify-center tabular-nums shadow-2xs">
                  {customerProfile.totalOrdersCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/menu"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#15370D] hover:bg-[#F5EFE1] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#15370D]/70" />
              <span>Order Food</span>
            </Link>

            <Link
              href="/reservations"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#15370D] hover:bg-[#F5EFE1] transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#15370D]/70" />
              <span>Book Table</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#15370D] hover:bg-[#F5EFE1] transition-colors"
            >
              <Shield className="w-4 h-4 text-[#15370D]/70" />
              <span>Admin Portal</span>
            </Link>
          </div>

          {/* Logout Action */}
          <div className="border-t border-[#15370D]/10 pt-1.5">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
