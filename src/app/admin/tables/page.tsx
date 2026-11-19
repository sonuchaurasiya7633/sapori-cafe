'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { QrCode, Utensils, CheckCircle2, ExternalLink, RefreshCw, Sparkles, Users } from 'lucide-react';
import { DiningTable } from '@/types';
import { toast } from '@/lib/toast';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingTable, setUpdatingTable] = useState<string | null>(null);

  const loadTables = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.tables) setTables(data.tables);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleUpdateStatus = async (
    tableNumber: string,
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  ) => {
    setUpdatingTable(tableNumber);
    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, status }),
      });
      if (res.ok) {
        setTables((prev) =>
          prev.map((t) => (t.tableNumber === tableNumber ? { ...t, status } : t))
        );
        toast.success(`Table ${tableNumber} marked as ${status.toUpperCase()}`);
      } else {
        toast.error('Failed to update table status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating table');
    } finally {
      setUpdatingTable(null);
    }
  };

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Dine-In Management
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Dining Tables & QR Ordering
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Raja Park Dining Hall • {tables.length} physical tables configured
          </p>
        </div>

        <button
          onClick={() => loadTables(true)}
          disabled={refreshing}
          className="self-start sm:self-auto bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Total Tables</span>
          <span className="text-2xl font-black text-[#15370D]">{tables.length}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Available</span>
          <span className="text-2xl font-black text-[#15370D]">{availableCount}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Occupied</span>
          <span className="text-2xl font-black text-[#15370D]">{occupiedCount}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Reserved / Cleaning</span>
          <span className="text-2xl font-black text-[#15370D]">{tables.length - occupiedCount - availableCount}</span>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#15370D]/10 pb-3 gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
            Floor Map Roster
          </h2>
          <span className="text-[11px] text-[#15370D]/60">
            Click status pill to toggle table availability in real time
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
              Loading Floor Tables...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tables.map((tbl) => {
              const isOccupied = tbl.status === 'occupied';
              const isUpdating = updatingTable === tbl.tableNumber;

              return (
                <div
                  key={tbl.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isOccupied
                      ? 'bg-[#15370D] text-[#FFFFFF] border-[#15370D] shadow-xs'
                      : 'bg-[#FFFFFF] text-[#15370D] border-[#15370D]/15 hover:border-[#15370D]/30 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xl font-black">
                          Table {tbl.tableNumber}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-semibold flex items-center space-x-1 mt-0.5 ${
                          isOccupied ? 'text-[#FFFFFF]/80' : 'text-[#15370D]/60'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Capacity: {tbl.capacity} guests</span>
                      </div>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isOccupied ? 'bg-[#FFFFFF]/15 text-[#FFFFFF]' : 'bg-[#F5EFE1] text-[#15370D]'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isOccupied ? 'text-[#FFFFFF]/70' : 'text-[#15370D]/60'
                      }`}
                    >
                      Current Status:
                    </span>
                    <select
                      disabled={isUpdating}
                      value={tbl.status}
                      onChange={(e) =>
                        handleUpdateStatus(tbl.tableNumber, e.target.value as any)
                      }
                      className={`w-full rounded-xl py-1.5 px-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                        isOccupied
                          ? 'bg-[#FFFFFF] text-[#15370D] border-0'
                          : 'bg-[#F5EFE1] text-[#15370D] border border-[#15370D]/20'
                      }`}
                    >
                      <option value="available">Available (Free)</option>
                      <option value="occupied">Occupied (Seated)</option>
                      <option value="reserved">Reserved</option>
                      <option value="cleaning">Cleaning / Reset</option>
                    </select>
                  </div>

                  {/* QR Link */}
                  <div
                    className={`pt-3 border-t text-[11px] font-bold ${
                      isOccupied ? 'border-[#FFFFFF]/15' : 'border-[#15370D]/10'
                    }`}
                  >
                    <Link
                      href={`/table/${tbl.tableNumber}`}
                      target="_blank"
                      className={`flex items-center justify-between hover:underline ${
                        isOccupied ? 'text-[#FFFFFF]' : 'text-[#15370D]'
                      }`}
                    >
                      <span>Simulate Guest QR View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
