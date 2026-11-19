'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Phone,
  Check,
  X,
  RefreshCw,
  Users,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Utensils,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { TableReservation, DiningTable } from '@/types';
import { toast } from '@/lib/toast';

const OCCASIONS = [
  'Casual Dining',
  'Birthday Celebration',
  'Anniversary',
  'Business Meeting',
  'Romantic Date',
  'Family Gathering',
  'High Tea Gathering',
];

const TIME_SLOTS = [
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Notes Modal
  const [editingNotesReservation, setEditingNotesReservation] = useState<TableReservation | null>(null);
  const [tempAdminNotes, setTempAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Form State for New Reservation
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    email: '',
    guestsCount: 2,
    date: todayStr,
    timeSlot: '07:00 PM',
    occasion: 'Casual Dining',
    specialRequests: '',
    adminNotes: '',
    tableNumber: '',
  });

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [resRes, tablesRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/tables'),
      ]);

      const resData = await resRes.json();
      const tablesData = await tablesRes.json();

      if (resData.reservations) setReservations(resData.reservations);
      if (tablesData.tables) setTables(tablesData.tables);
    } catch (err) {
      console.error('Failed to load reservations or tables:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Status
  const handleUpdateStatus = async (
    id: string,
    status: TableReservation['status'],
    tableNumber?: string
  ) => {
    setUpdatingId(id);
    try {
      const body: any = { status };
      if (tableNumber !== undefined) {
        body.tableNumber = tableNumber;
      }

      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reservation) {
          setReservations((prev) =>
            prev.map((r) => (r.id === id ? data.reservation : r))
          );
          toast.success(`Reservation status updated to ${status}`);
        }
        // Re-sync tables as status transitions (e.g. ARRIVED or COMPLETED) update table occupied states
        const tRes = await fetch('/api/tables');
        const tData = await tRes.json();
        if (tData.tables) setTables(tData.tables);
      } else {
        toast.error('Failed to update reservation status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Network error updating reservation');
    } finally {
      setUpdatingId(null);
    }
  };

  // Assign Table
  const handleAssignTable = async (id: string, tableNumber: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: tableNumber || null }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reservation) {
          setReservations((prev) =>
            prev.map((r) => (r.id === id ? data.reservation : r))
          );
        }
        const tRes = await fetch('/api/tables');
        const tData = await tRes.json();
        if (tData.tables) setTables(tData.tables);
        toast.success(`Table ${tableNumber || 'unassigned'} assigned!`);
      } else {
        toast.error('Failed to assign table');
      }
    } catch (err) {
      console.error('Failed to assign table:', err);
      toast.error('Network error assigning table');
    } finally {
      setUpdatingId(null);
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!editingNotesReservation) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/reservations/${editingNotesReservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: tempAdminNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reservation) {
          setReservations((prev) =>
            prev.map((r) => (r.id === editingNotesReservation.id ? data.reservation : r))
          );
        }
        setEditingNotesReservation(null);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Submit New Walk-in / Phone Reservation
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreate(true);
    setCreateError(null);

    try {
      const payload = {
        ...formData,
        guestsCount: Number(formData.guestsCount),
        source: 'admin',
        status: 'CONFIRMED',
      };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create reservation');
      }

      if (data.reservation) {
        setReservations((prev) => [data.reservation, ...prev]);
      }

      setShowCreateModal(false);
      // Reset form
      setFormData({
        guestName: '',
        phone: '',
        email: '',
        guestsCount: 2,
        date: todayStr,
        timeSlot: '07:00 PM',
        occasion: 'Casual Dining',
        specialRequests: '',
        adminNotes: '',
        tableNumber: '',
      });

      // Refresh table state
      const tRes = await fetch('/api/tables');
      const tData = await tRes.json();
      if (tData.tables) setTables(tData.tables);
    } catch (err: any) {
      setCreateError(err.message || 'Error creating reservation');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Filtered List
  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      // Date filter
      if (selectedDateFilter === 'today' && r.date !== todayStr) return false;
      if (selectedDateFilter === 'tomorrow' && r.date !== tomorrowStr) return false;
      if (selectedDateFilter === 'custom' && customDate && r.date !== customDate) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.guestName.toLowerCase().includes(q);
        const matchPhone = r.phone.includes(q);
        const matchRef = r.bookingRef.toLowerCase().includes(q);
        const matchTable = r.tableNumber?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchRef && !matchTable) return false;
      }

      return true;
    });
  }, [reservations, selectedStatus, selectedDateFilter, customDate, todayStr, tomorrowStr, searchQuery]);

  // Executive KPIs
  const todayCount = reservations.filter((r) => r.date === todayStr).length;
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  const arrivedCount = reservations.filter((r) => r.status === 'ARRIVED').length;
  const availableTablesCount = tables.filter((t) => t.status === 'available').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Table & Floor Hostess Console
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Table Reservations
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Raja Park Dining Hall • Real-time guest seating & reservation tracking
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Today's Bookings</span>
          <span className="text-2xl font-black text-[#15370D]">{todayCount}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">{todayStr}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Pending Confirmation</span>
          <span className="text-2xl font-black text-[#15370D]">{pendingCount}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">Awaiting staff action</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Currently Seated</span>
          <span className="text-2xl font-black text-[#15370D]">{arrivedCount}</span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">Status: ARRIVED</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Available Tables</span>
          <span className="text-2xl font-black text-[#15370D]">
            {availableTablesCount} <span className="text-xs font-normal text-[#15370D]/60">/ {tables.length}</span>
          </span>
          <span className="text-[10px] text-[#15370D]/60 block mt-0.5">Ready for seating</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#15370D]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by guest name, phone, or booking ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5EFE1]/50 border border-[#15370D]/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#15370D] placeholder-[#15370D]/50 font-medium focus:outline-none focus:ring-2 focus:ring-[#15370D]"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 mr-1">
              Date:
            </span>
            <button
              onClick={() => setSelectedDateFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedDateFilter === 'all'
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedDateFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedDateFilter === 'today'
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDateFilter('tomorrow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedDateFilter === 'tomorrow'
                  ? 'bg-[#15370D] text-[#FFFFFF]'
                  : 'bg-[#F5EFE1] text-[#15370D] hover:bg-[#F5EFE1]/80'
              }`}
            >
              Tomorrow
            </button>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setSelectedDateFilter('custom');
              }}
              className="bg-[#F5EFE1] border border-[#15370D]/20 rounded-xl px-2 py-1 text-xs text-[#15370D] font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#15370D]/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'ARRIVED', label: 'Arrived (Seated)' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === st.id
                  ? 'bg-[#15370D] text-[#FFFFFF] shadow-2xs'
                  : 'bg-[#F5EFE1]/60 text-[#15370D] hover:bg-[#F5EFE1]'
              }`}
            >
              {st.label}
            </button>
          ))}
          <span className="text-xs text-[#15370D]/60 ml-auto font-medium">
            Showing {filtered.length} of {reservations.length} records
          </span>
        </div>
      </div>

      {/* Bookings Roster */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
              Loading Reservations...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#15370D]">
            <Calendar className="w-10 h-10 opacity-30 mx-auto" />
            <p className="font-bold text-sm">No reservations match the active filter</p>
            <p className="text-xs text-[#15370D]/60">
              Adjust your date or status filters, or create a new booking using the button above.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#15370D]">
                <thead className="bg-[#F5EFE1] uppercase font-bold text-[10px] tracking-wider border-b border-[#15370D]/10 text-[#15370D]/80">
                  <tr>
                    <th className="py-3.5 px-4">Ref & Occasion</th>
                    <th className="py-3.5 px-4">Schedule</th>
                    <th className="py-3.5 px-4">Guest Info</th>
                    <th className="py-3.5 px-4">Guests</th>
                    <th className="py-3.5 px-4">Assign Table</th>
                    <th className="py-3.5 px-4">Notes</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15370D]/10">
                  {filtered.map((r) => {
                    const isUpdating = updatingId === r.id;

                    return (
                      <tr key={r.id} className="hover:bg-[#F5EFE1]/20 transition-colors">
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-mono font-black text-xs">{r.bookingRef}</div>
                          {r.occasion && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/15 text-[10px] font-bold">
                              {r.occasion}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap align-top">
                          <div className="font-bold text-xs">{r.date}</div>
                          <div className="text-[11px] text-[#15370D]/70 font-semibold">{r.timeSlot}</div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-xs">{r.guestName}</div>
                          <a
                            href={`https://wa.me/91${r.phone.replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#15370D] font-mono hover:underline flex items-center space-x-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-[#15370D]" />
                            <span>{r.phone}</span>
                          </a>
                          {r.email && (
                            <div className="text-[10px] text-[#15370D]/60 mt-0.5 truncate max-w-[150px]">
                              {r.email}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold whitespace-nowrap align-top">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-[#15370D]/60" />
                            <span>{r.guestsCount} {r.guestsCount === 1 ? 'Guest' : 'Guests'}</span>
                          </div>
                        </td>

                        {/* Interactive Table Assignment */}
                        <td className="py-3.5 px-4 align-top">
                          <select
                            disabled={isUpdating || r.status === 'COMPLETED' || r.status === 'CANCELLED'}
                            value={r.tableNumber || ''}
                            onChange={(e) => handleAssignTable(r.id, e.target.value)}
                            className="bg-[#F5EFE1] border border-[#15370D]/20 rounded-xl px-2 py-1 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D] disabled:opacity-60"
                          >
                            <option value="">Unassigned</option>
                            {tables.map((t) => (
                              <option key={t.tableNumber} value={t.tableNumber}>
                                Table {t.tableNumber} ({t.capacity}p) {t.status === 'occupied' ? '• Occupied' : ''}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Special Requests & Notes */}
                        <td className="py-3.5 px-4 align-top max-w-[180px]">
                          {r.specialRequests && (
                            <p className="text-[11px] text-[#15370D]/90 italic line-clamp-2 mb-1">
                              "{r.specialRequests}"
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setEditingNotesReservation(r);
                              setTempAdminNotes(r.adminNotes || '');
                            }}
                            className="text-[10px] font-bold text-[#15370D]/70 hover:text-[#15370D] underline flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{r.adminNotes ? 'Edit Staff Note' : '+ Add Note'}</span>
                          </button>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block ${
                              r.status === 'CONFIRMED'
                                ? 'bg-[#15370D] text-[#FFFFFF]'
                                : r.status === 'ARRIVED'
                                ? 'bg-[#15370D]/90 text-[#FFFFFF] ring-2 ring-[#15370D]'
                                : r.status === 'COMPLETED'
                                ? 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/30'
                                : r.status === 'CANCELLED'
                                ? 'bg-[#F5EFE1] text-[#15370D]/60 border border-[#15370D]/20 line-through'
                                : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        {/* Lifecycle Action Buttons */}
                        <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {r.status === 'PENDING' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')}
                                className="bg-[#15370D] text-[#FFFFFF] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-[#15370D]/90 transition-colors shadow-2xs"
                              >
                                Confirm
                              </button>
                            )}

                            {r.status === 'CONFIRMED' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(r.id, 'ARRIVED', r.tableNumber)}
                                className="bg-[#15370D] text-[#FFFFFF] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-[#15370D]/90 transition-colors shadow-2xs"
                              >
                                Seat (Arrived)
                              </button>
                            )}

                            {r.status === 'ARRIVED' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                                className="bg-[#15370D] text-[#FFFFFF] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-[#15370D]/90 transition-colors shadow-2xs"
                              >
                                Complete Dining
                              </button>
                            )}

                            {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}
                                className="bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-[#FFFFFF] transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack */}
            <div className="lg:hidden divide-y divide-[#15370D]/10">
              {filtered.map((r) => {
                const isUpdating = updatingId === r.id;

                return (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-xs text-[#15370D]">
                            {r.bookingRef}
                          </span>
                          {r.occasion && (
                            <span className="px-1.5 py-0.5 rounded bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/15 text-[9px] font-bold">
                              {r.occasion}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-[#15370D] mt-0.5">{r.guestName}</h3>
                        <a
                          href={`https://wa.me/91${r.phone.replace(/\D/g, '').slice(-10)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-[#15370D] flex items-center space-x-1 mt-0.5 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-[#15370D]" />
                          <span>{r.phone}</span>
                        </a>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          r.status === 'CONFIRMED'
                            ? 'bg-[#15370D] text-[#FFFFFF]'
                            : r.status === 'ARRIVED'
                            ? 'bg-[#15370D]/90 text-[#FFFFFF]'
                            : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="bg-[#F5EFE1]/40 rounded-xl p-3 border border-[#15370D]/10 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold">{r.date}</span> • {r.timeSlot}
                        </div>
                        <div className="font-bold text-[#15370D] flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5 text-[#15370D]/60" />
                          <span>{r.guestsCount} Guests</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#15370D]/10">
                        <span className="text-[10px] font-bold uppercase text-[#15370D]/60">
                          Table Assigned:
                        </span>
                        <select
                          disabled={isUpdating || r.status === 'COMPLETED' || r.status === 'CANCELLED'}
                          value={r.tableNumber || ''}
                          onChange={(e) => handleAssignTable(r.id, e.target.value)}
                          className="bg-[#FFFFFF] border border-[#15370D]/20 rounded-lg px-2 py-1 text-xs font-bold text-[#15370D]"
                        >
                          <option value="">Unassigned</option>
                          {tables.map((t) => (
                            <option key={t.tableNumber} value={t.tableNumber}>
                              Table {t.tableNumber} ({t.capacity}p)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {r.specialRequests && (
                      <p className="text-xs text-[#15370D]/80 italic">
                        "{r.specialRequests}"
                      </p>
                    )}

                    {r.adminNotes && (
                      <p className="text-[11px] text-[#15370D]/70 bg-[#F5EFE1] p-2 rounded-lg border border-[#15370D]/10">
                        <strong className="block text-[10px] uppercase tracking-wider text-[#15370D]/60">
                          Staff Note:
                        </strong>
                        {r.adminNotes}
                      </p>
                    )}

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#15370D]/10">
                      {r.status === 'PENDING' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')}
                          className="bg-[#15370D] text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                        >
                          Confirm
                        </button>
                      )}

                      {r.status === 'CONFIRMED' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(r.id, 'ARRIVED', r.tableNumber)}
                          className="bg-[#15370D] text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                        >
                          Seat (Arrived)
                        </button>
                      )}

                      {r.status === 'ARRIVED' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                          className="bg-[#15370D] text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                        >
                          Complete
                        </button>
                      )}

                      {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}
                          className="bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL: New Walk-in / Phone Reservation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15370D]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#15370D]/20 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
                  Staff Entry
                </span>
                <h2 className="text-lg font-black text-[#15370D]">
                  New Reservation / Walk-In
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#F5EFE1] text-[#15370D] flex items-center justify-center hover:bg-[#15370D] hover:text-[#FFFFFF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="bg-[#F5EFE1] border border-[#15370D]/30 p-3 rounded-xl text-xs text-[#15370D] font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#15370D] shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Guest Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98290 12345"
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guest@domain.com"
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Party Size (Guests) *
                  </label>
                  <select
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: Number(e.target.value) })}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Booking Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Occasion
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                    Pre-Assign Physical Table
                  </label>
                  <select
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    <option value="">Leave Unassigned</option>
                    {tables.map((t) => (
                      <option key={t.tableNumber} value={t.tableNumber}>
                        Table {t.tableNumber} ({t.capacity} guests)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                  Special Requests / Dietary Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="e.g. Window booth preferred, vegetarian celebration cake, quiet corner"
                  className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                  Internal Staff Notes
                </label>
                <input
                  type="text"
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="e.g. VIP regular guest, phoned via WhatsApp"
                  className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#15370D]/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#15370D]/20 text-xs font-bold text-[#15370D] hover:bg-[#F5EFE1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="bg-[#15370D] text-[#FFFFFF] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {submittingCreate ? 'Saving Booking...' : 'Create Confirmed Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff Notes */}
      {editingNotesReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15370D]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#15370D]/20 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
                  Staff Notes
                </span>
                <h3 className="text-base font-black text-[#15370D]">
                  {editingNotesReservation.bookingRef} • {editingNotesReservation.guestName}
                </h3>
              </div>
              <button
                onClick={() => setEditingNotesReservation(null)}
                className="w-7 h-7 rounded-full bg-[#F5EFE1] text-[#15370D] flex items-center justify-center hover:bg-[#15370D] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#15370D]/70 block mb-1">
                Internal Administrative / Kitchen Notes
              </label>
              <textarea
                rows={4}
                value={tempAdminNotes}
                onChange={(e) => setTempAdminNotes(e.target.value)}
                placeholder="Add special seating instructions, VIP status, or billing notes..."
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-3 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#15370D]/10">
              <button
                type="button"
                onClick={() => setEditingNotesReservation(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#15370D] hover:bg-[#F5EFE1]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="bg-[#15370D] text-[#FFFFFF] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
