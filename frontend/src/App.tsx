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
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-eco-600 flex items-center justify-center text-white">
              <Recycle className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-300">
              AI Smart Waste Classification & Segregation System
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>Ultralytics YOLOv8</span>
            <span>•</span>
            <span>React + TypeScript</span>
            <span>•</span>
            <span>SQLAlchemy SQLite</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineering Major Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
