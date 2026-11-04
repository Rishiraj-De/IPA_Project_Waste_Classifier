'use client';
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

// Preset sample waste images for immediate one-click testing
const DEMO_PRESETS = [
  {
    name: 'Plastic Bottle',
    category: 'Plastic',
    color: '#2563eb',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f1f5f9"/><rect x="160" y="60" width="80" height="40" rx="6" fill="%232563eb"/><rect x="180" y="40" width="40" height="20" rx="4" fill="%23ef4444"/><rect x="130" y="100" width="140" height="240" rx="30" fill="%233b82f6"/><line x1="145" y1="120" x2="145" y2="320" stroke="%2393c5fd" stroke-width="8"/><text x="200" y="230" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">PET 1</text></svg>'
  },
  {
    name: 'Aluminium Can',
    category: 'Metal',
    color: '#64748b',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f1f5f9"/><rect x="140" y="80" width="120" height="240" rx="14" fill="%2394a3b8"/><line x1="170" y1="90" x2="170" y2="310" stroke="white" stroke-width="12"/><ellipse cx="200" cy="80" rx="55" ry="12" fill="%23cbd5e1"/><text x="200" y="210" font-family="sans-serif" font-size="22" font-weight="bold" fill="%231e293b" text-anchor="middle">SODA</text></svg>'
  },
  {
    name: 'Banana Peel',
    category: 'Organic',
    color: '#16a34a',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f8fafc"/><path d="M120,280 Q200,340 280,240 Q220,180 180,120 Q150,180 120,280 Z" fill="%23eab308" stroke="%23ca8a04" stroke-width="4"/><circle cx="180" cy="120" r="10" fill="%23713f12"/><circle cx="210" cy="220" r="8" fill="%23713f12"/></svg>'
  },
  {
    name: 'Cardboard Carton',
    category: 'Cardboard',
    color: '#d97706',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f8fafc"/><rect x="110" y="110" width="180" height="180" rx="8" fill="%23b45309" stroke="%2378350f" stroke-width="5"/><rect x="110" y="190" width="180" height="20" fill="%23d97706"/><line x1="130" y1="140" x2="270" y2="140" stroke="%2392400e" stroke-dasharray="8 8" stroke-width="3"/></svg>'
  },
  {
    name: 'Mobile Phone E-Waste',
    category: 'E-Waste',
    color: '#ea580c',
    svgData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f8fafc"/><rect x="130" y="80" width="140" height="240" rx="20" fill="%231e293b" stroke="%230f172a" stroke-width="4"/><rect x="140" y="100" width="120" height="200" rx="10" fill="%230284c7"/><circle cx="200" cy="90" r="4" fill="%2364748b"/></svg>'
  }
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validExtensions.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, or WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }
    onImageSelected(file);
  };

  const loadPreset = async (preset: typeof DEMO_PRESETS[0]) => {
    sound.playScan();
    // Rasterize SVG into a real PNG blob using an offscreen canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], `${preset.name.toLowerCase().replace(/\s+/g, '_')}.png`, {
          type: 'image/png',
        });
        onImageSelected(file);
      }, 'image/png');
    };
    img.src = preset.svgData;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          sound.playClick();
          fileInputRef.current?.click();
        }}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-14 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center group ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/[0.04] scale-[1.01]'
            : 'border-white/[0.1] hover:border-white/30 bg-[#0A0A0A] hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-white/30 transition-all">
          <Upload className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
          Select photograph or drop file to analyze
        </h3>
        <p className="text-xs text-[#8C8C87] mt-1.5 max-w-sm font-normal">
          Accepts JPG, PNG, WEBP (up to 15MB). Automated YOLOv8 vision isolates bounds & routes to designated bin.
        </p>

        {/* Minimal Monospace Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 font-mono">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/[0.04] text-[#CCCCCC] border border-white/[0.08]">
            YOLOv8 VISION
          </span>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/[0.04] text-[#CCCCCC] border border-white/[0.08]">
            &lt; 40MS LATENCY
          </span>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20">
            ZERO RETENTION
          </span>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 rounded-2xl bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm font-bold text-white font-mono tracking-wider uppercase">Executing Neural Inference...</p>
            <p className="text-xs text-[#8C8C87] font-mono">Classifying material structure & municipal rules</p>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Test Presets */}
      <div className="flex flex-col gap-3 text-left">
        <div className="flex items-center justify-between font-mono">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C8C87] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            ONE-CLICK TEST ARTIFACTS
          </span>
          <span className="text-[10px] text-[#525252]">CLICK TO INFER</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onMouseEnter={() => sound.playHover()}
              onClick={() => loadPreset(preset)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/20 text-left transition-all duration-200 group"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                style={{ backgroundColor: preset.color }}
              />
              <div className="truncate">
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 truncate tracking-tight">
                  {preset.name}
                </p>
                <p className="text-[10px] font-mono text-[#8C8C87] uppercase">{preset.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
