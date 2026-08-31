import React, { useState } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  HelpCircle, 
  FileText 
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { WebcamCapture } from '../components/WebcamCapture';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { DetectionCard } from '../components/DetectionCard';
import { apiService } from '../services/api';
import { PredictionResponse } from '../types';

export const DetectPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confidence Threshold Control
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.45);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(false);

  // Current Prediction Result
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<number | null>(null);

  const handleImageSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.predictImage(file, enhanceContrast, confidenceThreshold);
      setPrediction(res);
    } catch (err: any) {
      console.error('Prediction failed:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to classify waste image. Please verify format and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraScanCompleted = (res: PredictionResponse) => {
    setPrediction(res);
  };

  const resetDetection = () => {
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Waste Detection & Segregation Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Capture or upload waste to localize materials and generate disposal advice
          </p>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'upload'
                ? 'bg-eco-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Image Upload</span>
          </button>

          <button
            onClick={() => setActiveMode('camera')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'camera'
                ? 'bg-eco-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Webcam</span>
          </button>
        </div>
      </div>

      {/* Advanced Settings Drawer (Confidence slider, enhancements) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-eco-400" />
          <span className="font-semibold text-slate-300">Confidence Threshold:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.20"
              max="0.85"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-eco-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={enhanceContrast}
              onChange={(e) => setEnhanceContrast(e.target.checked)}
              className="rounded accent-eco-500 w-3.5 h-3.5"
            />
            <span>Auto Image Contrast Enhancement</span>
          </label>

          {prediction && (
            <button
              onClick={resetDetection}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Detection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Ingestion Area (Upload or Camera) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!prediction ? (
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
              {activeMode === 'upload' ? (
                <ImageUploader
                  onImageSelected={handleImageSelected}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <WebcamCapture
                  onScanCompleted={handleCameraScanCompleted}
                  confidenceThreshold={confidenceThreshold}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-eco-400" />
                  Visual Bounding Box Localization
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {prediction.inference_time_ms} ms
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
          )}
        </div>

        {/* Right Column: Structured Results & Disposal Recommendations */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {prediction ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              
              {/* Detection Summary Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Primary Classification
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {prediction.primary_category}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {prediction.total_objects} object{prediction.total_objects > 1 ? 's' : ''} detected
                    • {prediction.model_mode === 'custom_fine_tuned' ? 'Fine-Tuned YOLOv8' : 'Pretrained Semantic YOLOv8'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-eco-400">
                    {Math.round(prediction.average_confidence * 100)}%
                  </span>
                  <span className="text-[10px] block text-slate-400 font-semibold">avg confidence</span>
                </div>
              </div>

              {/* Low-confidence Warning Notification if applicable */}
              {prediction.is_low_confidence && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Uncertain Detection Warning</strong>
                    <span className="leading-relaxed">
                      {prediction.warning_message ||
                        'Visual confidence is below your configured threshold. Please ensure adequate lighting and center the waste object.'}
                    </span>
                  </div>
                </div>
              )}

              {/* List of Individual Detected Objects */}
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">
                    Individual Object Recommendations ({prediction.objects.length})
                  </h4>
                  <span className="text-xs text-slate-500">Hover item to highlight HUD</span>
                </div>

                {prediction.objects.map((obj) => (
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
            /* Empty State Placeholder when no scan performed yet */
            <div className="flex flex-col items-center justify-center p-10 rounded-3xl bg-slate-900/30 border border-slate-800/60 text-center text-slate-500 min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="text-base font-bold text-slate-300">Awaiting Waste Scan</h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                Upload an image or start the live camera on the left to inspect bounding boxes, 
                confidence scoring, and disposal bin recommendations.
              </p>

              <div className="flex flex-col gap-2 mt-6 w-full max-w-xs text-left text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-400" />
                  <span>Real-time Object Localization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-400" />
                  <span>Configurable Confidence Thresholds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-400" />
                  <span>Disposal Prep Instructions</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
