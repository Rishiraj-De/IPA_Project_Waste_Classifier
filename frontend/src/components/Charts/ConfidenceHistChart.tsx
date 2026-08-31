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
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs">
        No confidence distribution data available yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl text-xs space-y-1">
          <p className="font-bold text-white">Confidence Range: {label}</p>
          <p className="text-eco-400 font-semibold">
            Detections: <strong className="text-white">{payload[0].value}</strong>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => {
              // Color gradient: higher confidence is deeper green
              const colors = ['#f59e0b', '#84cc16', '#22c55e', '#16a34a', '#059669'];
              const color = colors[index % colors.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
