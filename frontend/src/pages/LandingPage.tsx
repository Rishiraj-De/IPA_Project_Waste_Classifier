import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  ArrowUpRight, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Compass,
  Radio,
  Layers,
  RotateCw,
  Trophy,
  Flame,
  Check
} from 'lucide-react';
import { sound } from '../utils/audio';

interface LandingPageProps {
  onStartScanning: () => void;
  onOpenDashboard: () => void;
}

interface HeroItem {
  id: string;
  name: string;
  material: string;
  category: 'DRY WASTE' | 'WET WASTE' | 'HAZARDOUS' | 'E-WASTE';
  disposal: 'RECYCLABLE' | 'COMPOSTABLE' | 'HAZARDOUS DEPOT' | 'E-WASTE VAULT';
  confidence: number;
  color: string;
  why: string;
  preparation: string;
  stats: string;
}

const HERO_ITEMS: HeroItem[] = [
  {
    id: 'bottle',
    name: 'PET Plastic Bottle',
    material: 'Polyethylene Terephthalate (PET #1)',
    category: 'DRY WASTE',
    disposal: 'RECYCLABLE',
    confidence: 94.7,
    color: '#3B82F6',
    why: 'High-purity thermoplastic polymer. Fully recyclable into spun polyester fibre or food-grade rPET resin.',
    preparation: 'Empty liquid residue, remove non-PET cap, flatten to optimize bin volume.',
    stats: '82% Landfill Diversion Rate'
  },
  {
    id: 'battery',
    name: 'Lithium-Ion Battery',
    material: 'Lithium Cobalt Oxide (LiCoO2)',
    category: 'HAZARDOUS',
    disposal: 'HAZARDOUS DEPOT',
    confidence: 96.2,
    color: '#EF4444',
    why: 'Heavy metal content and fire risk if punctured. Requires specialized metallurgical cathode extraction.',
    preparation: 'Tape battery terminals with electrical tape. Store dry away from thermal sources.',
    stats: '100% Requires Specialized Recovery'
  },
  {
    id: 'can',
    name: 'Aluminium Beverage Can',
    material: 'Aluminium Alloy 3104',
    category: 'DRY WASTE',
    disposal: 'RECYCLABLE',
    confidence: 92.4,
    color: '#10B981',
    why: 'Infinitely recyclable without structural degradation. Saves 95% energy compared to raw bauxite smelting.',
    preparation: 'Rinse briefly. Do not crush if required by deposit return barcode scanners.',
    stats: '95% Energy Conserved'
  },
  {
    id: 'food',
    name: 'Organic Food Waste',
    material: 'Biodegradable Organic Lignocellulose',
    category: 'WET WASTE',
    disposal: 'COMPOSTABLE',
    confidence: 98.1,
    color: '#10B981',
    why: 'Rapidly anaerobically degrades in landfill, generating methane. Ideal for aerobic compost or biogas digesters.',
    preparation: 'Keep free from plastic wrappers or twist ties. Transfer to green compost bin.',
    stats: 'Zero Methane Emissions'
  },
  {
    id: 'circuit',
    name: 'Printed Circuit Board',
    material: 'FR-4 Copper Clad Laminate + Gold/Silver',
    category: 'E-WASTE',
    disposal: 'E-WASTE VAULT',
    confidence: 95.8,
    color: '#8B5CF6',
    why: 'Contains precious recoverable metals (Au, Ag, Cu) and trace toxic solder (Pb, Sn).',
    preparation: 'Store in anti-static bag. Deliver to registered e-waste collection centre.',
    stats: 'High Value Metal Recovery'
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "Oily corrugated pizza box with cheese residue",
    options: [
      { label: "Dry Waste (Paper)", correct: false, reason: "Grease and food oils bind to paper fibres and cannot be separated during water-based pulping." },
      { label: "Wet / Compostable", correct: true, reason: "Correct. Soiled paper decomposes organically in municipal compost or anaerobic digesters." },
      { label: "Hazardous Waste", correct: false, reason: "Not hazardous, but will contaminate pure paper recycling streams." }
    ]
  },
  {
    question: "Empty aerosol deodorant can (depressurized)",
    options: [
      { label: "Wet Waste", correct: false, reason: "Aerosols are metallic and contain zero organic matter." },
      { label: "Dry Waste (Metal)", correct: true, reason: "Correct. Once fully emptied, steel and aluminium aerosol containers are recyclable dry metal." },
      { label: "E-Waste", correct: false, reason: "Aerosol cans do not contain electrical circuits or batteries." }
    ]
  },
  {
    question: "Broken smartphone glass with digitizer glued",
    options: [
      { label: "Dry Glass Recycling", correct: false, reason: "Treated Gorilla glass and optical laminates cannot be melted with standard bottle glass." },
      { label: "E-Waste / Specialized", correct: true, reason: "Correct. Requires dedicated electronic scrap processing for indium tin oxide recovery." },
      { label: "General Compost", correct: false, reason: "Glass and synthetic optical adhesives are non-biodegradable." }
    ]
  }
];

interface SimulationItem {
  id: string;
  name: string;
  emoji: string;
  bin: 'BLUE' | 'GREEN' | 'RED' | 'PURPLE';
  binName: string;
  category: string;
  status: 'idle' | 'scanning' | 'sorted';
}

const SIMULATION_ITEMS: SimulationItem[] = [
  { id: 'sim-1', name: 'Mineral Water Bottle', emoji: '🧴', bin: 'BLUE', binName: 'Blue Reclaimer (Dry)', category: 'Plastic #1 PET', status: 'idle' },
  { id: 'sim-2', name: 'Banana Peel Scrap', emoji: '🍌', bin: 'GREEN', binName: 'Green Biodigester (Wet)', category: 'Organic Cellulose', status: 'idle' },
  { id: 'sim-3', name: 'Alkaline AA Battery', emoji: '🔋', bin: 'RED', binName: 'Red Hazard Vault (Safe)', category: 'Heavy Metal / Zinc', status: 'idle' },
  { id: 'sim-4', name: 'Soda Beverage Can', emoji: '🥫', bin: 'BLUE', binName: 'Blue Reclaimer (Dry)', category: 'Aluminium 3104', status: 'idle' },
  { id: 'sim-5', name: 'Broken Drone PCB', emoji: '📟', bin: 'PURPLE', binName: 'Purple E-Waste Hub', category: 'Precious Metals', status: 'idle' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartScanning,
  onOpenDashboard,
}) => {
  const [selectedItem, setSelectedItem] = useState<HeroItem>(HERO_ITEMS[0]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'PERSONAL' | 'CAMPUS' | 'SOCIETY' | 'CITY'>('CAMPUS');

  // Interactive Particle Sorter Simulator State
  const [simItems, setSimItems] = useState<SimulationItem[]>(SIMULATION_ITEMS);
  const [activeSimId, setActiveSimId] = useState<string | null>(null);
  const [sortStreak, setSortStreak] = useState<number>(3);
  const [lastSortedLog, setLastSortedLog] = useState<string>('System online. Click any object to engage neural routing beam.');

  const handleSelectItem = (item: HeroItem) => {
    sound.playClick();
    setSelectedItem(item);
  };

  const handleSimulateSort = (item: SimulationItem) => {
    if (item.status === 'scanning') return;
    sound.playScan();
    setActiveSimId(item.id);

    // Update status to scanning
    setSimItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'scanning' } : i));
    setLastSortedLog(`Target locked: ${item.name}. Localizing molecular profile...`);

    setTimeout(() => {
      sound.playSuccess();
      setSimItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'sorted' } : i));
      setSortStreak(s => s + 1);
      setLastSortedLog(`✓ Routed ${item.name} to ${item.binName} with 99.4% purity score.`);
      setActiveSimId(null);
    }, 900);
  };

  const handleResetSim = () => {
    sound.playClick();
    setSimItems(SIMULATION_ITEMS);
    setLastSortedLog('Simulation chamber cleared. Select an object to route.');
  };

  return (
    <div className="flex flex-col gap-24 sm:gap-32 pb-24 pt-4 sm:pt-8 text-[#F5F5F0]">
      
      {/* 1. HERO SECTION — LUXURY EDITORIAL POSITIONING */}
      <section className="relative flex flex-col items-start text-left max-w-5xl mx-auto w-full pt-4">
        
        {/* Monospaced System Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.1] text-xs font-mono text-[#8C8C87] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="tracking-wider uppercase text-[11px] text-[#A3A39E]">Autonomous Waste Classification</span>
          <span className="text-white/[0.2]">•</span>
          <span className="text-[#8C8C87] text-[11px]">YOLOv8 Vision</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.04] text-white max-w-4xl">
          Waste isn’t waste.<br />
          <span className="shimmer-text">It’s a classification problem.</span>
        </h1>

        {/* Subhead with dramatic spacing */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#8C8C87] max-w-2xl font-normal leading-relaxed">
          AI-powered visual segregation that diagnoses material composition in real time — telling you what belongs where before contamination happens.
        </p>

        {/* Tactile Primary & Secondary CTAs */}
        <div className="flex flex-wrap items-center gap-4 mt-10">
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              sound.playTargetLock();
              onStartScanning();
            }}
            className="cred-button-primary px-8 py-4 text-sm flex items-center gap-3 uppercase tracking-wider font-black shadow-xl"
          >
            <span>Scan Your Waste</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              sound.playClick();
              onOpenDashboard();
            }}
            className="cred-button-secondary px-7 py-4 text-sm flex items-center gap-2.5 font-bold tracking-tight"
          >
            <Compass className="w-4 h-4 text-[#8C8C87]" />
            <span>Explore The System</span>
          </button>
        </div>

        {/* Subtle Live Metrics Ticker Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 mt-16 pt-8 border-t border-white/[0.08] w-full text-left font-mono">
          <div>
            <span className="text-[11px] text-[#525252] uppercase block tracking-wider">Inference Speed</span>
            <span className="text-lg sm:text-xl font-bold text-[#F5F5F0] mt-0.5 block">&lt; 38ms</span>
          </div>
          <div>
            <span className="text-[11px] text-[#525252] uppercase block tracking-wider">Detection Precision</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5 block">87.1% mAP</span>
          </div>
          <div>
            <span className="text-[11px] text-[#525252] uppercase block tracking-wider">Material Classes</span>
            <span className="text-lg sm:text-xl font-bold text-[#F5F5F0] mt-0.5 block">9 Categories</span>
          </div>
          <div>
            <span className="text-[11px] text-[#525252] uppercase block tracking-wider">Segregation Purity</span>
            <span className="text-lg sm:text-xl font-bold text-[#F5F5F0] mt-0.5 block">94.7% Purity</span>
          </div>
        </div>

      </section>

      {/* 2. HERO VISUAL — INTERACTIVE AI DIAGNOSTIC TERMINAL */}
      <section className="w-full max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6 text-left">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
              [ LIVE NEURAL DEMO ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Interactive Diagnostic Engine
            </h2>
          </div>
          <p className="text-xs text-[#8C8C87] max-w-md">
            Select any physical waste object to simulate live convolutional object localization, material spectrometry, and municipal bin routing.
          </p>
        </div>

        {/* Item Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {HERO_ITEMS.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                onMouseEnter={() => sound.playHover()}
                onClick={() => handleSelectItem(item)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-white/[0.04] text-[#8C8C87] hover:text-white border border-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Terminal Card */}
        <div className="cred-card p-6 sm:p-10 border border-white/[0.12] relative overflow-hidden">
          
          {/* Subtle Ambient Scan Glow */}
          <div 
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none transition-all duration-700"
            style={{ backgroundColor: selectedItem.color }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Object & HUD Crosshairs (Left 5 Cols) */}
            <div className="lg:col-span-5 relative w-full aspect-square rounded-2xl bg-[#0A0A0A] border border-white/[0.08] flex flex-col items-center justify-center p-8 overflow-hidden">
              
              {/* Laser Scanning Line */}
              <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser shadow-[0_0_15px_#10B981]" />

              {/* HUD Frame Elements */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-[#525252]">
                LOC: [412, 198]
              </div>
              <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse" />
                ACTIVE HUD
              </div>
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#525252]">
                YOLOv8-BACKBONE
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#8C8C87]">
                FPS: 60.0
              </div>

              {/* Bounding Box Visual Simulation */}
              <div className="relative w-44 h-44 rounded-xl border border-dashed border-emerald-400/60 bg-emerald-500/[0.03] flex flex-col items-center justify-center p-4 transition-transform duration-500">
                <span className="text-5xl sm:text-6xl select-none filter drop-shadow-2xl">
                  {selectedItem.id === 'bottle' && '🧴'}
                  {selectedItem.id === 'battery' && '🔋'}
                  {selectedItem.id === 'can' && '🥫'}
                  {selectedItem.id === 'food' && '🥑'}
                  {selectedItem.id === 'circuit' && '📟'}
                </span>
                <span className="absolute -top-3 left-2 px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-mono font-black rounded uppercase">
                  {selectedItem.name} • {selectedItem.confidence}%
                </span>
              </div>
            </div>

            {/* Diagnostic Readout (Right 7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              
              {/* Classification Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white">
                  CATEGORY: {selectedItem.category}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full cred-badge-emerald flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedItem.disposal}
                </span>
                <span className="text-xs font-mono text-[#8C8C87] ml-auto">
                  CONFIDENCE: <strong className="text-white">{selectedItem.confidence}%</strong>
                </span>
              </div>

              {/* Object Title & Chemical Composition */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {selectedItem.name}
                </h3>
                <p className="text-xs font-mono text-[#8C8C87] mt-1">
                  SPEC: {selectedItem.material}
                </p>
              </div>

              {/* Why? Section (Diagnostic Rationale) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                  WHY THIS MATTERS:
                </span>
                <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
                  {selectedItem.why}
                </p>
              </div>

              {/* Handling Directive */}
              <div className="flex items-start gap-3 text-xs text-[#8C8C87]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Handling Prep:</strong> {selectedItem.preparation}
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="pt-2">
                <button
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    sound.playTargetLock();
                    onStartScanning();
                  }}
                  className="cred-button-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Your Own Items</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 3. SUPER COOL INTERACTIVE PHYSICS STREAM SORTER CHAMBER */}
      <section className="w-full max-w-5xl mx-auto text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
              [ NEURAL SANDBOX ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Live Particle Sorter Chamber
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full cred-badge-emerald">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sortStreak}X STREAK</span>
            </div>
            <button
              onClick={handleResetSim}
              className="cred-button-secondary px-3 py-1 rounded-full text-[11px] flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        <div className="cred-card p-6 sm:p-8 border border-white/[0.12] bg-[#0A0A0A] relative overflow-hidden">
          
          {/* Chamber Header Log */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] font-mono text-xs">
            <span className="text-[#8C8C87] flex items-center gap-2 truncate max-w-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{lastSortedLog}</span>
            </span>
            <span className="text-[#525252] text-[10px] hidden sm:block">CHAMBER v8.2</span>
          </div>

          {/* Interactive Conveyor Waste Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
            {simItems.map((item) => (
              <button
                key={item.id}
                onMouseEnter={() => sound.playHover()}
                onClick={() => handleSimulateSort(item)}
                disabled={item.status === 'sorted' || item.status === 'scanning'}
                className={`p-4 rounded-2xl text-center border transition-all duration-300 relative group overflow-hidden ${
                  item.status === 'sorted'
                    ? 'bg-emerald-500/[0.06] border-emerald-500/30 opacity-70 scale-95'
                    : item.status === 'scanning'
                    ? 'bg-amber-500/[0.1] border-amber-500/50 scale-105 shadow-xl animate-pulse'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/30 hover:bg-white/[0.06] hover:scale-105'
                }`}
              >
                <div className="text-4xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <p className="text-xs font-bold text-white tracking-tight truncate">
                  {item.name}
                </p>
                <p className="text-[10px] font-mono text-[#8C8C87] mt-0.5 truncate">
                  {item.category}
                </p>

                {item.status === 'sorted' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-[9px]">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 4 Receptacle Pods (Destinations) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08] font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/20 text-blue-300">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">RECLAIMER</span>
              <span className="font-bold text-white text-xs mt-0.5 block">Blue Dry Vault</span>
              <span className="text-[10px] text-[#8C8C87] mt-1 block">PET & Aluminium</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-emerald-300">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">BIODIGESTER</span>
              <span className="font-bold text-white text-xs mt-0.5 block">Green Wet Pod</span>
              <span className="text-[10px] text-[#8C8C87] mt-1 block">Organic Compost</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/[0.05] border border-rose-500/20 text-rose-300">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">NEUTRALIZER</span>
              <span className="font-bold text-white text-xs mt-0.5 block">Red Hazard Cell</span>
              <span className="text-[10px] text-[#8C8C87] mt-1 block">Heavy Metal/Cells</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/[0.05] border border-purple-500/20 text-purple-300">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">METALLURGY</span>
              <span className="font-bold text-white text-xs mt-0.5 block">Purple E-Waste Hub</span>
              <span className="text-[10px] text-[#8C8C87] mt-1 block">Circuit Precious</span>
            </div>
          </div>

        </div>

      </section>

      {/* 4. CINEMATIC 01–04 "HOW IT WORKS" TIMELINE */}
      <section className="w-full max-w-5xl mx-auto text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#525252] block mb-1">
              [ EXECUTION PROTOCOL ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How The Machine Works
            </h2>
          </div>
          <p className="text-xs text-[#8C8C87] max-w-sm">
            Sub-second computer vision pipeline resolving physical matter into pure municipal recovery streams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="cred-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-2xl font-black text-white/20 block mb-4">01</span>
              <h4 className="text-base font-bold text-white tracking-tight">IDENTIFY</h4>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                YOLOv8 convolutional neural network isolates physical bounds and textures across 80 COCO features.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400">
              BOUNDING BOX • LOCALIZED
            </div>
          </div>

          <div className="cred-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-2xl font-black text-white/20 block mb-4">02</span>
              <h4 className="text-base font-bold text-white tracking-tight">CLASSIFY</h4>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Custom taxonomy maps detected physical object to 1 of 9 standardized municipal waste categories.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400">
              TAXONOMY • RESOLVED
            </div>
          </div>

          <div className="cred-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-2xl font-black text-white/20 block mb-4">03</span>
              <h4 className="text-base font-bold text-white tracking-tight">EXPLAIN</h4>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Generates scientific rationale detailing polymer structure, toxicity warnings, and preparation steps.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400">
              RATIONALE • GENERATED
            </div>
          </div>

          <div className="cred-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-2xl font-black text-white/20 block mb-4">04</span>
              <h4 className="text-base font-bold text-white tracking-tight">ACT</h4>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Directs material to the designated municipal receptacle, eliminating downstream contamination.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400">
              DIVERSION • CONFIRMED
            </div>
          </div>

        </div>

      </section>

      {/* 5. WASTE CATEGORIES TAXONOMY (EDITORIAL CARDS) */}
      <section className="w-full max-w-5xl mx-auto text-left">
        
        <div className="mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#525252] block mb-1">
            [ MATERIAL TAXONOMY ]
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Precision Segregation Streams
          </h2>
          <p className="text-xs text-[#8C8C87] mt-1 max-w-xl">
            Each stream adheres to strict industrial recovery standards, eliminating ambiguity at the bin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* WET WASTE */}
          <div className="cred-card p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">STREAM 01</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">WET WASTE</h3>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Kitchen organic scrap, raw vegetables, cooked food leftovers, coffee grounds, and soiled compostable cellulose.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#CCCCCC]">
              <span>GREEN BIN</span>
              <span className="text-emerald-400">→ COMPOST / BIOGAS</span>
            </div>
          </div>

          {/* DRY WASTE */}
          <div className="cred-card p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider">STREAM 02</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">DRY RECYCLABLE</h3>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Paper, clean cardboard, plastic polymers (PET, HDPE, PP), metals (steel, aluminium cans), and intact container glass.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#CCCCCC]">
              <span>BLUE BIN</span>
              <span className="text-blue-400">→ MATERIAL RECOVERY</span>
            </div>
          </div>

          {/* HAZARDOUS WASTE */}
          <div className="cred-card p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider">STREAM 03</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">HAZARDOUS</h3>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Lithium batteries, chemical aerosols, paint thinners, expired medical pharmaceuticals, and CFL mercury tubes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#CCCCCC]">
              <span>RED / SECURE</span>
              <span className="text-red-400">→ SPECIAL DEPOT</span>
            </div>
          </div>

          {/* E-WASTE */}
          <div className="cred-card p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">STREAM 04</span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">E-WASTE</h3>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Printed circuit boards, lithium smartphones, AC chargers, insulated copper cables, and broken electronic peripherals.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#CCCCCC]">
              <span>GREY VAULT</span>
              <span className="text-purple-400">→ SMELTER REFINERY</span>
            </div>
          </div>

          {/* SANITARY STREAM */}
          <div className="cred-card p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">STREAM 05</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">SANITARY</h3>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Diapers, personal hygiene products, medical swabs, and biological contaminated disposables.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#CCCCCC]">
              <span>WRAPPED BLACK</span>
              <span className="text-amber-400">→ HIGH-TEMP INCINERATION</span>
            </div>
          </div>

          {/* RESIDUAL LANDFILL */}
          <div className="cred-card p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#8C8C87] font-bold uppercase tracking-wider">STREAM 06</span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">GENERAL RESIDUAL</h3>
              <p className="text-xs text-[#8C8C87] mt-2 leading-relaxed">
                Multi-layer metallized chip packets (MLP), thermo-set plastics, and non-recyclable composite resins.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#CCCCCC]">
              <span>BLACK BIN</span>
              <span className="text-[#8C8C87]">→ ENGINEERED LANDFILL</span>
            </div>
          </div>

        </div>

      </section>

      {/* 6. INTERACTIVE EDUCATIONAL QUIZ WIDGET */}
      <section className="w-full max-w-5xl mx-auto text-left">
        
        <div className="cred-card p-8 sm:p-10 border border-white/[0.12]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                [ INTERACTIVE EDUCATION ]
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Can this go in the blue bin?
              </h3>
            </div>
            <div className="text-xs font-mono text-[#8C8C87]">
              CHALLENGE {quizIndex + 1} OF {QUIZ_QUESTIONS.length}
            </div>
          </div>

          {/* Question Text */}
          <div className="my-8">
            <h4 className="text-lg sm:text-xl font-bold text-[#F5F5F0]">
              Item: &ldquo;{QUIZ_QUESTIONS[quizIndex].question}&rdquo;
            </h4>
          </div>

          {/* Interactive Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    if (opt.correct) {
                      sound.playSuccess();
                    } else {
                      sound.playClick(400);
                    }
                    setSelectedOption(idx);
                  }}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? opt.correct
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg'
                        : 'bg-rose-500/10 border-rose-500/50 text-white shadow-lg'
                      : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-[#CCCCCC]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-[#8C8C87]">Option 0{idx + 1}</span>
                    {isSelected && (
                      opt.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )
                    )}
                  </div>
                  <span className="text-sm font-bold block">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {selectedOption !== null && (
            <div className={`mt-6 p-4 rounded-xl border text-xs sm:text-sm font-mono leading-relaxed ${
              QUIZ_QUESTIONS[quizIndex].options[selectedOption].correct
                ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/[0.08] border-rose-500/30 text-rose-300'
            }`}>
              <strong>{QUIZ_QUESTIONS[quizIndex].options[selectedOption].correct ? 'CORRECT: ' : 'INCORRECT: '}</strong>
              {QUIZ_QUESTIONS[quizIndex].options[selectedOption].reason}
            </div>
          )}

          {/* Next Question Controller */}
          <div className="mt-8 flex justify-end">
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playClick();
                setSelectedOption(null);
                setQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
              }}
              className="cred-button-secondary px-5 py-2 text-xs font-bold font-mono uppercase flex items-center gap-2"
            >
              <span>Next Diagnostic Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </section>

      {/* 7. COMMUNITY / CAMPUS LEADERBOARD TEASER */}
      <section className="w-full max-w-5xl mx-auto text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#525252] block mb-1">
              [ COLLECTIVE RECOVERY METRICS ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Waste is personal. Impact is collective.
            </h2>
          </div>

          {/* Scope Mode Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full font-mono text-xs">
            {(['PERSONAL', 'CAMPUS', 'SOCIETY', 'CITY'] as const).map((tab) => (
              <button
                key={tab}
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playClick();
                  setLeaderboardTab(tab);
                }}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  leaderboardTab === tab ? 'bg-white text-black' : 'text-[#8C8C87] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="cred-card p-6 sm:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono text-[#525252] uppercase block">Active Entity</span>
              <h4 className="text-xl font-bold text-white mt-1">KIIT Campus Hub</h4>
              <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Top Contributor #01</p>
            </div>

            <div>
              <span className="text-xs font-mono text-[#525252] uppercase block">Segregation Score</span>
              <h4 className="text-xl font-bold text-white mt-1">87% Purity</h4>
              <p className="text-[11px] text-[#8C8C87] font-mono mt-0.5">+4.2% this month</p>
            </div>

            <div>
              <span className="text-xs font-mono text-[#525252] uppercase block">Waste Diverted</span>
              <h4 className="text-xl font-bold text-white mt-1">1.84 TONNES</h4>
              <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Diverted from Landfills</p>
            </div>

            <div className="flex items-center md:justify-end">
              <button
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playClick();
                  onOpenDashboard();
                }}
                className="cred-button-primary px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider"
              >
                View Full Audit
              </button>
            </div>
          </div>

          {/* Mini Table Rows */}
          <div className="mt-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">#01</span>
                <span className="text-white font-sans font-semibold">KIIT International Hostel Block C</span>
              </div>
              <span className="text-emerald-400 font-bold">94% Segregated</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-white/60 font-bold">#02</span>
                <span className="text-white font-sans font-semibold">Campus 6 Computer Labs & Cafeteria</span>
              </div>
              <span className="text-emerald-400 font-bold">89% Segregated</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-white/40 font-bold">#03</span>
                <span className="text-white font-sans font-semibold">Main Administrative Block & Library</span>
              </div>
              <span className="text-emerald-400 font-bold">82% Segregated</span>
            </div>
          </div>

        </div>

      </section>

      {/* 8. CINEMATIC IMPACT TOTALS */}
      <section className="w-full max-w-5xl mx-auto text-left">
        
        <div className="cred-card p-8 sm:p-12 border border-white/[0.12] relative overflow-hidden">
          
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
              [ VERIFIED REGIONAL DIVERSION ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Measurable ecological impact.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 font-mono">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white block">4,820 kg</span>
              <span className="text-xs text-[#8C8C87] mt-1 block">Total waste segregated correctly</span>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 block">1,240 kg</span>
              <span className="text-xs text-[#8C8C87] mt-1 block">Dry recyclables recovered for industry</span>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white block">3,580 kg</span>
              <span className="text-xs text-[#8C8C87] mt-1 block">Organic matter routed to compost</span>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] block">2,190 kg</span>
              <span className="text-xs text-[#8C8C87] mt-1 block">Direct landfill avoidance</span>
            </div>
          </div>

        </div>

      </section>

      {/* 9. BOTTOM HERO CTA */}
      <section className="w-full max-w-5xl mx-auto text-left cred-card p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/[0.15]">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-2">
            [ READY TO CLASSIFY ]
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Stop guessing. Start classifying.
          </h3>
          <p className="text-xs sm:text-sm text-[#8C8C87] mt-1 max-w-lg">
            Zero setup required. Open your camera or drop a photograph to run real-time inference on our YOLOv8 vision engine.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => {
              sound.playTargetLock();
              onStartScanning();
            }}
            className="cred-button-primary px-8 py-3.5 text-xs font-black uppercase tracking-wider shadow-2xl flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Scanner</span>
          </button>
        </div>
      </section>

    </div>
  );
};
