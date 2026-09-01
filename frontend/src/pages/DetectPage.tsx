import React, { useState } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { WebcamCapture } from '../components/WebcamCapture';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { DetectionCard } from '../components/DetectionCard';
import { apiService } from '../services/api';
import { PredictionResponse } from '../types';

import { sound } from '../utils/audio';

export const DetectPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confidence Threshold Control
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.45);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(false);

  // Current Prediction Result
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [livePrediction, setLivePrediction] = useState<PredictionResponse | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<number | null>(null);

  const handleImageSelected = async (file: File) => {
    sound.playScan();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.predictImage(file, enhanceContrast, confidenceThreshold);
      setPrediction(res);
      sound.playSuccess();
    } catch (err: any) {
      console.error('Prediction failed:', err);
      sound.playClick(300);
      setError(
        err.response?.data?.detail ||
          'Failed to classify waste image. Please verify format and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraScanCompleted = (res: PredictionResponse) => {
    sound.playSuccess();
    setPrediction(res);
  };

  const handleLiveDetection = (res: PredictionResponse | null) => {
    setLivePrediction(res);
  };

  const resetDetection = () => {
    sound.playClick();
    setPrediction(null);
    setLivePrediction(null);
    setError(null);
  };

  const currentDisplayPrediction = prediction || (activeMode === 'camera' ? livePrediction : null);

  const handleModeChange = (mode: 'upload' | 'camera') => {
    sound.playClick();
    setActiveMode(mode);
    setPrediction(null);
    setLivePrediction(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 text-[#F5F5F0]">
      
      {/* Top Header: "Point. Scan. Sort." */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-white/[0.08] text-left">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            [ AI DIAGNOSTIC INTERFACE ]
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Point. Scan. Sort.
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8C87] mt-1 max-w-xl font-normal">
            Automated visual spectrometry localizing physical matter and resolving municipal routing instructions in under 40ms.
          </p>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <button
            onClick={() => handleModeChange('upload')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-tight transition-all duration-200 ${
              activeMode === 'upload'
                ? 'bg-white text-black shadow-md'
                : 'text-[#8C8C87] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => handleModeChange('camera')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-tight transition-all duration-200 ${
              activeMode === 'camera'
                ? 'bg-white text-black shadow-md'
                : 'text-[#8C8C87] hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
        </div>
      </div>

      {/* Advanced Telemetry & Precision Drawer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 text-[#8C8C87]">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONFIDENCE THRESHOLD:</span>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.20"
              max="0.85"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-emerald-400 cursor-pointer"
            />
            <span className="font-bold text-white bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/[0.1]">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[#8C8C87] hover:text-white cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={enhanceContrast}
              onChange={(e) => setEnhanceContrast(e.target.checked)}
              className="rounded accent-emerald-400 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Enhance Contrast Filter</span>
          </label>

          {prediction && (
            <button
              onClick={resetDetection}
              className="cred-button-secondary px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 uppercase"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Ingestion Area (Upload or Camera) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {activeMode === 'upload' && prediction ? (
            <div className="cred-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-left">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Visual Bounding Box Localization
                </h3>
                <span className="text-xs text-[#8C8C87] font-mono">
                  LATENCY: {prediction.inference_time_ms} ms
                </span>
              </div>

              {/* Bounding Box HUD Visualizer */}
              <BoundingBoxOverlay
                originalImageUrl={prediction.original_image_url}
                annotatedImageUrl={prediction.annotated_image_url}
                detections={prediction.objects}
                onHoverObject={setHoveredObjectId}
                hoveredObjectId={hoveredObjectId}
              />
            </div>
          ) : (
            <div className="cred-card p-6">
              {activeMode === 'upload' ? (
                <ImageUploader
                  onImageSelected={handleImageSelected}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <WebcamCapture
                  onScanCompleted={handleCameraScanCompleted}
                  onLiveDetection={handleLiveDetection}
                  confidenceThreshold={confidenceThreshold}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Column: High-Contrast Diagnostic Readout */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {currentDisplayPrediction && currentDisplayPrediction.objects && currentDisplayPrediction.objects.length > 0 ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              
              {/* Primary Diagnostic Banner */}
              <div className="cred-card p-6 border border-white/[0.12] flex flex-col gap-4 text-left relative overflow-hidden">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                    {activeMode === 'camera' && !prediction ? 'LIVE STREAM INFERENCE' : 'PRIMARY DIAGNOSTIC'}
                  </span>
                  <span className="text-xs font-mono text-[#8C8C87]">
                    {currentDisplayPrediction.model_mode === 'custom_fine_tuned' ? 'YOLOv8 CUSTOM' : 'YOLOv8 BACKBONE'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-mono text-[#8C8C87] uppercase block mb-1">
                    WASTE DETECTED
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentDisplayPrediction.primary_category}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] font-mono">
                  <div>
                    <span className="text-[10px] text-[#525252] uppercase block">CONFIDENCE</span>
                    <span className="text-xl font-black text-emerald-400">
                      {Math.round(currentDisplayPrediction.average_confidence * 100)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#525252] uppercase block">ITEMS SEGREGATED</span>
                    <span className="text-xl font-black text-white">
                      {currentDisplayPrediction.total_objects}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#525252] uppercase block">RECOVERY STATUS</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ROUTED
                    </span>
                  </div>
                </div>

              </div>

              {/* Low-confidence Warning Notification */}
              {currentDisplayPrediction.is_low_confidence && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-amber-200 text-xs font-mono leading-relaxed text-left">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300">LOW CONFIDENCE DETECTION</strong>
                    <span>
                      {currentDisplayPrediction.warning_message ||
                        'Visual clarity is below configured threshold. Center the object and adjust ambient lighting.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Individual Detected Object Cards */}
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#8C8C87]">
                    RESOLVED OBJECTS ({currentDisplayPrediction.objects.length})
                  </h4>
                  <span className="text-[10px] font-mono text-[#525252]">SORT INSTRUCTIONS</span>
                </div>

                {currentDisplayPrediction.objects.map((obj) => (
                  <DetectionCard
                    key={obj.object_id}
                    detection={obj}
                    isHovered={hoveredObjectId === obj.object_id}
                    onMouseEnter={() => setHoveredObjectId(obj.object_id)}
                    onMouseLeave={() => setHoveredObjectId(null)}
                  />
                ))}
              </div>

            </div>
          ) : (
            /* Standby State */
            <div className="cred-card p-10 flex flex-col items-center justify-center text-center text-[#8C8C87] min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4 text-white">
                <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">System Ready For Scan</h4>
              <p className="text-xs text-[#8C8C87] mt-1.5 max-w-xs leading-relaxed">
                Upload a photograph or enable your webcam on the left to initiate real-time visual spectrometry.
              </p>

              <div className="flex flex-col gap-2.5 mt-8 w-full max-w-xs text-left text-xs font-mono text-[#CCCCCC] bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated Bounding Box Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sub-40ms Inference Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exact Municipal Disposal Directives</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
