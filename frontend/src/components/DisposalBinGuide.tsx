import React from 'react';
import { Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react';

const BIN_GUIDELINES = [
  {
    category: 'Plastic',
    binName: 'Plastic Recycling Bin',
    badge: 'Blue Bin',
    colorHex: '#2563eb',
    examples: 'PET bottles, shampoo containers, clean food tubs, milk jugs',
    notAccepted: 'Greasy plastic, cling wrap, multi-layer metallic bags',
    prepTip: 'Empty liquid, rinse residue, and crush container.'
  },
  {
    category: 'Paper',
    binName: 'Paper & Newsprint Bin',
    badge: 'Sky Blue Bin',
    colorHex: '#0284c7',
    examples: 'Newspapers, office printing paper, magazines, envelopes, books',
    notAccepted: 'Wax-coated paper, thermal receipts, tissue paper',
    prepTip: 'Keep completely dry; remove metallic binder clips.'
  },
  {
    category: 'Cardboard',
    binName: 'Corrugated Cardboard Bin',
    badge: 'Yellow/Amber Bin',
    colorHex: '#d97706',
    examples: 'Shipping boxes, packaging cartons, clean cereal boxes',
    notAccepted: 'Oil-soaked pizza box bottoms, wax cartons',
    prepTip: 'Flatten boxes completely and remove plastic tape.'
  },
  {
    category: 'Glass',
    binName: 'Glass Recycling Bank',
    badge: 'Teal Bin',
    colorHex: '#0d9488',
    examples: 'Soda bottles, wine bottles, pickle jars, sauce containers',
    notAccepted: 'Ceramics, light bulbs, window panes, Pyrex ovenware',
    prepTip: 'Gently rinse; remove metal caps to recycle separately.'
  },
  {
    category: 'Metal',
    binName: 'Metals & Cans Bin',
    badge: 'Slate Gray Bin',
    colorHex: '#64748b',
    examples: 'Soda cans, vegetable tins, aluminium foil, metal jar lids',
    notAccepted: 'Pressurized full paint cans, propane tanks, wires',
    prepTip: 'Rinse food traces and drain completely.'
  },
  {
    category: 'Organic',
    binName: 'Organic Compost Bin',
    badge: 'Green Bin',
    colorHex: '#16a34a',
    examples: 'Fruit peels, vegetable trimmings, coffee grounds, garden scraps',
    notAccepted: 'Plastic stickers on fruit, plastic packaging, meat bones',
    prepTip: 'Remove barcode stickers before composting.'
  },
  {
    category: 'E-Waste',
    binName: 'Electronic Drop-off Kiosk',
    badge: 'Orange Bin / Kiosk',
    colorHex: '#ea580c',
    examples: 'Smartphones, cables, circuit boards, batteries, power supplies',
    notAccepted: 'Standard trash bags; never dispose in home garbage',
    prepTip: 'Tape battery contacts and wipe personal data.'
  },
  {
    category: 'Hazardous Waste',
    binName: 'Hazardous Materials Depot',
    badge: 'Red Hazard Bin',
    colorHex: '#dc2626',
    examples: 'Aerosol cans, paint thinners, engine oil, medical sharps',
    notAccepted: 'Never pour down domestic sinks or standard bins',
    prepTip: 'Keep in original sealed container and consult facility.'
  },
  {
    category: 'Other/Unknown',
    binName: 'General Residual Landfill',
    badge: 'Black Bin',
    colorHex: '#334155',
    examples: 'Sanitary waste, broken composite items, multi-material laminates',
    notAccepted: 'Clean recyclables or hazardous chemicals',
    prepTip: 'Bag tightly to avoid littering and animal foraging.'
  }
];

export const DisposalBinGuide: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Universal Waste Segregation Bin Guidelines
          </h3>
          <p className="text-xs text-slate-400">
            Standard municipal color-coding specifications and preparation requirements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {BIN_GUIDELINES.map((item) => (
          <div
            key={item.category}
            className="flex flex-col p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
          >
            {/* Top Bin Header */}
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: item.colorHex }}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{item.category}</h4>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${item.colorHex}15`,
                    color: item.colorHex,
                  }}
                >
                  {item.badge}
                </span>
              </div>
            </div>

            {/* Acceptable items */}
            <div className="text-xs space-y-1.5 mt-1 text-slate-300">
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-eco-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">Examples:</strong> {item.examples}
                </span>
              </div>

              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">Avoid:</strong> {item.notAccepted}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-eco-300 font-medium">
                Tip: {item.prepTip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
