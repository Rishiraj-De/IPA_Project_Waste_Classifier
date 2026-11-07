'use client';
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
  colorHex = '#5F7B38',
  trend,
  trendPositive = true,
}) => {
  return (
    <div className="cred-card p-6 flex flex-col justify-between relative overflow-hidden group text-left">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[11px] tabular-nums font-bold uppercase tracking-wider text-muted">
            {title}
          </span>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-ink border border-ink/[0.1] shadow-inner group-hover:scale-105 transition-transform"
            style={{ backgroundColor: `${colorHex}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: colorHex }} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                trendPositive ? 'cred-badge-emerald' : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-muted mt-3 font-normal leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};
