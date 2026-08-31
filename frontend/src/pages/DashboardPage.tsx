import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Recycle, 
  Trash2, 
  TrendingUp, 
  Percent, 
  PieChart as PieChartIcon, 
  Activity, 
  RefreshCw, 
  Layers 
} from 'lucide-react';
import { apiService } from '../services/api';
import { StatisticsResponse } from '../types';
import { StatsCard } from '../components/StatsCard';
import { CategoryPieChart } from '../components/Charts/CategoryPieChart';
import { DailyTrendsAreaChart } from '../components/Charts/DailyTrendsAreaChart';
import { RecyclableDonutChart } from '../components/Charts/RecyclableDonutChart';
import { ConfidenceHistChart } from '../components/Charts/ConfidenceHistChart';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Waste Segregation Analytics Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time metric monitoring, material diversion ratios, and confidence distribution
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top Level Metric KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Scans Executed"
            value={stats.total_scans}
            subtitle={`${stats.total_items_detected} total items detected`}
            icon={Activity}
            colorHex="#3b82f6"
            trend="+18% vs last week"
          />

          <StatsCard
            title="Recyclable Diversion"
            value={`${stats.recyclable_percentage}%`}
            subtitle={`${stats.recyclable_count} diverted from landfill`}
            icon={Recycle}
            colorHex="#22c55e"
            trend="High diversion rate"
          />

          <StatsCard
            title="Top Waste Category"
            value={stats.most_common_category}
            subtitle="Most frequently classified item"
            icon={Layers}
            colorHex="#f59e0b"
          />

          <StatsCard
            title="Model Avg Confidence"
            value={`${Math.round(stats.average_overall_confidence * 100)}%`}
            subtitle="Benchmark evaluated: 87.1% mAP"
            icon={Percent}
            colorHex="#06b6d4"
            trend="High precision"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      {stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Category Distribution Pie Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-eco-400" />
                  Waste Category Distribution
                </h3>
                <p className="text-xs text-slate-400">Share of total items across the 9 categories</p>
              </div>
            </div>
            <CategoryPieChart data={stats.category_distribution} />
          </div>

          {/* Chart 2: Recyclable vs Non-Recyclable Donut Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-eco-400" />
                  Recyclable vs Landfill Ratio
                </h3>
                <p className="text-xs text-slate-400">Purity of recyclable vs residual municipal stream</p>
              </div>
            </div>
            <RecyclableDonutChart
              recyclableCount={stats.recyclable_count}
              nonRecyclableCount={stats.non_recyclable_count}
            />
          </div>

          {/* Chart 3: Daily Trend Area Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Daily Classification Trend
                </h3>
                <p className="text-xs text-slate-400">Weekly volume of scans and diverted recyclables</p>
              </div>
            </div>
            <DailyTrendsAreaChart data={stats.daily_trends} />
          </div>

          {/* Chart 4: Confidence Score Histogram */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Detection Confidence Distribution
                </h3>
                <p className="text-xs text-slate-400">Histogram of model confidence score buckets</p>
              </div>
            </div>
            <ConfidenceHistChart data={stats.confidence_histogram} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-eco-400 mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading Dashboard Metrics...</p>
        </div>
      )}
    </div>
  );
};
