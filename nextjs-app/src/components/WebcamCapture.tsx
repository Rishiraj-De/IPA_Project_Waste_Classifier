'use client';
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
import { sound } from '../utils/audio';

interface WebcamCaptureProps {
  onScanCompleted: (result: PredictionResponse) => void;
  onLiveDetection?: (result: PredictionResponse | null) => void;
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
  onLiveDetection,
  confidenceThreshold,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isContinuousScanning, setIsContinuousScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [latestDetection, setLatestDetection] = useState<PredictionResponse | null>(null);
  const [fps, setFps] = useState<number>(0);

  const streamRef = useRef<MediaStream | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const isProcessingRef = useRef(false);

  // Helper to sync overlay canvas pixel resolution and dimensions with actual video dimensions
  const syncCanvasDimensions = useCallback(() => {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }
  }, []);

  // Helper to bind the active stream to the video DOM element and start playback
  const attachStreamToVideo = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.play().catch((playErr) => {
      console.warn('video.play() was interrupted or waiting for user gesture:', playErr);
    });
    syncCanvasDimensions();
  }, [syncCanvasDimensions]);

  // Synchronize stream attachment whenever isStreaming state changes
  useEffect(() => {
    if (isStreaming && streamRef.current) {
      attachStreamToVideo();
    }
  }, [isStreaming, attachStreamToVideo]);

  // Start Camera Stream with progressive fallback
  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Your browser or environment does not support camera capture (getUserMedia is unavailable or requires HTTPS / localhost).');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try preferred resolution first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'environment',
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Preferred camera constraints failed, trying basic video constraints...', firstErr);
        // Fallback to any available video device
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsStreaming(true);

      // Attempt immediate binding if video element is already mounted
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('video.play() failed:', e));
        syncCanvasDimensions();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Please click the camera icon in your browser URL address bar to allow camera access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam was detected on your device. You can still test with the Image Upload mode.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application (Zoom, Teams, or another browser tab). Please close other camera apps and retry.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unable to access video device.'}`);
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
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setIsStreaming(false);
    setIsContinuousScanning(false);
    setLatestDetection(null);
    if (onLiveDetection) onLiveDetection(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Draw real-time bounding boxes on overlay canvas (accounting for video letterboxing/aspect ratio)
  const drawOverlay = (detections: DetectedObject[]) => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const color = CATEGORY_COLORS[det.category] || '#2563eb';
      const bbox = det.bounding_box;

      const x1 = bbox.x1 * canvas.width;
      const y1 = bbox.y1 * canvas.height;
      const x2 = bbox.x2 * canvas.width;
      const y2 = bbox.y2 * canvas.height;
      const boxW = x2 - x1;
      const boxH = y2 - y1;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, boxW, boxH);

      // Label background badge
      const labelText = `${det.label} (${Math.round(det.confidence * 100)}%)`;
      ctx.font = 'bold 13px Outfit, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const padding = 6;
      const badgeH = 22;
      const badgeW = textMetrics.width + padding * 2;

      ctx.fillStyle = color;
      ctx.fillRect(x1, Math.max(0, y1 - badgeH), badgeW, badgeH);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x1 + padding, Math.max(16, y1 - 6));
    });
  };

  // Capture single frame as Base64
  const captureFrameBase64 = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

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
      if (isProcessingRef.current) return;

      const base64Image = captureFrameBase64();
      if (!base64Image) return;

      isProcessingRef.current = true;
      setIsProcessingFrame(true);
      try {
        const result = await apiService.predictFrame(
          base64Image,
          saveToHistory,
          confidenceThreshold
        );

        setLatestDetection(result);
        drawOverlay(result.objects);
        if (onLiveDetection) {
          onLiveDetection(result);
        }

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
        isProcessingRef.current = false;
        setIsProcessingFrame(false);
      }
    },
    [confidenceThreshold, onScanCompleted, onLiveDetection]
  );

  // Toggle Continuous Scanning Loop
  const toggleContinuousScanning = () => {
    if (isContinuousScanning) {
      sound.playClick(600);
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
      sound.playScan();
      setIsContinuousScanning(true);
      // Run first frame immediately
      processFrame(false);
      // Run inference every 600ms
      frameTimerRef.current = window.setInterval(() => {
        processFrame(false);
      }, 600);
    }
  };

  // Sync overlay canvas dimensions when metadata is available
  const onVideoLoadedMetadata = () => {
    syncCanvasDimensions();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Camera Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-[#060606] border border-white/[0.1] flex items-center justify-center min-h-[380px] max-h-[540px] shadow-2xl"
      >
        
        {/* Hidden capture canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Camera Video Viewport */}
        <div className={`relative w-full h-full flex items-center justify-center ${isStreaming ? 'block' : 'hidden'}`}>
          <video
            ref={(el) => {
              (videoRef as any).current = el;
              if (el && streamRef.current && el.srcObject !== streamRef.current) {
                el.srcObject = streamRef.current;
                el.play().catch(console.warn);
              }
            }}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={syncCanvasDimensions}
            onCanPlay={syncCanvasDimensions}
            className="w-full h-full object-contain mx-auto block max-h-[520px]"
          />
          {/* Real-time Bounding Box Canvas Overlay */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none object-contain max-h-[520px]"
          />

          {/* Laser Scanning Line during continuous scan */}
          {isContinuousScanning && (
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser shadow-[0_0_15px_#10B981]" />
          )}

          {/* Live Camera HUD Indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/[0.12] text-xs font-mono text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400">FEED ACTIVE</span>
            {isContinuousScanning && (
              <span className="text-[10px] text-[#8C8C87] pl-1 border-l border-white/[0.1]">
                {fps} FPS
              </span>
            )}
          </div>

          {/* Top Right Live Category Pill */}
          {latestDetection && latestDetection.objects.length > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/90 backdrop-blur-xl border border-white/[0.15] shadow-2xl text-left font-mono">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[latestDetection.primary_category] || '#10B981',
                }}
              />
              <div>
                <p className="text-xs font-bold text-white tracking-tight">
                  {latestDetection.primary_category}
                </p>
                <p className="text-[9px] text-emerald-400 uppercase">
                  {latestDetection.objects[0].disposal_info.recommended_bin}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Camera Off Placeholder */}
        {!isStreaming && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#8C8C87]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mb-4">
              <CameraOff className="w-6 h-6 text-[#CCCCCC]" />
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">Camera Feed Inactive</h4>
            <p className="text-xs text-[#8C8C87] mt-1 max-w-sm font-normal">
              Activate your hardware webcam to classify waste objects in real time with automated neural bounding box tracking.
            </p>
            <button
              onClick={startCamera}
              className="mt-6 cred-button-primary px-7 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Enable Camera Stream</span>
            </button>
          </div>
        )}
      </div>

      {/* Permission / Hardware Error Notice */}
      {cameraError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-200 text-xs font-mono text-left">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <div>
            <p className="font-bold text-amber-300 uppercase">Camera Hardware Notice</p>
            <p className="text-xs text-amber-200/90">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Camera Controls Bar */}
      {isStreaming && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleContinuousScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isContinuousScanning
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-emerald-500 text-black shadow-md'
              }`}
            >
              {isContinuousScanning ? (
                <>
                  <Square className="w-3 h-3 fill-black" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-black fill-black" />
                  <span>START REAL-TIME SCAN</span>
                </>
              )}
            </button>

            <button
              onClick={() => processFrame(true)}
              disabled={isProcessingFrame}
              className="cred-button-secondary px-4 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-40"
            >
              <Save className="w-3 h-3" />
              <span>CAPTURE & SAVE</span>
            </button>
          </div>

          <button
            onClick={stopCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#8C8C87] hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
          >
            <VideoOff className="w-3.5 h-3.5" />
            <span>STOP FEED</span>
          </button>
        </div>
      )}
    </div>
  );
};
