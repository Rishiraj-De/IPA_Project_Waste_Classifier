'use client';
import React from 'react';
import { Trash2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const BIN_GUIDELINES = [
  {
    category: 'Plastic Polymers',
    binName: 'Thermoplastic Recovery',
    badge: 'BLUE STREAM',
    colorHex: '#3B82F6',
    examples: 'PET bottles, HDPE containers, clean food tubs, milk jugs',
    notAccepted: 'Greasy plastic, multi-layer metallic MLP pouches, cling film',
    prepTip: 'Empty liquid, rinse residue, and flatten container.'
  },
  {
    category: 'Paper & Newsprint',
    binName: 'Fibre Pulp Stream',
    badge: 'SKY BLUE STREAM',
    colorHex: '#0EA5E9',
    examples: 'Newspapers, office printing paper, magazines, envelopes, books',
    notAccepted: 'Wax-coated paper, thermal cash receipts, tissue napkins',
    prepTip: 'Keep completely dry; remove metallic binder clips.'
  },
  {
    category: 'Cardboard & Boxes',
    binName: 'Corrugated Fibreboard',
    badge: 'AMBER STREAM',
    colorHex: '#F59E0B',
    examples: 'Shipping boxes, packaging cartons, clean cereal boxes',
    notAccepted: 'Oil-soaked pizza boxes, wax frozen food cartons',
    prepTip: 'Flatten boxes completely and remove plastic shipping tape.'
  },
  {
    category: 'Container Glass',
    binName: 'Cullet Smelting Bank',
    badge: 'TEAL STREAM',
    colorHex: '#14B8A6',
    examples: 'Soda bottles, wine bottles, pickle jars, sauce containers',
    notAccepted: 'Ceramics, light bulbs, window panes, Pyrex ovenware',
    prepTip: 'Gently rinse; remove metal caps to recycle separately.'
  },
  {
    category: 'Metals & Cans',
    binName: 'Ferrous & Non-Ferrous',
    badge: 'SLATE STREAM',
    colorHex: '#94A3B8',
    examples: 'Soda cans, vegetable tins, aluminium foil, metal jar lids',
    notAccepted: 'Pressurized full paint cans, propane tanks, wires',
    prepTip: 'Rinse food traces and drain completely.'
  },
  {
    category: 'Organic Wet Waste',
    binName: 'Aerobic Digestion',
    badge: 'EMERALD STREAM',
    colorHex: '#10B981',
    examples: 'Fruit peels, vegetable trimmings, coffee grounds, garden scraps',
    notAccepted: 'Plastic stickers on fruit, plastic packaging, meat bones',
    prepTip: 'Remove barcode stickers before composting.'
  },
  {
    category: 'Electronic Scrap',
    binName: 'E-Waste Metallurgical',
    badge: 'PURPLE STREAM',
    colorHex: '#A855F7',
    examples: 'Smartphones, cables, circuit boards, batteries, power supplies',
    notAccepted: 'Standard trash bags; never dispose in home garbage',
    prepTip: 'Tape battery contacts and wipe personal data.'
  },
  {
    category: 'Hazardous Waste',
    binName: 'Specialized Chemical Depot',
    badge: 'CRIMSON STREAM',
    colorHex: '#EF4444',
    examples: 'Aerosol cans, paint thinners, engine oil, medical sharps',
    notAccepted: 'Never pour down domestic sinks or standard bins',
    prepTip: 'Keep in original sealed container and consult facility.'
  },
  {
    category: 'Residual Landfill',
    binName: 'Engineered Containment',
    badge: 'CHARCOAL STREAM',
    colorHex: '#525252',
    examples: 'Sanitary waste, broken composite items, multi-material laminates',
    notAccepted: 'Clean recyclables or hazardous chemicals',
    prepTip: 'Bag tightly to avoid littering and environmental release.'
  }
];

export const DisposalBinGuide: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#525252] block mb-1">
          [ MUNICIPAL COLOR DIRECTIVES ]
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Standardized Segregation Protocols
        </h3>
        <p className="text-xs text-[#8C8C87] mt-1 font-normal">
          Industrial material separation guidelines and preparation steps to ensure 100% recycling purity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BIN_GUIDELINES.map((item) => (
          <div
            key={item.category}
            className="cred-card p-5 flex flex-col justify-between text-left group"
          >
            {/* Top Bin Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.colorHex }}
                />
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{item.category}</h4>
                  <span
                    className="text-[9px] font-mono font-bold tracking-wider uppercase block opacity-80"
                    style={{ color: item.colorHex }}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Acceptable items */}
              <div className="text-xs space-y-2 mt-3 font-mono">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-[10px] mt-0.5">✓</span>
                  <span className="text-[11px] text-[#CCCCCC]">
                    <strong className="text-white font-sans">Accept:</strong> {item.examples}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold text-[10px] mt-0.5">✕</span>
                  <span className="text-[11px] text-[#8C8C87]">
                    <strong className="text-[#CCCCCC] font-sans">Avoid:</strong> {item.notAccepted}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-white/[0.06] text-[11px] text-emerald-400/90 font-mono">
              PREP: {item.prepTip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
