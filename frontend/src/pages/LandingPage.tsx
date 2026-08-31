import React from 'react';
import { 
  Recycle, 
  Camera, 
  Upload, 
  BarChart3, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Leaf, 
  Globe 
} from 'lucide-react';
import { DisposalBinGuide } from '../components/DisposalBinGuide';

interface LandingPageProps {
  onStartScanning: () => void;
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartScanning,
  onOpenDashboard,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Image or Live Ingestion',
      desc: 'Upload a picture of trash or point your device webcam to capture real-time waste items in your environment.',
      icon: Camera,
      color: '#3b82f6',
    },
    {
      num: '02',
      title: 'YOLOv8 Computer Vision',
      desc: 'Deep learning convolutional backbone localizes multi-object boundaries with pixel-level bounding boxes and confidence scoring.',
      icon: Cpu,
      color: '#10b981',
    },
    {
      num: '03',
      title: 'Smart Recommendation Engine',
      desc: 'Rules service evaluates material composition and maps items to standardized color-coded municipal recycling bins.',
      icon: Recycle,
      color: '#f59e0b',
    },
    {
      num: '04',
      title: 'Audit Logging & Analytics',
      desc: 'Scans are persistently logged in a relational audit database for municipal diversion reporting and statistical monitoring.',
      icon: BarChart3,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-10 flex flex-col items-center text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-eco-500/15 via-cyan-500/10 to-blue-600/10 blur-3xl pointer-events-none rounded-full" />

        {/* Project Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-eco-400 mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-eco-400" />
          <span>Next-Generation Environmental Tech • Computer Vision + ML</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          AI-Powered Smart Waste <br />
          <span className="bg-gradient-to-r from-eco-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Classification & Segregation
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Automate recycling bin segregation with state-of-the-art YOLOv8 object detection. 
          Upload waste imagery or stream live webcam frames to get instant bin recommendations, 
          handling instructions, and audit analytics.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={onStartScanning}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-eco-600 via-eco-500 to-cyan-600 hover:from-eco-500 hover:to-cyan-500 text-white font-bold shadow-xl shadow-eco-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>Launch Waste Scanner</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold shadow-lg transition-all hover:scale-105"
          >
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>View Analytics Dashboard</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 w-full max-w-4xl">
          {[
            { label: '9 Waste Classes', sub: 'Extensible taxonomy' },
            { label: 'Real-time Camera', sub: 'Interactive HUD stream' },
            { label: 'Smart Bin Rules', sub: 'Color-coded guidelines' },
            { label: 'Full Audit Trail', sub: 'Searchable SQL database' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm text-left"
            >
              <span className="text-base sm:text-lg font-bold text-white">{item.label}</span>
              <span className="text-xs text-slate-500 mt-0.5">{item.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Pipeline */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How The AI System Operates
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            An end-to-end computer vision and rule-based decision support workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="flex flex-col p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: step.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate-800 absolute right-4 top-4 select-none">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Waste Categories & Bin Guidelines */}
      <section className="mt-4">
        <DisposalBinGuide />
      </section>

      {/* Environmental Impact Banner */}
      <section className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-eco-950/60 via-slate-900/80 to-cyan-950/60 border border-eco-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-eco-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-4 h-4" />
            <span>Ecological Preservation</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Elevating Circular Economy & Diverting Landfills
          </h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Contaminated recyclables result in up to 30% of municipal recyclable loads being rejected and sent directly to landfills. 
            Automated visual verification ensures high purity recycling streams and optimal composting efficiency.
          </p>
        </div>

        <button
          onClick={onStartScanning}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-eco-500 hover:bg-eco-400 text-slate-950 font-extrabold text-sm shadow-xl transition-transform hover:scale-105"
        >
          <span>Test Scanner Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
