'use client';

import React, { useState, useEffect } from 'react';
import { Recycle } from 'lucide-react';
import { Navbar } from './Navbar';
import { LandingPage } from '../views/LandingPage';
import { DetectPage } from '../views/DetectPage';
import { DashboardPage } from '../views/DashboardPage';
import { HistoryPage } from '../views/HistoryPage';
import { ModelInfoPage } from '../views/ModelInfoPage';
import { ImpactPage } from '../views/ImpactPage';
import { apiService } from '../services/api';
import { SystemHealth } from '../types';

interface MainAppProps {
  initialTab?: string;
}

const footerLinks = [
  { id: 'detect', label: 'Scan waste' },
  { id: 'dashboard', label: 'Insights' },
  { id: 'impact', label: 'Eco-impact' },
  { id: 'history', label: 'Scan history' },
  { id: 'model', label: 'About the model' },
];

export const MainApp: React.FC<MainAppProps> = ({ initialTab = 'landing' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
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

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const healthy = systemHealth?.status === 'healthy';

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink overflow-x-hidden">
      <Navbar activeTab={activeTab} setActiveTab={changeTab} systemHealth={systemHealth} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-20">
        {activeTab === 'landing' && (
          <LandingPage
            onStartScanning={() => changeTab('detect')}
            onOpenDashboard={() => changeTab('dashboard')}
            onOpenImpact={() => changeTab('impact')}
          />
        )}

        {activeTab === 'detect' && <DetectPage />}

        {activeTab === 'dashboard' && <DashboardPage />}

        {activeTab === 'history' && <HistoryPage />}

        {activeTab === 'impact' && <ImpactPage />}

        {activeTab === 'model' && <ModelInfoPage systemHealth={systemHealth} />}
      </main>

      <footer className="mt-auto border-t border-ink/[0.08] bg-paper-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-start gap-3 max-w-sm">
            <span className="w-9 h-9 shrink-0 rounded-full bg-leaf text-on-leaf flex items-center justify-center">
              <Recycle className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </span>
            <div>
              <p className="font-semibold text-[15px] tracking-[0.12em] uppercase text-ink">
                Classify<span className="text-lavender">.ai</span>
              </p>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Snap a photo of your waste and learn which bin it belongs in.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Footer">
            {footerLinks.map((link) => (
              <button key={link.id} onClick={() => changeTab(link.id)} className="hover:text-ink transition-colors">
                {link.label}
              </button>
            ))}
          </nav>

          <p className="flex items-center gap-2 text-xs text-muted">
            <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-lime' : 'bg-amber-400'}`} />
            {healthy ? 'Classifier online' : 'Checking classifier…'}
          </p>
        </div>
      </footer>
    </div>
  );
};
