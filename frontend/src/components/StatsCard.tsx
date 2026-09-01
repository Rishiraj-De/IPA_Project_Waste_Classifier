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
  colorHex = '#10B981',
  trend,
  trendPositive = true,
}) => {
  return (
    <div className="cred-card p-6 flex flex-col justify-between relative overflow-hidden group text-left">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C8C87]">
            {title}
          </span>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white border border-white/[0.1] shadow-inner group-hover:scale-105 transition-transform"
            style={{ backgroundColor: `${colorHex}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: colorHex }} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                trendPositive ? 'cred-badge-emerald' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-[#8C8C87] mt-3 font-normal leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};
