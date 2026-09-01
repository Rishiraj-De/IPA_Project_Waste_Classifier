import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  Radio
} from 'lucide-react';
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

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-300 ${
        isHovered
          ? 'bg-[#141414] border-white/30 shadow-2xl scale-[1.01]'
          : 'bg-[#0E0E0E] border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Card Header: Object Name & Category Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-black text-white tracking-tight">{label}</h4>
            <span
              className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${disposal_info.bin_color_hex}15`,
                color: disposal_info.bin_color_hex,
                borderColor: `${disposal_info.bin_color_hex}40`,
              }}
            >
              {category}
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#8C8C87] mt-0.5">
            NODE #{detection.object_id} • LOCALIZED
          </p>
        </div>

        {/* Confidence Gauge */}
        <div className="flex flex-col items-end font-mono">
          <div className="flex items-center gap-1 text-xs font-bold text-white">
            <span>{confPct}%</span>
            <span className="text-[9px] font-normal text-[#525252]">CONF</span>
          </div>
          <div className="w-16 h-1 bg-white/[0.08] rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${
                confPct >= 80 ? 'bg-emerald-400' : confPct >= 60 ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${confPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recyclability & Recommended Bin Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3.5 font-mono text-xs">
        {/* Recyclability Badge */}
        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl border ${
            disposal_info.recyclable
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300'
              : disposal_info.hazard_level === 'High'
              ? 'bg-rose-500/[0.06] border-rose-500/20 text-rose-300'
              : 'bg-white/[0.02] border-white/[0.06] text-[#CCCCCC]'
          }`}
        >
          {disposal_info.recyclable ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : disposal_info.hazard_level === 'High' ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0 text-[#8C8C87]" />
          )}
          <div>
            <span className="text-[9px] uppercase tracking-wider opacity-60 block">
              STATUS
            </span>
            <span className="text-xs font-bold">
              {disposal_info.recyclable ? 'RECYCLABLE' : 'NON-RECYCLABLE'}
            </span>
          </div>
        </div>

        {/* Target Bin */}
        <div
          className="flex items-center gap-2.5 p-3 rounded-xl border"
          style={{
            backgroundColor: `${disposal_info.bin_color_hex}10`,
            borderColor: `${disposal_info.bin_color_hex}30`,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: disposal_info.bin_color_hex }}
          />
          <div className="truncate">
            <span className="text-[9px] uppercase tracking-wider text-[#8C8C87] block">
              TARGET RECEPTACLE
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {disposal_info.recommended_bin}
            </span>
          </div>
        </div>
      </div>

      {/* Disposal Action Instructions */}
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>Handling Directive:</span>
        </div>
        <p className="text-[#8C8C87] pl-5 leading-relaxed font-normal">{disposal_info.disposal_method}</p>

        {disposal_info.handling_instructions.length > 0 && (
          <div className="mt-1 pl-5 space-y-1">
            {disposal_info.handling_instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[#8C8C87]">
                <span className="text-[10px] text-emerald-400 font-mono font-bold">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHY Section (Model Diagnostic Explainability) */}
      <div className="mt-3 p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.05] text-xs text-[#8C8C87]">
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WHY THIS MATTERS:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#CCCCCC] font-normal">{explanation}</p>
      </div>

      {/* Eco Tip */}
      {disposal_info.eco_tip && (
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-emerald-400 font-mono px-2">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{disposal_info.eco_tip}</span>
        </div>
      )}
    </div>
  );
};
