'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  Award,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { ImpactSummary, generateCertificateHash } from '../lib/carbon-calculator';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  impact: ImpactSummary;
  recipientName: string;
  setRecipientName: (name: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  impact,
  recipientName,
  setRecipientName
}) => {
  const [copied, setCopied] = useState(false);
  const [certId, setCertId] = useState('ECO-849201');
  const [certDate, setCertDate] = useState('November 4, 2026');

  useEffect(() => {
    setCertId(`ECO-${Math.floor(100000 + Math.random() * 900000)}`);
    setCertDate(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );
  }, []);

  const certHash = generateCertificateHash(
    recipientName || 'ANONYMOUS ECO CITIZEN',
    certDate,
    impact.co2OffsetKg,
    certId
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Obsidian Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 2400, 1400);
    bgGrad.addColorStop(0, '#060B08');
    bgGrad.addColorStop(0.5, '#0A0F0D');
    bgGrad.addColorStop(1, '#050706');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2400, 1400);

    // Outer Luxury Gold & Emerald Borders
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 60, 2280, 1280);

    ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 80, 2240, 1240);

    // Corner Ornaments
    const drawCorner = (x: number, y: number) => {
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(100, 100);
    drawCorner(2300, 100);
    drawCorner(100, 1300);
    drawCorner(2300, 1300);

    // Watermark Emblem in Background
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(1200, 700, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Top Category Tag
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ECOSORT AI • AUTONOMOUS WASTE INTELLIGENCE', 1200, 180);

    // Title
    ctx.fillStyle = '#F5F5F0';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('CIRCULAR CITIZEN SUSTAINABILITY CERTIFICATE', 1200, 260);

    // Subtitle
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '500 30px sans-serif';
    ctx.fillText('OFFICIAL AUDIT & EMBODIED CARBON ABATEMENT RECORD', 1200, 310);

    // Divider Line
    const divGrad = ctx.createLinearGradient(600, 0, 1800, 0);
    divGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
    divGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.8)');
    divGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = divGrad;
    ctx.fillRect(500, 345, 1400, 4);

    // Presentation text
    ctx.fillStyle = '#D1D5DB';
    ctx.font = '400 32px sans-serif';
    ctx.fillText('This document verifies and certifies that', 1200, 420);

    // Recipient Name
    ctx.fillStyle = '#6EE7B7';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(recipientName.toUpperCase() || 'CIRCULAR STEWARD', 1200, 500);

    // Description text
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '300 28px sans-serif';
    ctx.fillText('has successfully segregated materials through autonomous computer-vision sorting,', 1200, 560);
    ctx.fillText('diverting critical waste streams from municipal landfills into closed-loop circular supply chains.', 1200, 605);

    // Metrics Box Containers
    const drawMetric = (x: number, y: number, w: number, h: number, val: string, unit: string, label: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + w / 2, y + 70);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(unit, x + w / 2, y + 105);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(label, x + w / 2, y + 145);
    };

    drawMetric(260, 680, 420, 180, `${impact.co2OffsetKg}`, 'KG CO2e', 'Embodied Emissions Abated');
    drawMetric(740, 680, 420, 180, `${impact.energySavedKwh}`, 'KILOWATT-HOURS', 'Grid Energy Preserved');
    drawMetric(1220, 680, 420, 180, `${impact.waterSavedLiters}`, 'LITRES', 'Freshwater Conserved');
    drawMetric(1700, 680, 420, 180, `${impact.totalItems}`, 'ITEMS DIVERTED', 'Landfill Segregations');

    // Equivalency Highlight
    ctx.fillStyle = '#34D399';
    ctx.font = '600 26px monospace';
    ctx.fillText(
      `ECOLOGICAL EQUIVALENT: ${impact.carKmOffset} KM DRIVING OFFSET • ${impact.smartphoneCharges.toLocaleString()} PHONE CHARGES • ${impact.treesSaved} TREES`,
      1200,
      930
    );

    // Bottom verification section
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7280';
    ctx.font = '22px monospace';
    ctx.fillText(`CERTIFICATE ID: ${certId}`, 260, 1150);
    ctx.fillText(`ISSUED DATE: ${certDate}`, 260, 1190);
    ctx.fillText(`VERIFICATION HASH: ${certHash}`, 260, 1230);

    // Signature Area
    ctx.textAlign = 'right';
    ctx.fillStyle = '#F5F5F0';
    ctx.font = 'italic bold 32px serif';
    ctx.fillText('EcoSort AI Verification Board', 2120, 1160);

    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1720, 1180);
    ctx.lineTo(2140, 1180);
    ctx.stroke();

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '20px sans-serif';
    ctx.fillText('US EPA WARM v15 Standards Compliant', 2120, 1215);
    ctx.fillText('Autonomous Vision & Material Audit Protocol', 2120, 1245);

    // Convert to PNG and download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `EcoSort_Sustainability_Certificate_${certId}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#090C0A] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-[#F5F5F0] overflow-hidden my-8">
        
        {/* Glow ambient background accent */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top controls */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Official Sustainability Certificate
              </h2>
              <p className="text-[11px] font-mono text-[#8C8C87]">Verified Circular Material Milestone</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center text-[#8C8C87] hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editable Name Bar */}
        <div className="my-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="text-xs font-mono text-[#A3A39E] shrink-0">
            Certificate Issued To:
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Enter Student / Group / Campus Name"
            className="w-full sm:max-w-md bg-black/60 border border-white/[0.15] focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white font-medium outline-none transition-all"
          />
        </div>

        {/* The Certificate Preview Canvas / Card */}
        <div 
          id="certificate-print-area"
          className="relative bg-gradient-to-b from-[#0A100D] via-[#080B09] to-[#050806] border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-10 shadow-inner overflow-hidden text-center"
        >
          {/* Inner Golden border */}
          <div className="absolute inset-2 sm:inset-3 border border-amber-500/20 rounded-xl pointer-events-none" />

          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            EcoSort AI • Circular Verification Registry
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            Circular Citizen Sustainability Certificate
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8C87] mt-1 font-medium">
            Embodied Carbon Abatement & Resource Conservation Record
          </p>

          <div className="w-24 h-0.5 bg-emerald-500/50 mx-auto my-6" />

          <p className="text-xs text-[#A3A39E]">This is officially awarded to</p>
          <p className="text-2xl sm:text-4xl font-black text-emerald-300 tracking-tight mt-1 font-serif uppercase">
            {recipientName || 'Circular Citizen'}
          </p>
          <p className="text-xs sm:text-sm text-[#8C8C87] max-w-xl mx-auto mt-2 leading-relaxed">
            In recognition of exemplary commitment toward waste reduction, closed-loop circular economy,
            and precise automated segregation compliant with US EPA WARM v15 standards.
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/20">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
                {impact.co2OffsetKg}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#A3A39E] uppercase">
                kg CO₂e Abated
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/20">
              <span className="text-xl sm:text-2xl font-black text-teal-400 block font-mono">
                {impact.energySavedKwh}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#A3A39E] uppercase">
                kWh Energy Saved
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/20">
              <span className="text-xl sm:text-2xl font-black text-cyan-400 block font-mono">
                {impact.waterSavedLiters}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#A3A39E] uppercase">
                Liters Water Saved
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/20">
              <span className="text-xl sm:text-2xl font-black text-amber-400 block font-mono">
                {impact.totalItems}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#A3A39E] uppercase">
                Items Diverted
              </span>
            </div>
          </div>

          {/* Equivalency text */}
          <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-[11px] font-mono text-emerald-300 max-w-xl mx-auto">
            Equivalent to {impact.carKmOffset} km gasoline driving offset • {impact.smartphoneCharges.toLocaleString()} smartphone full charges
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-left text-[11px] font-mono text-[#666666] gap-4">
            <div>
              <p>CERTIFICATE ID: <span className="text-[#A3A39E] font-bold">{certId}</span></p>
              <p>ISSUED DATE: <span className="text-[#A3A39E]">{certDate}</span></p>
              <p className="flex items-center gap-1">
                HASH: <span className="text-emerald-500/80 truncate max-w-xs">{certHash}</span>
                <button onClick={handleCopyHash} className="hover:text-white" title="Copy Hash">
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-serif font-bold text-white italic">EcoSort AI Systems</p>
              <p className="text-[10px] text-[#8C8C87]">Verified Machine Learning Audit Protocol</p>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={handleCopyHash}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hash Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Verification Hash</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Download Ultra-HD PNG</span>
          </button>
        </div>

      </div>
    </div>
  );
};
