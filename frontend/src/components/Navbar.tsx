import React, { useState } from 'react';
import { 
  Camera, 
  BarChart3, 
  History, 
  Cpu, 
  Home, 
  Menu, 
  X, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SystemHealth } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealth: SystemHealth | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const toggleAudio = () => {
    const next = !audioEnabled;
    sound.enabled = next;
    setAudioEnabled(next);
    if (next) sound.playSuccess();
  };

  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'detect', label: 'Scanner', badge: 'v8.4' },
    { id: 'dashboard', label: 'Intelligence' },
    { id: 'history', label: 'Audit Log' },
    { id: 'model', label: 'Architecture' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-3xl bg-[#080808]/70 border-b border-white/[0.12] transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Minimal Brand Logo with Glass Icon */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              sound.playClick();
              setActiveTab('landing');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/[0.16] flex items-center justify-center text-white shadow-inner group-hover:border-white/40 group-hover:scale-105 transition-all">
              <span className="font-mono text-sm font-extrabold text-emerald-400">Ø</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-[#F5F5F0]">
                  CLASSIFY<span className="text-emerald-400">.AI</span>
                </span>
              </div>
              <p className="text-[10px] text-[#8C8C87] font-mono tracking-wider uppercase -mt-0.5">
                Waste Intelligence
              </p>
            </div>
          </div>

          {/* Frosted Glass Navigation Pill Container */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.1] p-1.5 rounded-full backdrop-blur-2xl shadow-xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'text-black bg-[#F5F5F0] shadow-md font-bold'
                      : 'text-[#8C8C87] hover:text-[#F5F5F0] hover:bg-white/[0.06]'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-white/[0.08] text-[#8C8C87]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Sound Toggle, Status Pill & Primary Scan CTA */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-xl transition-all ${
                audioEnabled
                  ? 'bg-emerald-500/[0.09] border-emerald-500/30 text-emerald-300 shadow-sm'
                  : 'bg-white/[0.03] border-white/[0.08] text-[#525252]'
              }`}
              title={audioEnabled ? 'Futuristic SFX Audio Enabled' : 'SFX Audio Muted'}
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">SFX ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#525252]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">SFX OFF</span>
                </>
              )}
            </button>

            {/* Live Model Health Indicator */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] text-[11px] font-mono text-[#8C8C87] shadow-sm">
              {systemHealth?.status === 'healthy' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[#A3A39E]">SYSTEM READY</span>
                  <span className="text-[#525252] font-normal">| 40ms</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-[#8C8C87]">INITIALIZING</span>
                </>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playTargetLock();
                setActiveTab('detect');
              }}
              className="cred-button-primary px-5 py-2 text-xs flex items-center gap-1.5 uppercase tracking-wider font-extrabold"
            >
              <span>Scan Waste</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setActiveTab('detect')}
              className="cred-button-primary px-3.5 py-1.5 text-xs font-bold"
            >
              Scan
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#8C8C87] hover:text-white bg-white/[0.04] border border-white/[0.08]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 space-y-2 bg-[#0C0C0C] border-b border-white/[0.08] shadow-2xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-black bg-[#F5F5F0] font-bold'
                    : 'text-[#8C8C87] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-white/[0.08] text-[#8C8C87]'
                  }`}>
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
