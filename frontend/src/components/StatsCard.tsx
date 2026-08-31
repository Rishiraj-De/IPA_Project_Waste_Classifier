import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorHex?: string;
  trend?: string;
  trendPositive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorHex = '#22c55e',
  trend,
  trendPositive = true,
}) => {
  return (
    <div className="flex flex-col p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
      {/* Background ambient glow */}
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: colorHex }}
      />

      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
          style={{ backgroundColor: colorHex }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trendPositive ? 'bg-eco-500/10 text-eco-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
