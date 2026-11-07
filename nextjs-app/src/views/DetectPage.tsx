'use client';
import React, { useEffect, useState } from 'react';
import { Upload, Camera, Sliders, AlertTriangle, CheckCircle2, RefreshCw, ScanLine } from 'lucide-react';
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

  // Local preview of the uploaded file. The serverless fallback cannot always
  // persist uploads, so the result view shows the user's own photo instead of
  // depending on the returned URL.
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const handleImageSelected = async (file: File) => {
    sound.playScan();
    setIsLoading(true);
    setError(null);
    setLocalPreviewUrl(URL.createObjectURL(file));
    try {
      const res = await apiService.predictImage(file, enhanceContrast, confidenceThreshold);
      setPrediction(res);
      sound.playSuccess();
    } catch (err: unknown) {
      console.error('Prediction failed:', err);
      sound.playClick(300);
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(detail || 'Failed to classify waste image. Please verify format and try again.');
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
    setLocalPreviewUrl(null);
  };

  const currentDisplayPrediction = prediction || (activeMode === 'camera' ? livePrediction : null);

  const handleModeChange = (mode: 'upload' | 'camera') => {
    sound.playClick();
    setActiveMode(mode);
    setPrediction(null);
    setLivePrediction(null);
    setError(null);
    setLocalPreviewUrl(null);
  };

  const modeButton = (mode: 'upload' | 'camera') =>
    `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
      activeMode === mode ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
    }`;

  return (
    <div className="flex flex-col gap-8 pb-16 text-ink">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="kicker">Waste scanner</p>
          <h1 className="display text-4xl sm:text-[3.4rem] text-ink mt-2">Point. Scan. Sort.</h1>
          <p className="text-[15px] text-muted mt-3 max-w-xl leading-relaxed">
            Upload a photo or use your camera. Every object is outlined, classified and matched to the bin it belongs in.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-surface border border-ink/[0.1]" role="tablist" aria-label="Input mode">
          <button role="tab" aria-selected={activeMode === 'upload'} onClick={() => handleModeChange('upload')} className={modeButton('upload')}>
            <Upload className="w-4 h-4" />
            <span>Upload image</span>
          </button>
          <button role="tab" aria-selected={activeMode === 'camera'} onClick={() => handleModeChange('camera')} className={modeButton('camera')}>
            <Camera className="w-4 h-4" />
            <span>Live camera</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 rounded-3xl bg-paper-2 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="confidence-threshold" className="flex items-center gap-2 text-ink-soft">
            <Sliders className="w-4 h-4 text-lavender" />
            <span>Confidence threshold</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              id="confidence-threshold"
              type="range"
              min="0.20"
              max="0.85"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-32 sm:w-40 cursor-pointer"
            />
            <span className="font-semibold text-ink bg-surface px-3 py-0.5 rounded-full border border-ink/[0.1] tabular-nums">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={enhanceContrast}
              onChange={(e) => setEnhanceContrast(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span>Enhance contrast</span>
          </label>

          {prediction && (
            <button onClick={resetDetection} className="cred-button-secondary px-4 py-1.5 text-xs flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: input or annotated image */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {activeMode === 'upload' && prediction ? (
            <div className="cred-card p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Detected objects</h2>
                <span className="text-xs text-muted">{prediction.inference_time_ms} ms</span>
              </div>

              <BoundingBoxOverlay
                originalImageUrl={localPreviewUrl || prediction.original_image_url}
                annotatedImageUrl={prediction.annotated_image_url}
                detections={prediction.objects}
                onHoverObject={setHoveredObjectId}
                hoveredObjectId={hoveredObjectId}
              />
            </div>
          ) : (
            <div className="cred-card p-5 sm:p-6">
              {activeMode === 'upload' ? (
                <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} error={error} />
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

        {/* Right: result */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {currentDisplayPrediction && currentDisplayPrediction.objects && currentDisplayPrediction.objects.length > 0 ? (
            <div className="flex flex-col gap-5" aria-live="polite">
              {/* Summary */}
              <div className="rounded-3xl bg-blush p-6 sm:p-7 flex flex-col gap-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lavender-deep font-medium">
                    {activeMode === 'camera' && !prediction ? 'Live result' : 'Main result'}
                  </span>
                  <span className="text-ink-soft">
                    {currentDisplayPrediction.model_mode === 'custom_fine_tuned' ? 'YOLOv8 custom' : 'YOLOv8'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-ink-soft">We think this is</p>
                  <h2 className="display text-4xl sm:text-5xl text-ink mt-1">{currentDisplayPrediction.primary_category}</h2>
                </div>

                <dl className="grid grid-cols-3 gap-3 pt-4 border-t border-ink/[0.1]">
                  <div>
                    <dt className="text-[11px] text-ink-soft">Confidence</dt>
                    <dd className="text-2xl font-medium text-ink mt-0.5">
                      {Math.round(currentDisplayPrediction.average_confidence * 100)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-soft">Objects</dt>
                    <dd className="text-2xl font-medium text-ink mt-0.5">{currentDisplayPrediction.total_objects}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-soft">Status</dt>
                    <dd className="text-sm font-semibold text-moss flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Sorted
                    </dd>
                  </div>
                </dl>
              </div>

              {currentDisplayPrediction.is_low_confidence && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 text-amber-800 text-sm leading-relaxed" role="alert">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Low confidence</strong>
                    <span>
                      {currentDisplayPrediction.warning_message ||
                        'The image is not very clear. Centre the object, improve the lighting and try again.'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="text-xs text-muted px-1">
                  What to do with each item ({currentDisplayPrediction.objects.length})
                </h3>
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
            /* Waiting state */
            <div className="cred-card p-8 sm:p-10 flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mb-5">
                <ScanLine className="w-7 h-7 text-lavender-deep" />
              </div>
              <h2 className="text-lg font-semibold text-ink">Ready when you are</h2>
              <p className="text-sm text-muted mt-1.5 max-w-xs leading-relaxed">
                Add a photo or turn on your camera. Results and bin advice will appear here.
              </p>

              <ul className="flex flex-col gap-2.5 mt-8 w-full max-w-xs text-left text-sm text-ink-soft bg-paper-2 p-5 rounded-2xl">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
                  <span>Boxes around every detected object</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
                  <span>Category and confidence for each one</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
                  <span>The exact bin and how to prepare it</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
