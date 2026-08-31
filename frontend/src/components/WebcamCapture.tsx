import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Video, 
  VideoOff, 
  Play, 
  Square, 
  CameraOff, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  Zap, 
  CheckCircle 
} from 'lucide-react';
import { apiService } from '../services/api';
import { PredictionResponse, DetectedObject } from '../types';

interface WebcamCaptureProps {
  onScanCompleted: (result: PredictionResponse) => void;
  confidenceThreshold?: number;
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

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onScanCompleted,
  confidenceThreshold,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isContinuousScanning, setIsContinuousScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [latestDetection, setLatestDetection] = useState<PredictionResponse | null>(null);
  const [fps, setFps] = useState<number>(0);

  const streamRef = useRef<MediaStream | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(Date.now());

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied by your browser. Please allow camera permissions in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can still use Image Upload mode!');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unable to access video stream.'}`);
      }
      setIsStreaming(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsContinuousScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Draw real-time bounding boxes on overlay canvas
  const drawOverlay = (detections: DetectedObject[]) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !videoRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    detections.forEach((det) => {
      const color = CATEGORY_COLORS[det.category] || '#2563eb';
      const bbox = det.bounding_box;

      const x1 = bbox.x1 * w;
      const y1 = bbox.y1 * h;
      const x2 = bbox.x2 * w;
      const y2 = bbox.y2 * h;
      const boxW = x2 - x1;
      const boxH = y2 - y1;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, boxW, boxH);

      // Label background badge
      const labelText = `${det.label} (${Math.round(det.confidence * 100)}%)`;
      ctx.font = 'bold 12px Outfit, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const padding = 6;
      const badgeH = 20;
      const badgeW = textMetrics.width + padding * 2;

      ctx.fillStyle = color;
      ctx.fillRect(x1, Math.max(0, y1 - badgeH), badgeW, badgeH);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x1 + padding, Math.max(14, y1 - 5));
    });
  };

  // Capture single frame as Base64
  const captureFrameBase64 = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Run single inference on current camera view
  const processFrame = useCallback(
    async (saveToHistory: boolean = false) => {
      if (isProcessingFrame) return;

      const base64Image = captureFrameBase64();
      if (!base64Image) return;

      setIsProcessingFrame(true);
      try {
        const result = await apiService.predictFrame(
          base64Image,
          saveToHistory,
          confidenceThreshold
        );

        setLatestDetection(result);
        drawOverlay(result.objects);

        // Update FPS estimation
        const now = Date.now();
        const delta = (now - lastFrameTimeRef.current) / 1000;
        lastFrameTimeRef.current = now;
        if (delta > 0) {
          setFps(Math.round(1 / delta));
        }

        if (saveToHistory) {
          onScanCompleted(result);
        }
      } catch (err) {
        console.error('Frame inference error:', err);
      } finally {
        setIsProcessingFrame(false);
      }
    },
    [isProcessingFrame, confidenceThreshold, onScanCompleted]
  );

  // Toggle Continuous Scanning Loop
  const toggleContinuousScanning = () => {
    if (isContinuousScanning) {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      setIsContinuousScanning(false);
      const canvas = overlayCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      setIsContinuousScanning(true);
      // Run inference every 600ms to preserve browser responsiveness and prevent network bottleneck
      frameTimerRef.current = window.setInterval(() => {
        processFrame(false);
      }, 600);
    }
  };

  // Sync overlay canvas dimensions with video
  const onVideoLoadedMetadata = () => {
    if (videoRef.current && overlayCanvasRef.current) {
      overlayCanvasRef.current.width = videoRef.current.videoWidth || 640;
      overlayCanvasRef.current.height = videoRef.current.videoHeight || 480;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Camera Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[380px] max-h-[540px] shadow-2xl">
        
        {/* Hidden capture canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {isStreaming ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              onLoadedMetadata={onVideoLoadedMetadata}
              className="w-full h-full object-contain mx-auto block"
            />
            {/* Real-time Bounding Box Canvas Overlay */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none object-contain"
            />

            {/* Live Camera HUD Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-semibold uppercase tracking-wider text-[10px]">LIVE FEED</span>
              {isContinuousScanning && (
                <span className="text-[10px] text-eco-400 font-mono pl-1 border-l border-slate-700">
                  {fps} FPS
                </span>
              )}
            </div>

            {/* Top Right Live Category Pill */}
            {latestDetection && latestDetection.objects.length > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[latestDetection.primary_category] || '#22c55e',
                  }}
                />
                <div className="text-right">
                  <p className="text-xs font-bold text-white">
                    {latestDetection.primary_category}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {latestDetection.objects[0].disposal_info.recommended_bin}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <CameraOff className="w-14 h-14 mb-3 text-slate-600 stroke-1" />
            <h4 className="text-base font-semibold text-slate-300">Live Camera is Off</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Activate your webcam to scan waste objects in real-time with automated bounding box tracking.
            </p>
            <button
              onClick={startCamera}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-eco-600 to-cyan-600 hover:from-eco-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-eco-600/20 transition-all hover:scale-105"
            >
              <Video className="w-4 h-4" />
              Enable Camera Stream
            </button>
          </div>
        )}
      </div>

      {/* Permission / Hardware Error Notice */}
      {cameraError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold">Camera Access Warning</p>
            <p className="text-xs text-amber-400/90">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Camera Controls Bar */}
      {isStreaming && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleContinuousScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isContinuousScanning
                  ? 'bg-amber-600/90 hover:bg-amber-600 text-white shadow-md'
                  : 'bg-eco-600/90 hover:bg-eco-600 text-white shadow-md'
              }`}
            >
              {isContinuousScanning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Pause Live Scanning
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  Start Real-time Inference
                </>
              )}
            </button>

            <button
              onClick={() => processFrame(true)}
              disabled={isProcessingFrame}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Capture & Save to History
            </button>
          </div>

          <button
            onClick={stopCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 text-xs font-medium transition-colors"
          >
            <VideoOff className="w-4 h-4" />
            Stop Camera
          </button>
        </div>
      )}
    </div>
  );
};
