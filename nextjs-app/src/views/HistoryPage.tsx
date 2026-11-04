'use client';
import React from 'react';
import { History, ShieldCheck, Database } from 'lucide-react';
import { HistoryTable } from '../components/HistoryTable';

export const HistoryPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Classification Audit History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete database of historical waste scans, material classifications, and bin recommendations
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Database className="w-3.5 h-3.5 text-eco-400" />
          <span>Persistent Relational SQL Store</span>
        </div>
      </div>

      {/* Audit Table */}
      <HistoryTable />
    </div>
  );
};
