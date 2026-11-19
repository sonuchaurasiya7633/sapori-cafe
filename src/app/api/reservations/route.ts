import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { TableReservation } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const phone = searchParams.get('phone');
    const ref = searchParams.get('ref');

    let reservations = dbStore.getReservations();

    // Specific Lookup by Reference
    if (ref) {
      const single = reservations.find(
        (r) => r.bookingRef.toUpperCase() === ref.trim().toUpperCase() || r.id === ref.trim()
      );
      if (!single) {
        return NextResponse.json({ success: false, error: 'No reservation found with this reference' }, { status: 404 });
      }
      return NextResponse.json({ success: true, reservation: single });
    }

    // Lookup by Guest Phone Number
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      reservations = reservations.filter((r) => r.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
      return NextResponse.json({ success: true, count: reservations.length, reservations });
    }

    // Filter by status
    if (status && status !== 'all') {
      reservations = reservations.filter((r) => r.status.toUpperCase() === status.toUpperCase());
    }

    // Filter by date
    if (date && date !== 'all') {
      reservations = reservations.filter((r) => r.date === date);
    }

    // Keyword search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      reservations = reservations.filter(
        (r) =>
          r.bookingRef.toLowerCase().includes(q) ||
          r.guestName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          (r.tableNumber && r.tableNumber.includes(q))
      );
    }

    return NextResponse.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestName,
      phone,
      email,
      guestsCount,
      date,
      timeSlot,
      occasion,
      specialRequests,
      tableNumber,
      adminNotes,
      source = 'customer',
    } = body;

    // Field existence
    if (!guestName || !phone || !date || !timeSlot || !guestsCount) {
      return NextResponse.json(
        { success: false, error: 'Guest name, phone, date, time slot, and guest count are required' },
        { status: 400 }
      );
    }

    // Phone validation (minimum 10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // Guest count validation
    const count = parseInt(String(guestsCount), 10);
    if (isNaN(count) || count < 1 || count > 20) {
      return NextResponse.json(
        { success: false, error: 'Guest count must be between 1 and 20 guests' },
        { status: 400 }
      );
    }

    // Date validation: past dates rejected unless admin overrides
    const today = new Date().toISOString().slice(0, 10);
    if (source !== 'admin' && date < today) {
      return NextResponse.json(
        { success: false, error: 'Reservations cannot be made for past dates' },
        { status: 400 }
      );
    }

    // Check table capacity & slot concurrency
    const allReservations = dbStore.getReservations();
    const conflictingBookings = allReservations.filter(
      (r) =>
        r.date === date &&
        r.timeSlot === timeSlot &&
        r.status !== 'CANCELLED' &&
        r.status !== 'NO_SHOW'
    );

    const activeTables = dbStore.getTables().filter((t) => t.isActive);
    if (conflictingBookings.length >= activeTables.length && source !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: `We are fully booked for ${date} at ${timeSlot}. Please select an alternative time slot.`,
        },
        { status: 409 }
      );
    }

    // Generate unique alphanumeric booking reference
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingRef = `SAP-RES-${randomSuffix}`;
    const now = new Date().toISOString();

    const reservation: TableReservation = {
      id: `res-${Date.now()}-${randomSuffix}`,
      bookingRef,
      guestName: guestName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      guestsCount: count,
      date,
      timeSlot,
      tableNumber: tableNumber ? String(tableNumber).trim() : undefined,
      occasion: occasion ? occasion.trim() : undefined,
      specialRequests: specialRequests ? specialRequests.slice(0, 500).trim() : undefined,
      adminNotes: adminNotes ? adminNotes.trim() : undefined,
      status: 'CONFIRMED',
      createdAt: now,
      updatedAt: now,
    };

    const saved = dbStore.createReservation(reservation);

    // If a table was pre-assigned, mark it reserved
    if (reservation.tableNumber) {
      dbStore.updateTableStatus(reservation.tableNumber, 'reserved');
    }

    return NextResponse.json({ success: true, reservation: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Reservation creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create table reservation' },
      { status: 500 }
    );
  }
}
