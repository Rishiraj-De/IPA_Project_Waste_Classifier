'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ConfidenceBucket } from '../../types';

interface ConfidenceHistChartProps {
  data: ConfidenceBucket[];
}

export const ConfidenceHistChart: React.FC<ConfidenceHistChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-xs">
        No confidence distribution data available yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-2xl bg-surface border border-ink/[0.08] shadow-lg text-xs space-y-1">
          <p className="font-bold text-ink">Confidence Range: {label}</p>
          <p className="text-emerald-700 font-semibold">
            Detections: <strong className="text-ink">{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8a7da6" strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey="range" stroke="#857e90" fontSize={11} tickLine={false} />
          <YAxis stroke="#857e90" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => {
              // Color gradient: higher confidence is deeper green
              const colors = ['#d9a441', '#c1d47a', '#9cc53f', '#7eaa2b', '#5f8c1e'];
              const color = colors[index % colors.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
