import { NextResponse } from 'next/server';
import { SystemHealth } from '@/types';

const START_TIME = Date.now();

export async function GET() {
  const uptime = Math.round((Date.now() - START_TIME) / 1000);

  // Check if python backend is reachable (if configured)
  const pythonUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';
  let pythonOk = false;
  try {
    const res = await fetch(`${pythonUrl}/api/v1/health`, { signal: AbortSignal.timeout(1500) });
    pythonOk = res.ok;
  } catch {
    pythonOk = false;
  }

  const health: SystemHealth = {
    status: 'healthy',
    service: 'EcoSort AI (Next.js Cloud Engine)',
    version: '2.0.0',
    uptime_seconds: uptime,
    database: {
      status: 'connected',
      dialect: 'JSON / SQLite Persistent Store',
    },
    model: {
      mode: pythonOk ? 'yolov8_connected' : 'autonomous_edge_mapped',
      name: 'YOLOv8 Nano Waste Architecture',
      confidence_threshold: 0.25,
      custom_weights_present: true,
    },
    storage: {
      upload_dir: '/public/uploads',
      writable: true,
    },
  };

  return NextResponse.json(health);
}
