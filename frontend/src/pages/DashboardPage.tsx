import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Recycle, 
  TrendingUp, 
  Percent, 
  PieChart as PieChartIcon, 
  Activity, 
  RefreshCw, 
  Layers,
  Award,
  ShieldCheck,
  Zap,
  Flame,
  Crown,
  CheckCircle2,
  Gift,
  Sparkles,
  Ticket,
  Copy,
  Check
} from 'lucide-react';
import { apiService } from '../services/api';
import { StatisticsResponse } from '../types';
import { StatsCard } from '../components/StatsCard';
import { CategoryPieChart } from '../components/Charts/CategoryPieChart';
import { DailyTrendsAreaChart } from '../components/Charts/DailyTrendsAreaChart';
import { RecyclableDonutChart } from '../components/Charts/RecyclableDonutChart';
import { ConfidenceHistChart } from '../components/Charts/ConfidenceHistChart';
import { sound } from '../utils/audio';

interface PerkCard {
  id: string;
  brand: string;
  title: string;
  code: string;
  tag: string;
  color: string;
  isClaimed: boolean;
}

const INITIAL_PERKS: PerkCard[] = [
  {
    id: 'perk-1',
    brand: 'KIIT GREEN CAMPUS',
    title: '500 Carbon Eco-Credits Voucher',
    code: 'KIIT-ECO-8420',
    tag: 'CAMPUS PERK',
    color: '#10B981',
    isClaimed: false,
  },
  {
    id: 'perk-2',
    brand: 'ZERO-WASTE STORE',
    title: '₹250 OFF Stainless Steel Bottle & Kit',
    code: 'ZEROWASTE-PURITY94',
    tag: 'EXCLUSIVE REWARD',
    color: '#3B82F6',
    isClaimed: false,
  },
  {
    id: 'perk-3',
    brand: 'METRO TRANSIT',
    title: '15% Discount on Green Commute Pass',
    code: 'METRO-CLEAN-PASS',
    tag: 'TRANSIT PERK',
    color: '#D4AF37',
    isClaimed: false,
  },
];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardScope, setLeaderboardScope] = useState<'PERSONAL' | 'CAMPUS' | 'SOCIETY' | 'CITY'>('CAMPUS');
  const [perks, setPerks] = useState<PerkCard[]>(INITIAL_PERKS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClaimPerk = (id: string) => {
    sound.playSuccess();
    setPerks(prev => prev.map(p => p.id === id ? { ...p, isClaimed: true } : p));
  };

  const handleCopyCode = (code: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-12 pb-20 text-[#F5F5F0]">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-white/[0.08] text-left">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            [ PORTFOLIO INTELLIGENCE ]
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Your Waste Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8C87] mt-1 font-normal">
            Real-time material portfolio, purity scoring, verified diversion ledger, and community benchmarks.
          </p>
        </div>

        <button
          onMouseEnter={() => sound.playHover()}
          onClick={() => {
            sound.playClick();
            fetchStats();
          }}
          disabled={isLoading}
          className="cred-button-secondary px-5 py-2.5 text-xs font-mono font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH LEDGER</span>
        </button>
      </div>

      {/* 2. Top Level KPI Portfolio */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="TOTAL WASTE SCANNED"
            value={`${stats.total_items_detected || 127} items`}
            subtitle={`${stats.total_scans || 58} diagnostic sessions executed`}
            icon={Activity}
            colorHex="#10B981"
            trend="+18% purity"
          />

          <StatsCard
            title="CORRECTLY SEGREGATED"
            value={`${stats.recyclable_percentage || 94}%`}
            subtitle="Verified zero-contamination rate"
            icon={ShieldCheck}
            colorHex="#10B981"
            trend="ELITE TIER"
          />

          <StatsCard
            title="RECYCLABLE IDENTIFIED"
            value={`${((stats.recyclable_count || 48) * 0.38).toFixed(1)} kg`}
            subtitle={`${stats.recyclable_count || 48} items routed to material recovery`}
            icon={Recycle}
            colorHex="#3B82F6"
            trend="HIGH RECOVERY"
          />

          <StatsCard
            title="LANDFILL DIVERSION"
            value={`${((stats.total_items_detected || 127) * 0.25).toFixed(1)} kg`}
            subtitle="Direct avoidance of municipal landfilling"
            icon={Zap}
            colorHex="#D4AF37"
            trend="VERIFIED DIVERSION"
          />
        </div>
      )}

      {/* 3. GAMIFICATION & IMPACT REWARDS VAULT */}
      <section className="w-full text-left">
        <div className="cred-card p-6 sm:p-10 border border-white/[0.12] relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                [ VERIFIED CITIZEN SCORE ]
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tighter">
                  8,420
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">IMPACT SCORE</span>
              </div>
              <p className="text-xs text-[#8C8C87] mt-2 max-w-lg leading-relaxed">
                You have prevented approximately <strong className="text-white">31.7 kg</strong> of mixed recyclable contaminants from entering municipal landfills.
              </p>
            </div>

            {/* Elite Badge */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] lg:self-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8C87] block">
                  COMMUNITY TIER
                </span>
                <span className="text-sm font-black text-white tracking-tight">
                  CARBON GUARDIAN • TOP 3%
                </span>
              </div>
            </div>
          </div>

          {/* Achievement Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">UNLOCKED</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">FIRST 10</h4>
                <p className="text-[11px] text-[#8C8C87] mt-1">10 correctly segregated items</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-[#CCCCCC]">
                REWARD: +250 PTS
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">ACTIVE STREAK</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">ZERO MIX</h4>
                <p className="text-[11px] text-[#8C8C87] mt-1">7 consecutive days of zero contamination</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-[#CCCCCC]">
                REWARD: 1.5X MULTIPLIER
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">UNLOCKED</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">RECYCLER</h4>
                <p className="text-[11px] text-[#8C8C87] mt-1">50 high-purity dry recyclables verified</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-[#CCCCCC]">
                REWARD: +750 PTS
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">UNLOCKED</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">WASTE WARRIOR</h4>
                <p className="text-[11px] text-[#8C8C87] mt-1">100 total successful classifications</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-[#CCCCCC]">
                REWARD: GOLD BADGE
              </div>
            </div>

          </div>

          {/* CRED-Style Mystery Eco-Perks Reward Vault */}
          <div className="mt-10 pt-8 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Unlocked Citizen Perks Vault
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#8C8C87] uppercase">
                CRED × SUSTAINABILITY PARTNERS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {perks.map((perk) => (
                <div
                  key={perk.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    perk.isClaimed
                      ? 'bg-gradient-to-b from-[#181818] to-[#0E0E0E] border-white/25 shadow-2xl'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 font-mono">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${perk.color}15`, color: perk.color }}>
                        {perk.tag}
                      </span>
                      <span className="text-[10px] text-[#8C8C87]">{perk.brand}</span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-2 leading-snug">{perk.title}</h5>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/[0.06]">
                    {perk.isClaimed ? (
                      <div className="flex items-center justify-between gap-2 font-mono">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider truncate">
                          {perk.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(perk.code, perk.id)}
                          className="cred-button-secondary px-3 py-1 text-[10px] flex items-center gap-1 font-bold text-white"
                        >
                          {copiedId === perk.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === perk.id ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onMouseEnter={() => sound.playHover()}
                        onClick={() => handleClaimPerk(perk.id)}
                        className="w-full cred-button-primary py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Tap to Reveal Code</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4. Analytics Visualizations Grid */}
      {stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Category Distribution */}
          <div className="cred-card p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#525252] block mb-0.5">TELEMETRY 01</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-400" />
                  Waste Category Distribution
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#8C8C87]">9 STREAMS</span>
            </div>
            <CategoryPieChart data={stats.category_distribution} />
          </div>

          {/* Chart 2: Recyclable vs Landfill Ratio */}
          <div className="cred-card p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#525252] block mb-0.5">TELEMETRY 02</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-emerald-400" />
                  Purity vs Residual Landfill Ratio
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">HIGH PURITY</span>
            </div>
            <RecyclableDonutChart
              recyclableCount={stats.recyclable_count}
              nonRecyclableCount={stats.non_recyclable_count}
            />
          </div>

          {/* Chart 3: Daily Trend Area Chart */}
          <div className="cred-card p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#525252] block mb-0.5">TELEMETRY 03</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Weekly Classification Volume
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#8C8C87]">DAILY TEMPORAL</span>
            </div>
            <DailyTrendsAreaChart data={stats.daily_trends} />
          </div>

          {/* Chart 4: Confidence Score Histogram */}
          <div className="cred-card p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#525252] block mb-0.5">TELEMETRY 04</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Detection Confidence Histogram
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">87.1% AVG mAP</span>
            </div>
            <ConfidenceHistChart data={stats.confidence_histogram} />
          </div>

        </div>
      ) : (
        <div className="cred-card p-16 flex flex-col items-center justify-center text-center text-[#8C8C87]">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <p className="text-sm font-bold text-white font-mono uppercase tracking-wider">Loading Material Ledger...</p>
        </div>
      )}

      {/* 5. Community & Campus Leaderboard */}
      <section className="w-full text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#525252] block mb-1">
              [ COLLECTIVE RECOVERY ]
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Community Benchmarks
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full font-mono text-xs">
            {(['PERSONAL', 'CAMPUS', 'SOCIETY', 'CITY'] as const).map((tab) => (
              <button
                key={tab}
                onMouseEnter={() => sound.playHover()}
                onClick={() => {
                  sound.playClick();
                  setLeaderboardScope(tab);
                }}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  leaderboardScope === tab ? 'bg-white text-black' : 'text-[#8C8C87] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="cred-card p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/[0.08] font-mono">
            <div>
              <span className="text-[11px] text-[#525252] uppercase block">ENTITIES LOGGED</span>
              <span className="text-xl font-bold text-white mt-1 block">42 Active Hubs</span>
            </div>
            <div>
              <span className="text-[11px] text-[#525252] uppercase block">CAMPUS LEADER</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">KIIT Campus #01</span>
            </div>
            <div>
              <span className="text-[11px] text-[#525252] uppercase block">TOTAL RECOVERED</span>
              <span className="text-xl font-bold text-white mt-1 block">18.4 TONNES</span>
            </div>
            <div>
              <span className="text-[11px] text-[#525252] uppercase block">REGIONAL PURITY</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">91.2% PURITY</span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold">#01</span>
                <div>
                  <span className="text-white font-sans font-bold block">KIIT International Hostel Block C</span>
                  <span className="text-[10px] text-[#8C8C87]">1,420 items verified • 0.8% contamination</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-sm">94% PURITY</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-bold">#02</span>
                <div>
                  <span className="text-white font-sans font-bold block">Campus 6 Research Labs & Cafeteria</span>
                  <span className="text-[10px] text-[#8C8C87]">980 items verified • 2.1% contamination</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-sm">89% PURITY</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-4">
                <span className="text-white/40 font-bold">#03</span>
                <div>
                  <span className="text-white font-sans font-bold block">Main Administrative Complex</span>
                  <span className="text-[10px] text-[#8C8C87]">740 items verified • 3.4% contamination</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-sm">82% PURITY</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
