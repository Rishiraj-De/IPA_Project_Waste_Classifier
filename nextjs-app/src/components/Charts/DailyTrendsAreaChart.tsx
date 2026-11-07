'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DailyTrendStat } from '../../types';

interface DailyTrendsAreaChartProps {
  data: DailyTrendStat[];
}

export const DailyTrendsAreaChart: React.FC<DailyTrendsAreaChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-xs">
        No daily trend data available yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-2xl bg-surface border border-ink/[0.08] shadow-lg text-xs space-y-1">
          <p className="font-bold text-ink border-b border-ink/[0.08] pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-muted flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-ink">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRecyclable" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7eaa2b" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#7eaa2b" stopOpacity={0.18} />
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8a7da6" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#8a7da6" stopOpacity={0.18} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#8a7da6" strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey="date" stroke="#857e90" fontSize={11} tickLine={false} />
          <YAxis stroke="#857e90" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-xs text-ink-soft font-medium">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="items_detected"
            name="Total Items Detected"
            stroke="#8a7da6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="recyclable"
            name="Recyclable Items"
            stroke="#7eaa2b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRecyclable)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
