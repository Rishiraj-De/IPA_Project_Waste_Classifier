'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RecyclableDonutChartProps {
  recyclableCount: number;
  nonRecyclableCount: number;
}

export const RecyclableDonutChart: React.FC<RecyclableDonutChartProps> = ({
  recyclableCount,
  nonRecyclableCount,
}) => {
  const data = [
    { name: 'Recyclable / Compostable', value: recyclableCount, color: '#7eaa2b' },
    { name: 'Non-Recyclable / Landfill', value: nonRecyclableCount, color: '#a39bab' },
  ];

  const total = recyclableCount + nonRecyclableCount;
  const pctRecyclable = total > 0 ? Math.round((recyclableCount / total) * 100) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="p-3 rounded-2xl bg-surface border border-ink/[0.08] shadow-lg text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.payload.color }}
            />
            <span className="font-bold text-ink">{item.name}</span>
          </div>
          <p className="text-ink-soft">
            Count: <strong className="text-ink">{item.value} items</strong> ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="stroke-surface" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-ink-soft font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
        <span className="text-2xl font-semibold text-ink">{pctRecyclable}%</span>
        <span className="text-[10px] uppercase font-semibold text-muted">Recyclable</span>
      </div>
    </div>
  );
};
