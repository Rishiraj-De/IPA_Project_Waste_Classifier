'use client';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  X, 
  Download, 
  RefreshCw,
  Radio
} from 'lucide-react';
import { apiService } from '../services/api';
import { HistoryItem, HistoryListResponse } from '../types';
import { DetectionCard } from './DetectionCard';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';

const CATEGORIES = [
  'All',
  'Plastic',
  'Paper',
  'Cardboard',
  'Glass',
  'Metal',
  'Organic',
  'E-Waste',
  'Hazardous Waste',
  'Other/Unknown',
];

export const HistoryTable: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [recyclableFilter, setRecyclableFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const recyclableOnly =
        recyclableFilter === 'yes' ? true : recyclableFilter === 'no' ? false : undefined;
      const res = await apiService.getHistory({
        page,
        limit,
        category: category !== 'All' ? category : undefined,
        search: search.trim() ? search.trim() : undefined,
        recyclable_only: recyclableOnly,
        sort_by: 'created_at',
        sort_order: sortOrder,
      });
      setHistoryData(res);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, category, recyclableFilter, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this classification record permanently?')) return;
    setDeletingId(id);
    try {
      await apiService.deleteHistoryRecord(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      await fetchHistory();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete history record.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    if (!historyData || historyData.items.length === 0) {
      alert('No history records to export.');
      return;
    }

    const headers = [
      'Record ID',
      'Created At',
      'Primary Category',
      'Total Objects',
      'Avg Confidence (%)',
      'Source',
      'Detected Items',
    ];

    const rows = historyData.items.map((item) => [
      item.id,
      item.created_at,
      item.primary_category,
      item.total_objects,
      Math.round(item.average_confidence * 100),
      item.source,
      item.objects.map((o) => `${o.label} (${Math.round(o.confidence * 100)}%)`).join('; '),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecosort_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = historyData ? Math.ceil(historyData.total / limit) : 1;

  return (
    <div className="flex flex-col gap-6 w-full text-left font-sans">
      
      {/* Search & Filter Toolbar */}
      <div className="cred-card p-4 flex flex-wrap items-center justify-between gap-4 tabular-nums text-xs">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY OBJECT, LABEL, OR BIN RECEPTACLE..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-ink/[0.03] border border-ink/[0.08] text-ink placeholder:text-subtle text-xs focus:outline-none focus:border-ink/30"
            />
          </div>
          <button
            type="submit"
            className="cred-button-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
          >
            Search
          </button>
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-paper-2 border border-ink/[0.08] text-ink-soft text-xs focus:outline-none focus:border-ink/30 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'ALL CATEGORIES' : cat.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Recyclability Filter */}
          <select
            value={recyclableFilter}
            onChange={(e) => {
              setRecyclableFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-paper-2 border border-ink/[0.08] text-ink-soft text-xs focus:outline-none focus:border-ink/30 cursor-pointer"
          >
            <option value="all">RECYCLABLE: ALL</option>
            <option value="yes">RECYCLABLE ONLY</option>
            <option value="no">NON-RECYCLABLE ONLY</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="cred-button-secondary px-3 py-2 text-[11px] tabular-nums flex items-center gap-1.5"
            title="Toggle chronological order"
          >
            <ArrowUpDown className="w-3 h-3 text-muted" />
            <span>{sortOrder === 'desc' ? 'NEWEST' : 'OLDEST'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="cred-button-secondary px-3 py-2 text-[11px] tabular-nums font-bold flex items-center gap-1.5 text-emerald-700"
            title="Export CSV spreadsheet"
          >
            <Download className="w-3 h-3 text-emerald-700" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-ink/[0.03] border border-ink/[0.08] text-muted hover:text-ink"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Ledger */}
      <div className="cred-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-soft">
            <thead className="bg-paper-2 border-b border-ink/[0.08] text-[10px] tabular-nums font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3.5 px-4">PREVIEW</th>
                <th className="py-3.5 px-4">TIMESTAMP</th>
                <th className="py-3.5 px-4">PRIMARY STREAM</th>
                <th className="py-3.5 px-4">OBJECTS</th>
                <th className="py-3.5 px-4">CONFIDENCE</th>
                <th className="py-3.5 px-4">SOURCE</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.04] tabular-nums">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    QUERYING CLASSIFICATION LEDGER...
                  </td>
                </tr>
              ) : historyData && historyData.items.length > 0 ? (
                historyData.items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-ink/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-11 h-11 rounded-lg bg-paper-2 border border-ink/[0.08] overflow-hidden flex items-center justify-center">
                        {item.annotated_image_url || item.original_image_url ? (
                          <img
                            src={item.annotated_image_url || item.original_image_url}
                            alt=""
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Eye className="w-4 h-4 text-subtle" />
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-muted text-[11px]">
                      {new Date(item.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Primary Category Badge */}
                    <td className="py-3 px-4 font-sans font-bold text-ink">
                      <span className="px-2.5 py-0.5 rounded-full bg-ink/[0.04] border border-ink/[0.08] text-xs">
                        {item.primary_category}
                      </span>
                    </td>

                    {/* Objects Detected */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-ink">
                        {item.total_objects} item{item.total_objects > 1 ? 's' : ''}
                      </span>
                      {item.objects.length > 0 && (
                        <p className="text-[10px] text-muted font-sans truncate max-w-[160px]">
                          {item.objects.map((o) => o.label).join(', ')}
                        </p>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700">
                          {Math.round(item.average_confidence * 100)}%
                        </span>
                        <div className="w-12 h-1 bg-ink/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.round(item.average_confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-ink/[0.03] text-muted border border-ink/[0.06]">
                        {item.source}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-ink/[0.06] transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg text-muted hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    NO CLASSIFICATION RECORDS FOUND MATCHING ACTIVE FILTERS.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {historyData && historyData.total > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-ink/[0.08] text-xs tabular-nums text-muted">
            <div>
              SHOWING <span className="font-bold text-ink">{(page - 1) * limit + 1}</span> TO{' '}
              <span className="font-bold text-ink">
                {Math.min(page * limit, historyData.total)}
              </span>{' '}
              OF <span className="font-bold text-ink">{historyData.total}</span> SCANS
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="cred-button-secondary px-3 py-1 text-xs disabled:opacity-30"
              >
                PREV
              </button>
              <span className="px-2 text-ink font-bold">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="cred-button-secondary px-3 py-1 text-xs disabled:opacity-30"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal Inspection View */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto cred-card p-6 sm:p-8 flex flex-col gap-6 text-left border border-ink/[0.15]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ink/[0.08]">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-ink tracking-tight">Audit Diagnostic Record</h3>
                  <span className="text-xs tabular-nums px-3 py-1 rounded-full cred-badge-emerald font-bold">
                    {selectedItem.primary_category}
                  </span>
                </div>
                <p className="text-xs text-muted tabular-nums mt-0.5">
                  ID: {selectedItem.id} • {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full bg-ink/[0.04] text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bounding Box Visualizer */}
            <div className="w-full">
              <BoundingBoxOverlay
                originalImageUrl={selectedItem.original_image_url}
                annotatedImageUrl={selectedItem.annotated_image_url}
                detections={selectedItem.objects}
              />
            </div>

            {/* Detected Objects Cards */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs tabular-nums uppercase tracking-widest text-muted">
                SEGMENTED WASTE OBJECTS ({selectedItem.objects.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedItem.objects.map((obj) => (
                  <DetectionCard key={obj.object_id} detection={obj} />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
