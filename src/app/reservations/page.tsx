'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageCircle,
  MapPin,
  Sparkles,
  UtensilsCrossed,
  ArrowRight,
  XCircle,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { TableReservation } from '@/types';
import { toast } from '@/lib/toast';

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<'book' | 'lookup'>('book');

  // Booking Form State
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('07:00 PM');
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);

  // Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResults, setLookupResults] = useState<TableReservation[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const timeSlots = [
    { label: 'Brunch & Morning', slots: ['10:30 AM', '11:30 AM'] },
    { label: 'Lunch & Afternoon', slots: ['12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'] },
    { label: 'Sunset & Evening Dinner', slots: ['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'] },
  ];

  const occasions = [
    'Casual Dining',
    'Birthday Celebration',
    'Anniversary',
    'Romantic Date',
    'Work & Coffee Session',
    'Family Gathering',
  ];

  // Helper to check if a slot is in the past for today's date
  const isSlotPastForToday = (slot: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (date !== today) return false;

    const [timeStr, modifier] = slot.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const slotDate = new Date();
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate.getTime() < Date.now();
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      const msg = 'Please enter your full name';
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      const msg = 'Please enter a valid 10-digit contact number';
      toast.warning(msg);
      setErrorMsg(msg);
      return;
    }

    setSubmitting(true);
    toast.loading('Confirming your table reservation...');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          guestsCount,
          date,
          timeSlot,
          occasion,
          specialRequests: specialRequests.trim() || undefined,
          source: 'customer',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to confirm table booking');
      }

      toast.dismiss();
      toast.success('Table Reserved Successfully!', {
        description: `Ref: ${data.reservation.bookingRef} • ${date} at ${timeSlot}`,
      });
      setConfirmedReservation(data.reservation);
    } catch (err: any) {
      toast.dismiss();
      const msg = err.message || 'Unable to complete reservation. Please try another slot or call us.';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResults([]);

    const query = lookupQuery.trim();
    if (!query) {
      setLookupError('Enter your Booking Reference or registered Phone number');
      return;
    }

    setLookupLoading(true);
    try {
      const isRef = query.toUpperCase().startsWith('SAP-RES') || query.toUpperCase().startsWith('RES');
      const param = isRef ? `ref=${encodeURIComponent(query)}` : `phone=${encodeURIComponent(query)}`;
      const res = await fetch(`/api/reservations?${param}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching reservation found');
      }

      if (data.reservation) {
        setLookupResults([data.reservation]);
      } else if (data.reservations && data.reservations.length > 0) {
        setLookupResults(data.reservations);
      } else {
        setLookupError('No active reservations found for this contact details');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Could not find reservation records');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCancelBooking = async (reservationId: string, ref: string) => {
    if (!confirm(`Are you sure you want to cancel your table reservation (${ref})?`)) return;

    setCancellingId(reservationId);
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', actor: 'customer' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLookupResults((prev) =>
          prev.map((r) => (r.id === reservationId ? { ...r, status: 'CANCELLED' } : r))
        );
      } else {
        alert(data.error || 'Failed to cancel reservation');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-8 sm:py-14 text-[#15370D]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Hospitality & Table Dining
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#15370D] tracking-tight">
            Reserve Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#15370D]/80 leading-relaxed">
            Slow-fermented 48-hour Neapolitan pizzas, artisanal Arabica cold brews, and serene hospitality at Ramgali No. 1, Raja Park, Jaipur.
          </p>
        </div>

        {/* Tab Switcher: Book Table vs Check Booking */}
        <div className="flex justify-center">
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 p-1 rounded-2xl flex items-center space-x-1 shadow-2xs">
            <button
              onClick={() => {
                setActiveTab('book');
                setConfirmedReservation(null);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'book'
                  ? 'bg-[#15370D] text-[#FFFFFF] shadow-xs'
                  : 'text-[#15370D]/70 hover:text-[#15370D]'
              }`}
            >
              Reserve a Table
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'lookup'
                  ? 'bg-[#15370D] text-[#FFFFFF] shadow-xs'
                  : 'text-[#15370D]/70 hover:text-[#15370D]'
              }`}
            >
              Track / Manage Booking
            </button>
          </div>
        </div>

        {/* TAB 1: BOOK TABLE */}
        {activeTab === 'book' && (
          <>
            {confirmedReservation ? (
              /* Booking Success Confirmation Card */
              <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-[#F5EFE1] rounded-2xl mx-auto flex items-center justify-center text-[#15370D] border border-[#15370D]/15">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#15370D]/60 block">
                    Reservation Confirmed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#15370D]">
                    We Look Forward to Welcoming You, {confirmedReservation.guestName}!
                  </h2>
                  <p className="text-xs text-[#15370D]/70 max-w-md mx-auto">
                    Your table has been reserved in our dining schedule. A confirmation summary is ready below.
                  </p>
                </div>

                {/* Booking Telemetry Card */}
                <div className="bg-[#F5EFE1]/60 border border-[#15370D]/20 rounded-2xl p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left text-[#15370D]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
                      Booking Reference
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-[#15370D]">
                      {confirmedReservation.bookingRef}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
                      Date & Time
                    </span>
                    <span className="font-bold text-xs sm:text-sm block">
                      {confirmedReservation.date}
                    </span>
                    <span className="text-[11px] text-[#15370D]/70">
                      {confirmedReservation.timeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
                      Party Size
                    </span>
                    <span className="font-bold text-xs sm:text-sm block">
                      {confirmedReservation.guestsCount} Guests
                    </span>
                    <span className="text-[11px] text-[#15370D]/70">
                      {confirmedReservation.occasion || 'Dining'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block">
                      Assigned Table
                    </span>
                    <span className="font-bold text-xs sm:text-sm block">
                      {confirmedReservation.tableNumber
                        ? `Table ${confirmedReservation.tableNumber}`
                        : 'Assigned on Arrival'}
                    </span>
                    <span className="text-[10px] font-black uppercase text-[#15370D]">
                      {confirmedReservation.status}
                    </span>
                  </div>
                </div>

                {/* WhatsApp & Menu Quick Actions */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={`https://wa.me/916367373302?text=${encodeURIComponent(
                      `Hello Sapori Café! I have reserved a table (Ref: ${confirmedReservation.bookingRef}) for ${confirmedReservation.guestsCount} guests on ${confirmedReservation.date} at ${confirmedReservation.timeSlot}. Guest Name: ${confirmedReservation.guestName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xs min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send to WhatsApp (+91 63673 73302)</span>
                  </a>

                  <Link
                    href="/menu"
                    className="bg-[#FFFFFF] border border-[#15370D]/30 text-[#15370D] hover:bg-[#F5EFE1] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all min-h-[44px]"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Browse Menu Prior to Visit</span>
                  </Link>

                  <button
                    onClick={() => setConfirmedReservation(null)}
                    className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D]/70 hover:text-[#15370D] hover:bg-[#F5EFE1] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[44px]"
                  >
                    Make Another Booking
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form
                onSubmit={handleBookingSubmit}
                className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-5 sm:p-8 lg:p-10 space-y-6 shadow-xs animate-in fade-in duration-150"
              >
                {errorMsg && (
                  <div className="bg-[#FFFFFF] border-2 border-[#15370D] p-3.5 rounded-2xl flex items-center space-x-2.5 text-xs font-bold text-[#15370D]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Section 1: Date & Time */}
                <div className="space-y-4">
                  <div className="border-b border-[#15370D]/10 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]">
                      1. Select Date & Time Slot
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                        Reservation Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().slice(0, 10)}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                        Dining Occasion
                      </label>
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      >
                        {occasions.map((occ) => (
                          <option key={occ} value={occ}>
                            {occ}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D]">
                      Available Time Slots for {date} *
                    </label>

                    <div className="space-y-3">
                      {timeSlots.map((group) => (
                        <div key={group.label} className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/60 block">
                            {group.label}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                            {group.slots.map((slot) => {
                              const isPast = isSlotPastForToday(slot);
                              const isSelected = timeSlot === slot;

                              return (
                                <button
                                  type="button"
                                  key={slot}
                                  disabled={isPast}
                                  onClick={() => setTimeSlot(slot)}
                                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                                    isSelected
                                      ? 'bg-[#15370D] text-[#FFFFFF] shadow-xs'
                                      : isPast
                                      ? 'bg-[#F5EFE1]/40 text-[#15370D]/30 border border-[#15370D]/10 cursor-not-allowed line-through'
                                      : 'bg-[#F5EFE1]/60 text-[#15370D] hover:bg-[#F5EFE1] border border-[#15370D]/15'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Party Size */}
                <div className="space-y-3 pt-2">
                  <div className="border-b border-[#15370D]/10 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]">
                      2. Number of Guests
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setGuestsCount(num)}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                          guestsCount === num
                            ? 'bg-[#15370D] text-[#FFFFFF] shadow-xs'
                            : 'bg-[#F5EFE1]/60 text-[#15370D] hover:bg-[#F5EFE1] border border-[#15370D]/15'
                        }`}
                      >
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </button>
                    ))}
                  </div>
                  {guestsCount > 8 && (
                    <p className="text-[11px] text-[#15370D]/70 italic">
                      For parties of 8+ guests, our hospitality team arranges dedicated dining hall table combinations.
                    </p>
                  )}
                </div>

                {/* Section 3: Guest Details */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-[#15370D]/10 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#15370D]">
                      3. Guest Contact & Special Notes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                        Guest Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Mehra"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                        WhatsApp Contact Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 6367373302"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. vikram@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                        Special Requests or Dietary Requirements (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Birthday cake presentation, booth preference, quiet spot for laptop..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 min-h-[48px]"
                  >
                    {submitting ? 'Confirming Table Availability...' : 'Confirm Table Reservation'}
                  </button>
                  <p className="text-[11px] text-center text-[#15370D]/60 mt-2">
                    Instant confirmation • No upfront booking charges • Cancel anytime
                  </p>
                </div>
              </form>
            )}
          </>
        )}

        {/* TAB 2: LOOKUP & MANAGE RESERVATION */}
        {activeTab === 'lookup' && (
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-black text-[#15370D]">
                Check Your Reservation Status
              </h2>
              <p className="text-xs text-[#15370D]/70 mt-0.5">
                Enter your unique booking reference (e.g. SAP-RES-12345) or the 10-digit phone number you provided during booking.
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#15370D]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SAP-RES-45812 or 9876543210"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full bg-[#F5EFE1]/50 border border-[#15370D]/20 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <button
                type="submit"
                disabled={lookupLoading}
                className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 min-h-[44px]"
              >
                {lookupLoading ? 'Searching...' : 'Find Reservation'}
              </button>
            </form>

            {lookupError && (
              <div className="bg-[#FFFFFF] border-2 border-[#15370D] p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-bold text-[#15370D]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {/* Lookup Results List */}
            {lookupResults.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                  Found {lookupResults.length} Reservation Records:
                </h3>

                <div className="space-y-4">
                  {lookupResults.map((res) => {
                    const isCancelled = res.status === 'CANCELLED';
                    const isSeated = res.status === 'ARRIVED';
                    const isConfirmed = res.status === 'CONFIRMED';

                    return (
                      <div
                        key={res.id}
                        className="p-5 rounded-2xl bg-[#F5EFE1]/40 border border-[#15370D]/15 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#15370D]/10 pb-3">
                          <div>
                            <span className="font-mono text-base font-black text-[#15370D]">
                              {res.bookingRef}
                            </span>
                            <span className="text-xs font-bold text-[#15370D]/80 block">
                              Guest: {res.guestName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isConfirmed
                                  ? 'bg-[#15370D] text-[#FFFFFF]'
                                  : isSeated
                                  ? 'bg-[#FFFFFF] text-[#15370D] border border-[#15370D]'
                                  : isCancelled
                                  ? 'bg-[#FFFFFF] text-[#15370D]/40 border border-[#15370D]/20 line-through'
                                  : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20'
                              }`}
                            >
                              Status: {res.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#15370D]">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Date</span>
                            <span className="font-bold">{res.date}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Time Slot</span>
                            <span className="font-bold">{res.timeSlot}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Party Size</span>
                            <span className="font-bold">{res.guestsCount} Guests</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Table</span>
                            <span className="font-bold">
                              {res.tableNumber ? `Table ${res.tableNumber}` : 'Assigned on arrival'}
                            </span>
                          </div>
                        </div>

                        {res.specialRequests && (
                          <p className="text-xs text-[#15370D]/75 italic">
                            "{res.specialRequests}"
                          </p>
                        )}

                        {!isCancelled && (
                          <div className="pt-2 border-t border-[#15370D]/10 flex items-center justify-between">
                            <span className="text-[11px] text-[#15370D]/60">
                              Need to change plans?
                            </span>
                            <button
                              disabled={cancellingId === res.id}
                              onClick={() => handleCancelBooking(res.id, res.bookingRef)}
                              className="text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline"
                            >
                              {cancellingId === res.id ? 'Cancelling...' : 'Cancel Reservation'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Café Ambience & Table Experience */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#15370D]">Neapolitan Pizza Oven Hall</h3>
            <p className="text-xs text-[#15370D]/70 leading-relaxed">
              Warm, aromatic booth seating centered around our high-temp pizza oven. Ideal for food-first gatherings.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#15370D]">Specialty Arabica Brew Bar</h3>
            <p className="text-xs text-[#15370D]/70 leading-relaxed">
              High-top bar stools and quiet corner booths with power outlets. Perfect for laptop sessions and cold brew tastings.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#F5EFE1] flex items-center justify-center text-[#15370D]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#15370D]">Large Group & Party Bookings</h3>
            <p className="text-xs text-[#15370D]/70 leading-relaxed">
              Family celebrations, anniversaries, or team dinners. Direct phone reservations available for parties larger than 12.
            </p>
          </div>
        </div>

        {/* Business Contact Footer */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-6 text-center space-y-2 text-xs">
          <p className="font-bold uppercase tracking-wider text-[#15370D]">
            Sapori Café & Eatery • Raja Park Branch
          </p>
          <p className="text-[#15370D]/70">
            217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India
          </p>
          <div className="flex items-center justify-center space-x-4 pt-1 font-bold">
            <a href="tel:+916367373302" className="hover:underline flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 63673 73302</span>
            </a>
            <span>•</span>
            <a
              href="https://wa.me/916367373302"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Inquiries</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
