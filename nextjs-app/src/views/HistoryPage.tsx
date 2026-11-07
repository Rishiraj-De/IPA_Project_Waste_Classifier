'use client';
import React from 'react';
import { History, ShieldCheck, Database } from 'lucide-react';
import { HistoryTable } from '../components/HistoryTable';

export const HistoryPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink/[0.08]">
        <div>
          <h1 className="display text-4xl sm:text-[3.4rem] text-ink">
            Classification Audit History
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Complete database of historical waste scans, material classifications, and bin recommendations
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper-2 border border-ink/[0.08] text-xs text-muted">
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span>Persistent Relational SQL Store</span>
        </div>
      </div>

      {/* Audit Table */}
      <HistoryTable />
    </div>
  );
};
