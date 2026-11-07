'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Leaf, 
  Zap, 
  Droplet, 
  TreePine, 
  Award, 
  RotateCcw, 
  TrendingUp, 
  Sliders, 
  Database, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  Car, 
  Smartphone, 
  Lightbulb, 
  Clock, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building,
  Home,
  GraduationCap
} from 'lucide-react';
import { 
  MATERIAL_FACTORS, 
  calculateEnvironmentalImpact, 
  InventoryCounts, 
  ImpactSummary 
} from '../lib/carbon-calculator';
import { CertificateModal } from '../components/CertificateModal';
import { apiService } from '../services/api';
import { HistoryItem } from '../types';

export const ImpactPage: React.FC = () => {
  // Mode: 'simulator' vs 'live'
  const [mode, setMode] = useState<'simulator' | 'live'>('simulator');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('KIIT Sustainability Guild');

  // Interactive Simulator Counts
  const [counts, setCounts] = useState<InventoryCounts>({
    plastic: 65,
    metal: 35,
    paper: 45,
    glass: 15,
    organic: 25,
    ewaste: 5,
  });

  // Fetch real history items if user switches to 'live'
  useEffect(() => {
    if (mode === 'live') {
      setLoadingHistory(true);
      apiService.getHistory({ limit: 100 })
        .then((res) => {
          setHistoryItems(res.items || []);
        })
        .catch((err) => {
          console.error('Failed to load history for impact calculation:', err);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [mode]);

  // If live mode, compute counts from history
  const activeCounts: InventoryCounts = useMemo(() => {
    if (mode === 'simulator') {
      return counts;
    }
    // Parse from history records
    const aggregated: InventoryCounts = {
      plastic: 0,
      metal: 0,
      paper: 0,
      glass: 0,
      organic: 0,
      ewaste: 0,
    };

    historyItems.forEach((item) => {
      const targetLabels: string[] = [];
      if (item.objects && item.objects.length > 0) {
        item.objects.forEach(obj => {
          targetLabels.push((obj.label || obj.category || '').toLowerCase());
        });
      } else {
        targetLabels.push((item.primary_category || '').toLowerCase());
      }

      targetLabels.forEach((lbl) => {
        if (lbl.includes('plastic') || lbl.includes('bottle')) {
          aggregated.plastic += 1;
        } else if (lbl.includes('metal') || lbl.includes('can') || lbl.includes('aluminium')) {
          aggregated.metal += 1;
        } else if (lbl.includes('paper') || lbl.includes('cardboard') || lbl.includes('carton')) {
          aggregated.paper += 1;
        } else if (lbl.includes('glass')) {
          aggregated.glass += 1;
        } else if (lbl.includes('organic') || lbl.includes('food') || lbl.includes('waste')) {
          aggregated.organic += 1;
        } else if (lbl.includes('battery') || lbl.includes('electronic') || lbl.includes('e-waste')) {
          aggregated.ewaste += 1;
        } else {
          aggregated.plastic += 1; // Default fallback category
        }
      });
    });

    return aggregated;
  }, [mode, counts, historyItems]);

  const impact: ImpactSummary = useMemo(() => {
    return calculateEnvironmentalImpact(activeCounts);
  }, [activeCounts]);

  const handleSliderChange = (key: keyof InventoryCounts, val: number) => {
    setCounts((prev) => ({ ...prev, [key]: val }));
  };

  const applyPreset = (preset: 'dorm' | 'cafeteria' | 'campus') => {
    setMode('simulator');
    if (preset === 'dorm') {
      setCounts({ plastic: 40, metal: 20, paper: 30, glass: 10, organic: 20, ewaste: 2 });
      setRecipientName('Hostel Block C • Room 402');
    } else if (preset === 'cafeteria') {
      setCounts({ plastic: 650, metal: 320, paper: 250, glass: 90, organic: 450, ewaste: 5 });
      setRecipientName('Central University Cafeteria');
    } else if (preset === 'campus') {
      setCounts({ plastic: 2500, metal: 1200, paper: 3800, glass: 450, organic: 1800, ewaste: 85 });
      setRecipientName('KIIT Smart Campus Sustainability Guild');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-ink">
      
      {/* Header Banner */}
      <div className="relative p-8 sm:p-10 rounded-[2rem] bg-blush overflow-hidden">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs tabular-nums font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Circular Carbon Intelligence Studio
            </div>
            <h1 className="display text-3xl sm:text-5xl text-ink">
              Environmental Impact & Carbon Abatement Engine
            </h1>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Translate every segregated material stream into verified, quantifiable greenhouse gas (GHG) reductions,
              energy conservation, and freshwater preservation governed by <strong className="text-emerald-700 font-semibold">US EPA WARM v15</strong> metrics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setCertModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 cred-button-primary text-xs uppercase"
            >
              <Award className="w-4.5 h-4.5" />
              <span>Claim Sustainability Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Presets Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-ink/[0.03] border border-ink/[0.08]">
        
        {/* Toggle Mode */}
        <div className="flex items-center gap-2 bg-paper-2 p-1 rounded-xl border border-ink/[0.08]">
          <button
            onClick={() => setMode('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'simulator'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={() => setMode('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'live'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Live Scan History Sync</span>
            {historyItems.length > 0 && (
              <span className="text-[10px] tabular-nums bg-ink/[0.1] px-1.5 py-0.2 rounded-full">
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Simulation Presets */}
        {mode === 'simulator' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs tabular-nums text-muted">Quick Presets:</span>
            
            <button
              onClick={() => applyPreset('dorm')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] text-xs font-medium text-ink-soft transition-all"
            >
              <Home className="w-3 h-3 text-emerald-700" />
              <span>Dorm Block</span>
            </button>

            <button
              onClick={() => applyPreset('cafeteria')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] text-xs font-medium text-ink-soft transition-all"
            >
              <Building className="w-3 h-3 text-teal-700" />
              <span>Cafeteria</span>
            </button>

            <button
              onClick={() => applyPreset('campus')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink/[0.04] hover:bg-ink/[0.08] border border-ink/[0.08] text-xs font-medium text-ink-soft transition-all"
            >
              <GraduationCap className="w-3 h-3 text-cyan-700" />
              <span>University Campus</span>
            </button>

            <button
              onClick={() => setCounts({ plastic: 0, metal: 0, paper: 0, glass: 0, organic: 0, ewaste: 0 })}
              className="p-1.5 rounded-lg hover:bg-ink/[0.08] text-muted hover:text-ink transition-all"
              title="Reset Sliders to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: CO2 Abatement */}
        <div className="relative p-6 cred-card overflow-hidden group">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs tabular-nums font-bold tracking-wider uppercase">GHG Abated</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold text-ink tabular-nums">
              {impact.co2OffsetKg}
            </span>
            <span className="text-sm font-bold text-emerald-700 tabular-nums">kg CO₂e</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Avoided atmospheric warming potential from diverted items.
          </p>
        </div>

        {/* KPI 2: Energy Preserved */}
        <div className="relative p-6 cred-card overflow-hidden group">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-xs tabular-nums font-bold tracking-wider uppercase">Grid Energy Saved</span>
            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-teal-700" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold text-ink tabular-nums">
              {impact.energySavedKwh}
            </span>
            <span className="text-sm font-bold text-teal-700 tabular-nums">kWh</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Saved versus raw resource extraction and smelting.
          </p>
        </div>

        {/* KPI 3: Water Saved */}
        <div className="relative p-6 cred-card overflow-hidden group">
          <div className="flex items-center justify-between text-cyan-700">
            <span className="text-xs tabular-nums font-bold tracking-wider uppercase">Freshwater Conserved</span>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-cyan-700" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold text-ink tabular-nums">
              {impact.waterSavedLiters}
            </span>
            <span className="text-sm font-bold text-cyan-700 tabular-nums">Litres</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Industrial process water conserved through recycling loops.
          </p>
        </div>

        {/* KPI 4: Trees Preserved */}
        <div className="relative p-6 cred-card overflow-hidden group">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs tabular-nums font-bold tracking-wider uppercase">Tree Wood Preserved</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold text-ink tabular-nums">
              {impact.treesSaved}
            </span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">Trees</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Virgin timber saved through recovered paper & cardboard.
          </p>
        </div>

      </div>

      {/* Equivalency Carousel Cards */}
      <div className="p-6 rounded-2xl bg-ink/[0.02] border border-ink/[0.08]">
        <h3 className="text-xs tabular-nums font-bold text-ink-soft uppercase tracking-wider mb-4">
          Empirical Real-World Equivalents
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          
          <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
            <Car className="w-5 h-5 text-emerald-700 mx-auto mb-2" />
            <p className="text-xl font-semibold text-ink tabular-nums">{impact.carKmOffset} km</p>
            <p className="text-[11px] text-muted mt-0.5">Gasoline Car Travel Offset</p>
          </div>

          <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
            <Smartphone className="w-5 h-5 text-teal-700 mx-auto mb-2" />
            <p className="text-xl font-semibold text-ink tabular-nums">{impact.smartphoneCharges.toLocaleString()}</p>
            <p className="text-[11px] text-muted mt-0.5">Smartphone Recharges Powered</p>
          </div>

          <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
            <Lightbulb className="w-5 h-5 text-yellow-700 mx-auto mb-2" />
            <p className="text-xl font-semibold text-ink tabular-nums">{impact.ledBulbHours.toLocaleString()} hrs</p>
            <p className="text-[11px] text-muted mt-0.5">10W LED Illumination</p>
          </div>

          <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
            <Clock className="w-5 h-5 text-cyan-700 mx-auto mb-2" />
            <p className="text-xl font-semibold text-ink tabular-nums">{impact.showerMinutesSaved} min</p>
            <p className="text-[11px] text-muted mt-0.5">Showers Equivalent Saved</p>
          </div>

        </div>
      </div>

      {/* Main Two-Column Layout: Sliders & Material LCA Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-ink/[0.02] border border-ink/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                  {mode === 'simulator' ? 'Simulate Segregated Waste Quantities' : 'Live Item Breakdown'}
                </h3>
                <p className="text-xs text-muted">
                  {mode === 'simulator' 
                    ? 'Adjust units to forecast municipal diversion metrics and carbon credits.'
                    : 'Values aggregated from real computer-vision classifications in your database.'}
                </p>
              </div>
              <span className="text-xs tabular-nums font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                {impact.totalItems} Items ({impact.totalWeightKg} kg)
              </span>
            </div>

            {/* Sliders Container */}
            <div className="space-y-5 mt-6">
              
              {/* Plastic Slider */}
              <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Plastic Bottles & Containers (PET #1 / HDPE #2)
                  </span>
                  <span className="tabular-nums font-bold text-ink text-sm">
                    {activeCounts.plastic} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="5"
                  disabled={mode === 'live'}
                  value={activeCounts.plastic}
                  onChange={(e) => handleSliderChange('plastic', Number(e.target.value))}
                  className="w-full h-1.5 bg-ink/[0.1] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-subtle tabular-nums mt-1">
                  <span>0</span>
                  <span>500</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Metal Cans Slider */}
              <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Aluminium Cans & Tin Foils
                  </span>
                  <span className="tabular-nums font-bold text-ink text-sm">
                    {activeCounts.metal} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  disabled={mode === 'live'}
                  value={activeCounts.metal}
                  onChange={(e) => handleSliderChange('metal', Number(e.target.value))}
                  className="w-full h-1.5 bg-ink/[0.1] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-subtle tabular-nums mt-1">
                  <span>0</span>
                  <span>250</span>
                  <span>500</span>
                </div>
              </div>

              {/* Paper / Cardboard Slider */}
              <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Paper, Cartons & Corrugated Cardboard
                  </span>
                  <span className="tabular-nums font-bold text-ink text-sm">
                    {activeCounts.paper} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="5"
                  disabled={mode === 'live'}
                  value={activeCounts.paper}
                  onChange={(e) => handleSliderChange('paper', Number(e.target.value))}
                  className="w-full h-1.5 bg-ink/[0.1] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-subtle tabular-nums mt-1">
                  <span>0</span>
                  <span>500</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Glass Bottles Slider */}
              <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-cyan-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Glass Jars & Beverage Bottles
                  </span>
                  <span className="tabular-nums font-bold text-ink text-sm">
                    {activeCounts.glass} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  disabled={mode === 'live'}
                  value={activeCounts.glass}
                  onChange={(e) => handleSliderChange('glass', Number(e.target.value))}
                  className="w-full h-1.5 bg-ink/[0.1] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-subtle tabular-nums mt-1">
                  <span>0</span>
                  <span>150</span>
                  <span>300</span>
                </div>
              </div>

              {/* Organic Residuals Slider */}
              <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-green-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Organic Food Peels & Biodegradable Residuals
                  </span>
                  <span className="tabular-nums font-bold text-ink text-sm">
                    {activeCounts.organic} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  disabled={mode === 'live'}
                  value={activeCounts.organic}
                  onChange={(e) => handleSliderChange('organic', Number(e.target.value))}
                  className="w-full h-1.5 bg-ink/[0.1] rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-subtle tabular-nums mt-1">
                  <span>0</span>
                  <span>250</span>
                  <span>500</span>
                </div>
              </div>

              {/* E-Waste & Batteries Slider */}
              <div className="p-4 rounded-xl bg-paper-2 border border-ink/[0.06]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-purple-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Small E-Waste & Discharged Batteries
                  </span>
                  <span className="tabular-nums font-bold text-ink text-sm">
                    {activeCounts.ewaste} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  disabled={mode === 'live'}
                  value={activeCounts.ewaste}
                  onChange={(e) => handleSliderChange('ewaste', Number(e.target.value))}
                  className="w-full h-1.5 bg-ink/[0.1] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-subtle tabular-nums mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Material LCA & Degradation Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-ink/[0.02] border border-ink/[0.08]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink mb-1">
              Material Degradation & Circular Loop Matrix
            </h3>
            <p className="text-xs text-muted mb-4">
              Comparing natural degradation in landfills against circular recycling loops.
            </p>

            <div className="space-y-3">
              {Object.values(MATERIAL_FACTORS).map((factor) => (
                <div 
                  key={factor.id}
                  className="p-3.5 rounded-xl bg-paper-2 border border-ink/[0.06] hover:border-emerald-500/30 transition-all text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-ink mb-1">
                    <span>{factor.name}</span>
                    <span className="text-red-700 tabular-nums text-[11px]">
                      {factor.decompositionYears >= 1000000 
                        ? '1,000,000+ yrs' 
                        : factor.decompositionYears >= 1 
                        ? `${factor.decompositionYears} yrs` 
                        : `${Math.round(factor.decompositionYears * 52)} wks`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 tabular-nums mb-1">
                    Loop: {factor.circularCycles}
                  </p>
                  <p className="text-[10px] text-muted leading-relaxed">
                    {factor.fact}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick CTA to Claim Certificate */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 text-center">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Audited & Verified Report
              </h4>
              <p className="text-[11px] text-ink-soft mt-1 mb-3">
                Generate an official verifiable certificate with cryptographic SHA hash to present to your teacher or department.
              </p>
              <button
                onClick={() => setCertModalOpen(true)}
                className="w-full py-2.5 cred-button-primary text-xs uppercase"
              >
                Open Sustainability Certificate
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        impact={impact}
        recipientName={recipientName}
        setRecipientName={setRecipientName}
      />

    </div>
  );
};
