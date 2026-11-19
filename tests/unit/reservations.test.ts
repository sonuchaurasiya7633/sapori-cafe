import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../../src/lib/db/store';
import { TableReservation } from '../../src/types';

describe('Table Reservation & Bidirectional Sync Engine', () => {
  beforeEach(() => {
    // Reset table 01 to available before each test
    dbStore.updateTableStatus('01', 'available');
    dbStore.updateTableStatus('02', 'available');
  });

  it('successfully creates a reservation and generates a unique SAP-RES-XXXXX code', () => {
    const reservationData: TableReservation = {
      id: `test-res-${Date.now()}`,
      bookingRef: `SAP-RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      guestName: 'Ananya Singhania',
      phone: '9829012345',
      email: 'ananya@example.com',
      guestsCount: 4,
      date: '2026-11-20',
      timeSlot: '08:00 PM',
      occasion: 'Anniversary',
      status: 'CONFIRMED',
      tableNumber: '01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = dbStore.createReservation(reservationData);
    expect(created.bookingRef).toMatch(/^SAP-RES-[A-Z0-9]+$/);
    expect(created.guestName).toBe('Ananya Singhania');
    expect(created.guestsCount).toBe(4);

    const fetched = dbStore.getReservationById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.bookingRef).toBe(created.bookingRef);
  });

  it('bidirectionally sets table to occupied when guest arrives (status: ARRIVED)', () => {
    const resId = `test-res-arrived-${Date.now()}`;
    const reservation: TableReservation = {
      id: resId,
      bookingRef: `SAP-RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      guestName: 'Kunal Kapoor',
      phone: '9829054321',
      guestsCount: 2,
      date: '2026-11-20',
      timeSlot: '07:00 PM',
      status: 'CONFIRMED',
      tableNumber: '01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createReservation(reservation);

    // Transition status to ARRIVED
    const updated = dbStore.updateReservation(resId, { status: 'ARRIVED' }, 'admin');
    expect(updated?.status).toBe('ARRIVED');

    // Table 01 should now be occupied
    const tables = dbStore.getTables();
    const table01 = tables.find((t) => t.tableNumber === '01');
    expect(table01?.status).toBe('occupied');
  });

  it('bidirectionally frees the table when booking status becomes COMPLETED or CANCELLED', () => {
    const resId = `test-res-release-${Date.now()}`;
    const reservation: TableReservation = {
      id: resId,
      bookingRef: `SAP-RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      guestName: 'Rohit Verma',
      phone: '9829099887',
      guestsCount: 2,
      date: '2026-11-20',
      timeSlot: '07:00 PM',
      status: 'ARRIVED',
      tableNumber: '02',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createReservation(reservation);
    dbStore.updateTableStatus('02', 'occupied');

    // Guest finishes meal -> Mark COMPLETED
    dbStore.updateReservation(resId, { status: 'COMPLETED' }, 'admin');

    const tables = dbStore.getTables();
    const table02 = tables.find((t) => t.tableNumber === '02');
    expect(table02?.status).toBe('available');
  });

  it('releases previous table when reassigned to a different table', () => {
    const resId = `test-res-reassign-${Date.now()}`;
    const reservation: TableReservation = {
      id: resId,
      bookingRef: `SAP-RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      guestName: 'Priya Sharma',
      phone: '9829011223',
      guestsCount: 2,
      date: '2026-11-20',
      timeSlot: '07:00 PM',
      status: 'ARRIVED',
      tableNumber: '01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createReservation(reservation);
    dbStore.updateTableStatus('01', 'occupied');

    // Move guest from Table 01 to Table 02
    dbStore.updateReservation(resId, { tableNumber: '02' }, 'admin');

    const tables = dbStore.getTables();
    const table01 = tables.find((t) => t.tableNumber === '01');
    const table02 = tables.find((t) => t.tableNumber === '02');

    expect(table01?.status).toBe('available');
    expect(table02?.status).toBe('occupied');
  });

  it('correctly handles deletion and cleans up table assignment', () => {
    const resId = `test-res-del-${Date.now()}`;
    const reservation: TableReservation = {
      id: resId,
      bookingRef: `SAP-RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      guestName: 'Devansh Pareek',
      phone: '9829077665',
      guestsCount: 4,
      date: '2026-11-20',
      timeSlot: '08:00 PM',
      status: 'ARRIVED',
      tableNumber: '01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createReservation(reservation);
    dbStore.updateTableStatus('01', 'occupied');

    const deleted = dbStore.deleteReservation(resId, 'admin');
    expect(deleted).toBe(true);

    const tables = dbStore.getTables();
    const table01 = tables.find((t) => t.tableNumber === '01');
    expect(table01?.status).toBe('available');

    const lookup = dbStore.getReservationById(resId);
    expect(lookup).toBeUndefined();
  });
});
