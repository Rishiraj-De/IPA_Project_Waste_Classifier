import React, { useState } from 'react';
import { Layers, Eye, Tag, Percent, Sparkles, Sliders } from 'lucide-react';
import { DetectedObject } from '../types';

interface BoundingBoxOverlayProps {
  originalImageUrl?: string;
  annotatedImageUrl?: string;
  detections: DetectedObject[];
  onHoverObject?: (objectId: number | null) => void;
  hoveredObjectId?: number | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Plastic: '#2563eb',
  Paper: '#0284c7',
  Cardboard: '#d97706',
  Glass: '#0d9488',
  Metal: '#64748b',
  Organic: '#16a34a',
  'E-Waste': '#ea580c',
  'Hazardous Waste': '#dc2626',
  'Other/Unknown': '#475569',
};

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  originalImageUrl,
  annotatedImageUrl,
  detections,
  onHoverObject,
  hoveredObjectId,
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'annotated' | 'original'>('interactive');
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [enhanceContrast, setEnhanceContrast] = useState(false);

  const displayImage = viewMode === 'annotated' && annotatedImageUrl 
    ? annotatedImageUrl 
    : originalImageUrl;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Visual Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        
        {/* View Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'interactive' 
                ? 'bg-eco-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive HUD
          </button>
          <button
            onClick={() => setViewMode('annotated')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'annotated' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Server Rendered
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'original' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original Clean
          </button>
        </div>

        {/* Feature Toggles */}
        {viewMode === 'interactive' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                showBoxes
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle bounding box borders"
            >
              <Layers className="w-3.5 h-3.5" />
              Boxes
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                showLabels
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle object classification labels"
            >
              <Tag className="w-3.5 h-3.5" />
              Labels
            </button>

            <button
              onClick={() => setShowConfidence(!showConfidence)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                showConfidence
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle confidence score percentage"
            >
              <Percent className="w-3.5 h-3.5" />
              Conf %
            </button>

            <button
              onClick={() => setEnhanceContrast(!enhanceContrast)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                enhanceContrast
                  ? 'bg-eco-950/80 border-eco-500/40 text-eco-300'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle contrast enhancement filter"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Enhance
            </button>
          </div>
        )}

      </div>

      {/* Main Image Viewport with Detection Overlay */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[360px] max-h-[580px] shadow-2xl p-2">
        {displayImage ? (
          <div className="relative inline-flex items-center justify-center max-w-full max-h-[560px]">
            <img
              src={displayImage}
              alt="Analyzed Waste Detection"
              className={`max-h-[560px] max-w-full w-auto h-auto object-contain block mx-auto rounded-xl select-none transition-all duration-300 ${
                enhanceContrast ? 'contrast-125 brightness-105' : ''
              }`}
            />

            {/* Interactive Overlay */}
            {viewMode === 'interactive' && showBoxes && (
              <div className="absolute inset-0 pointer-events-none">
                {detections.map((det) => {
                  const isHovered = hoveredObjectId === det.object_id;
                  const color = CATEGORY_COLORS[det.category] || '#2563eb';
                  const bbox = det.bounding_box;

                  // Normalized 0..1 to percentage 0..100
                  const leftPct = Math.max(0, Math.min(100, bbox.x1 * 100));
                  const topPct = Math.max(0, Math.min(100, bbox.y1 * 100));
                  const widthPct = Math.max(2, Math.min(100 - leftPct, (bbox.x2 - bbox.x1) * 100));
                  const heightPct = Math.max(2, Math.min(100 - topPct, (bbox.y2 - bbox.y1) * 100));
                  const isNearTop = topPct < 7;

                  return (
                    <div
                      key={det.object_id}
                      className="absolute pointer-events-auto cursor-pointer transition-all duration-150"
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        border: `${isHovered ? '3px' : '2px'} solid ${color}`,
                        backgroundColor: isHovered ? `${color}28` : `${color}12`,
                        boxShadow: isHovered ? `0 0 12px ${color}` : `0 0 4px ${color}30`,
                        borderRadius: '6px',
                      }}
                      onMouseEnter={() => onHoverObject?.(det.object_id)}
                      onMouseLeave={() => onHoverObject?.(null)}
                    >
                      {/* Top Label Badge */}
                      {(showLabels || showConfidence) && (
                        <div
                          className={`absolute flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-lg pointer-events-none whitespace-nowrap z-20 transition-transform ${
                            isNearTop ? 'top-1 left-1' : '-top-6 left-0'
                          }`}
                          style={{
                            backgroundColor: color,
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: isNearTop ? 'top left' : 'bottom left',
                          }}
                        >
                          {showLabels && <span>{det.label}</span>}
                          {showLabels && showConfidence && <span className="opacity-70">•</span>}
                          {showConfidence && (
                            <span>{Math.round(det.confidence * 100)}%</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500">
            <Eye className="w-12 h-12 mb-2 stroke-1 text-slate-600" />
            <p className="text-sm font-medium">No Image Uploaded Yet</p>
            <p className="text-xs text-slate-600">Upload or capture waste to display bounding boxes</p>
          </div>
        )}
      </div>

      {/* Detection Count Legend Footer */}
      {detections.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{detections.length}</span>
            <span>waste object{detections.length > 1 ? 's' : ''} localized</span>
          </div>
          <div className="flex items-center gap-3">
            {Array.from(new Set(detections.map((d) => d.category))).map((cat) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748b' }}
                />
                <span className="text-slate-300 font-medium">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
