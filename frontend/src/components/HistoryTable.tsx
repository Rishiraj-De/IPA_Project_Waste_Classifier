import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  Calendar, 
  Download, 
  RefreshCw 
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
    if (!window.confirm('Are you sure you want to delete this scan record and its images?')) {
      return;
    }
    setDeletingId(id);
    try {
      await apiService.deleteHistoryRecord(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      fetchHistory();
    } catch (err) {
      alert('Failed to delete history record.');
    } finally {
      setDeletingId(null);
    }
  };

  // Export Table Data to CSV
  const exportToCSV = () => {
    if (!historyData || historyData.items.length === 0) return;
    const headers = ['Scan ID', 'Timestamp', 'Primary Category', 'Total Objects', 'Avg Confidence', 'Source'];
    const rows = historyData.items.map((i) => [
      i.id,
      new Date(i.created_at).toLocaleString(),
      i.primary_category,
      i.total_objects,
      `${Math.round(i.average_confidence * 100)}%`,
      i.source,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `waste_classification_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = historyData ? Math.ceil(historyData.total / limit) : 1;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Search & Filter Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by object, category, or bin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-eco-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
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
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-eco-500 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
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
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-eco-500 cursor-pointer"
          >
            <option value="all">Recyclable: All</option>
            <option value="yes">Recyclable Only</option>
            <option value="no">Non-Recyclable Only</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle chronological sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            title="Export to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-eco-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Preview</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Primary Category</th>
                <th className="py-3.5 px-4">Objects Detected</th>
                <th className="py-3.5 px-4">Avg Confidence</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-eco-400" />
                    Loading classification records...
                  </td>
                </tr>
              ) : historyData && historyData.items.length > 0 ? (
                historyData.items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                        {item.annotated_image_url || item.original_image_url ? (
                          <img
                            src={item.annotated_image_url || item.original_image_url}
                            alt="Scan Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Eye className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(item.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Primary Category Badge */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-white px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                        {item.primary_category}
                      </span>
                    </td>

                    {/* Objects Detected */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-200">
                        {item.total_objects} item{item.total_objects > 1 ? 's' : ''}
                      </span>
                      {item.objects.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {item.objects.map((o) => o.label).join(', ')}
                        </p>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {Math.round(item.average_confidence * 100)}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-eco-500 rounded-full"
                            style={{ width: `${Math.round(item.average_confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                        {item.source}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No classification records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {historyData && historyData.total > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">
                {Math.min(page * limit, historyData.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-200">{historyData.total}</span> scans
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="px-2 text-slate-300 font-semibold">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal Inspection View */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">Classification Audit Record</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-eco-500/20 text-eco-400 font-semibold border border-eco-500/30">
                    {selectedItem.primary_category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedItem.id} •{' '}
                  {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
              <h4 className="text-sm font-bold text-slate-200">
                Segmented Waste Objects ({selectedItem.objects.length})
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
