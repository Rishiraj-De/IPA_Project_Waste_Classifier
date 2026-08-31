import React, { useState } from 'react';
import { 
  Recycle, 
  Camera, 
  BarChart3, 
  History, 
  Cpu, 
  Home, 
  Menu, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealth: SystemHealth | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'detect', label: 'Waste Scanner', icon: Camera, badge: 'Live AI' },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Scan Audit', icon: History },
    { id: 'model', label: 'Model Info', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand / Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-eco-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-eco-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  EcoSort<span className="text-eco-400">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-eco-500/10 text-eco-400 border border-eco-500/20">
                  YOLOv8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Smart Waste Segregation System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-eco-400' : 'text-slate-400'}`} />
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-eco-500/20 text-eco-300 border border-eco-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-eco-500 to-cyan-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Status Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
              {systemHealth?.status === 'healthy' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-eco-500"></span>
                  </span>
                  <span className="text-slate-300 font-medium">Inference Engine Active</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({systemHealth.model.mode === 'custom_fine_tuned' ? 'Fine-Tuned' : 'COCO Pretrained'})
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300 font-medium">Connecting...</span>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-950/95 border-b border-slate-800 backdrop-blur-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'text-white bg-slate-800/80 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-eco-400' : 'text-slate-400'}`} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-eco-500/20 text-eco-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
