import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DetectPage } from './pages/DetectPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { apiService } from './services/api';
import { SystemHealth } from './types';
import { Recycle, Heart, Terminal, Cpu } from 'lucide-react';

import { AmbientBackground } from './components/AmbientBackground';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await apiService.getHealth();
        setSystemHealth(health);
      } catch (err) {
        console.error('Failed to query system health:', err);
      }
    };
    fetchHealth();
    // Poll health every 30s
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-[#F5F5F0] selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {/* Ambient Interactive Cyber Spotlight Grid */}
      <AmbientBackground />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        {activeTab === 'landing' && (
          <LandingPage
            onStartScanning={() => setActiveTab('detect')}
            onOpenDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'detect' && <DetectPage />}

        {activeTab === 'dashboard' && <DashboardPage />}

        {activeTab === 'history' && <HistoryPage />}

        {activeTab === 'model' && <ModelInfoPage systemHealth={systemHealth} />}
      </main>

      {/* CRED-Inspired Minimal Editorial Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-xl py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#8C8C87]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white">
              <span className="font-mono text-xs font-bold text-emerald-400">Ø</span>
            </div>
            <div>
              <span className="font-extrabold text-[#F5F5F0] text-sm tracking-tight">
                CLASSIFY<span className="text-emerald-400">.AI</span>
              </span>
              <p className="text-[11px] text-[#525252] font-mono">Autonomous Waste Intelligence System</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8C8C87] font-medium">
            <span className="hover:text-white transition-colors cursor-pointer">YOLOv8 Vision Backbone</span>
            <span className="text-[#333333]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Circular Material Engine</span>
            <span className="text-[#333333]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Sub-40ms Inference</span>
            <span className="text-[#333333]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Zero Data Retention</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C8C87] bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM STATUS: OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
