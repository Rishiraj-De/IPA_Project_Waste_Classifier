'use client';
import React, { useState, useSyncExternalStore } from 'react';
import { Menu, X, ArrowUpRight, Volume2, VolumeX, Moon, Sun, Recycle } from 'lucide-react';
import { SystemHealth } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealth: SystemHealth | null;
}

const navItems = [
  { id: 'landing', label: 'Home' },
  { id: 'detect', label: 'Scan' },
  { id: 'dashboard', label: 'Insights' },
  { id: 'impact', label: 'Impact' },
  { id: 'history', label: 'History' },
  { id: 'model', label: 'Model' },
];

// The theme lives on <html class="dark"> (set before paint by layout.tsx), so read it from there.
const readIsDark = () => document.documentElement.classList.contains('dark');
const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const isDark = useSyncExternalStore(subscribeToTheme, readIsDark, () => false);

  const toggleAudio = () => {
    const next = !audioEnabled;
    sound.enabled = next;
    setAudioEnabled(next);
    if (next) sound.playSuccess();
  };

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // storage unavailable; theme still applies for this visit
    }
  };

  const go = (id: string) => {
    sound.playClick();
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const healthy = systemHealth?.status === 'healthy';

  const iconButton =
    'w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper-2 transition-colors';

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-ink/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3.5 gap-4">
          {/* Brand */}
          <button
            className="flex items-center gap-2.5 group"
            onClick={() => go('landing')}
            aria-label="CLASSIFY.AI home"
          >
            <span className="w-9 h-9 rounded-full bg-leaf text-on-leaf flex items-center justify-center">
              <Recycle className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </span>
            <span className="font-semibold text-[17px] tracking-[0.12em] text-ink uppercase">
              Classify<span className="text-lavender">.ai</span>
            </span>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => go(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors ${
                    isActive ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] rounded-full bg-lime transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span
              className="hidden xl:flex items-center gap-2 mr-2 text-xs text-muted"
              title={healthy ? 'Classifier is ready' : 'Connecting to the classifier'}
            >
              <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-lime' : 'bg-amber-400'}`} />
              {healthy ? 'Model ready' : 'Connecting…'}
            </span>

            <button
              onClick={toggleAudio}
              className={`${iconButton} hidden sm:flex`}
              title={audioEnabled ? 'Mute interface sounds' : 'Turn interface sounds on'}
              aria-label={audioEnabled ? 'Mute interface sounds' : 'Turn interface sounds on'}
              aria-pressed={audioEnabled}
            >
              {audioEnabled ? <Volume2 className="w-[18px] h-[18px]" /> : <VolumeX className="w-[18px] h-[18px]" />}
            </button>

            <button
              onClick={toggleTheme}
              className={iconButton}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playTargetLock();
                setActiveTab('detect');
                setMobileMenuOpen(false);
              }}
              className="hidden sm:flex cred-button-primary ml-1.5 px-5 py-2.5 text-xs uppercase items-center gap-1.5"
            >
              <span>Scan waste</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${iconButton} lg:hidden`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-ink/[0.07] bg-paper px-4 pt-2 pb-5" aria-label="Main">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 py-3 border-b border-ink/[0.06] text-sm uppercase tracking-[0.12em] ${
                  isActive ? 'text-ink font-semibold' : 'text-muted'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-lime" />}
              </button>
            );
          })}
          <button
            onClick={() => {
              sound.playTargetLock();
              setActiveTab('detect');
              setMobileMenuOpen(false);
            }}
            className="sm:hidden cred-button-primary w-full mt-4 px-5 py-3 text-xs uppercase flex items-center justify-center gap-1.5"
          >
            <span>Scan waste</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      )}
    </header>
  );
};
