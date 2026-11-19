import React from 'react';
import { dbStore } from '@/lib/db/store';
import { ShieldCheck, Clock, Terminal, CheckCircle2 } from 'lucide-react';

export default function AdminAuditPage() {
  const logs = dbStore.getAuditLogs();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Compliance & Security
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            System Audit Trail
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Immutable timeline of state modifications, pricing updates, and operator actions
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#F5EFE1] border border-[#15370D]/15 px-3 py-1.5 rounded-xl text-xs font-bold text-[#15370D]">
          <ShieldCheck className="w-4 h-4 text-[#15370D]" />
          <span>{logs.length} Logged Events</span>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
            Chronological Audit Log
          </h2>
          <span className="text-[10px] text-[#15370D]/60 font-mono">Timestamped</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#15370D]/60">
            No audit events registered yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs text-[#15370D] hover:border-[#15370D]/20 transition-colors"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono font-black text-xs sm:text-sm tracking-wider">
                      {log.action}
                    </span>
                    <span className="bg-[#15370D] text-[#FFFFFF] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                      {log.actor}
                    </span>
                  </div>

                  {log.details && (
                    <div className="font-mono text-[11px] text-[#15370D]/80 bg-[#FFFFFF] p-2 rounded-lg border border-[#15370D]/10 overflow-x-auto">
                      <code>{JSON.stringify(log.details)}</code>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-[#15370D]/60 font-mono sm:text-right flex-shrink-0 flex items-center sm:block space-x-1 sm:space-x-0">
                  <Clock className="w-3 h-3 inline sm:hidden" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
