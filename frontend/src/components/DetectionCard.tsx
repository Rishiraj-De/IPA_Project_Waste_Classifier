import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Leaf 
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
          ? 'bg-slate-900 border-slate-600 shadow-2xl scale-[1.01]'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700/80 shadow-lg'
      }`}
    >
      {/* Card Header: Object Name & Category Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">{label}</h4>
            <span
              className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: `${disposal_info.bin_color_hex}15`,
                color: disposal_info.bin_color_hex,
                borderColor: `${disposal_info.bin_color_hex}40`,
              }}
            >
              {category}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Detection #{detection.object_id} • Object Localization Active
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-sm font-extrabold text-slate-200">
            <span>{confPct}%</span>
            <span className="text-[10px] font-normal text-slate-400">conf</span>
          </div>
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${
                confPct >= 80 ? 'bg-eco-500' : confPct >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${confPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recyclability & Recommended Bin Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3.5">
        {/* Recyclability Badge */}
        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl border ${
            disposal_info.recyclable
              ? 'bg-eco-950/40 border-eco-500/30 text-eco-300'
              : disposal_info.hazard_level === 'High'
              ? 'bg-red-950/40 border-red-500/30 text-red-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-300'
          }`}
        >
          {disposal_info.recyclable ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-eco-400" />
          ) : disposal_info.hazard_level === 'High' ? (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0 text-slate-400" />
          )}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
              Recyclability
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
            borderColor: `${disposal_info.bin_color_hex}35`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
            style={{ backgroundColor: disposal_info.bin_color_hex }}
          >
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Target Bin ({disposal_info.bin_badge})
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {disposal_info.recommended_bin}
            </span>
          </div>
        </div>
      </div>

      {/* Disposal Action Instructions */}
      <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <ArrowRight className="w-3.5 h-3.5 text-eco-400" />
          <span>Recommended Disposal Method:</span>
        </div>
        <p className="text-slate-400 pl-5 leading-relaxed">{disposal_info.disposal_method}</p>

        {disposal_info.handling_instructions.length > 0 && (
          <div className="mt-1 pl-5 space-y-1">
            {disposal_info.handling_instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-slate-400">
                <span className="text-[10px] text-eco-400 font-mono font-bold">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Explainability Section */}
      <div className="mt-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Model Vision Explainability</span>
        </div>
        <p className="text-[11px] leading-relaxed italic text-slate-400">{explanation}</p>
      </div>

      {/* Eco Tip */}
      {disposal_info.eco_tip && (
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-eco-400/90 font-medium px-2">
          <Leaf className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{disposal_info.eco_tip}</span>
        </div>
      )}
    </div>
  );
};
