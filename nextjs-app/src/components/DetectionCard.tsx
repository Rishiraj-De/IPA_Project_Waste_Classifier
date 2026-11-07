'use client';
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import { DetectedObject } from '../types';

interface DetectionCardProps {
  detection: DetectedObject;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DetectionCard: React.FC<DetectionCardProps> = ({
  detection,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { label, category, confidence, disposal_info, explanation } = detection;
  const confPct = Math.round(confidence * 100);
  const binColor = disposal_info.bin_color_hex;
  const isHazard = !disposal_info.recyclable && disposal_info.hazard_level === 'High';

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative flex flex-col p-5 sm:p-6 rounded-3xl border bg-surface transition-colors duration-200 ${
        isHovered ? 'border-lavender' : 'border-ink/[0.09]'
      }`}
    >
      {/* Header: object name, category, confidence */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-semibold text-ink">{label}</h4>
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${binColor}1f`, color: binColor }}
            >
              {category}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">Object #{detection.object_id}</p>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-sm font-semibold text-ink">
            {confPct}% <span className="text-xs font-normal text-muted">confidence</span>
          </span>
          <div className="w-24 h-1.5 bg-ink/[0.08] rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full ${
                confPct >= 80 ? 'bg-emerald-500' : confPct >= 60 ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${confPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recyclability and bin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4 text-sm">
        <div
          className={`flex items-center gap-3 p-3.5 rounded-2xl ${
            disposal_info.recyclable
              ? 'bg-emerald-500/10 text-emerald-800'
              : isHazard
              ? 'bg-rose-500/10 text-rose-700'
              : 'bg-paper-2 text-ink-soft'
          }`}
        >
          {disposal_info.recyclable ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : isHazard ? (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 text-muted" />
          )}
          <div>
            <span className="text-[11px] opacity-75 block">Status</span>
            <span className="font-semibold">{disposal_info.recyclable ? 'Recyclable' : 'Not recyclable'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ backgroundColor: `${binColor}14` }}>
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: binColor }} />
          <div className="min-w-0">
            <span className="text-[11px] text-muted block">Put it in</span>
            <span className="font-semibold text-ink block truncate">{disposal_info.recommended_bin}</span>
          </div>
        </div>
      </div>

      {/* How to dispose */}
      <div className="p-4 rounded-2xl bg-paper-2 text-sm">
        <p className="kicker !text-sm mb-1.5">How to dispose</p>
        <p className="text-ink-soft leading-relaxed">{disposal_info.disposal_method}</p>

        {disposal_info.handling_instructions.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {disposal_info.handling_instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-ink-soft">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Why */}
      <div className="mt-3 px-1 text-sm">
        <p className="flex items-center gap-1.5 text-lavender-deep font-medium text-xs mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Why this call
        </p>
        <p className="text-muted leading-relaxed">{explanation}</p>
      </div>

      {disposal_info.eco_tip && !explanation.includes(disposal_info.eco_tip) && (
        <p className="mt-3 flex items-start gap-2 text-sm text-emerald-800 px-1">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{disposal_info.eco_tip}</span>
        </p>
      )}
    </article>
  );
};
