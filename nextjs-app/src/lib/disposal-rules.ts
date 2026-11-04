import { DisposalInfo, CategoryMetadata } from '../types';

export const SUPPORTED_CATEGORIES = [
  'Plastic',
  'Paper',
  'Cardboard',
  'Glass',
  'Metal',
  'Organic',
  'E-Waste',
  'Hazardous Waste',
  'Other/Unknown',
];

export const CATEGORY_METADATA: Record<string, CategoryMetadata & { default_instructions: string[]; default_disposal_method: string }> = {
  Plastic: {
    category: 'Plastic',
    recyclable: true,
    recyclability_type: 'Recyclable',
    recommended_bin: 'Plastic Recycling Bin',
    bin_color_hex: '#2563EB',
    bin_badge: 'Blue Bin',
    default_disposal_method: 'Recycle in dry mixed recyclables or dedicated plastics container.',
    instructions: [
      'Empty any remaining liquid or residue.',
      'Rinse thoroughly with cold water.',
      'Crush container to save volume if possible.',
      'Place in designated blue recycling bin.'
    ],
    default_instructions: [
      'Empty any remaining liquid or residue.',
      'Rinse thoroughly with cold water.',
      'Crush container to save volume if possible.',
      'Place in designated blue recycling bin.'
    ],
    hazard_level: 'None',
    eco_tip: 'Recycling 1 ton of plastic saves approx. 5,774 kWh of energy and 16.3 barrels of oil.'
  },
  Paper: {
    category: 'Paper',
    recyclable: true,
    recyclability_type: 'Recyclable',
    recommended_bin: 'Paper & Cardboard Bin',
    bin_color_hex: '#0284C7',
    bin_badge: 'Blue/Yellow Bin',
    default_disposal_method: 'Recycle in dry paper recycling bin.',
    instructions: [
      'Ensure paper is clean and dry (greasy paper is non-recyclable).',
      'Remove plastic sleeves or metallic clips.',
      'Flatten sheets and place in paper bin.'
    ],
    default_instructions: [
      'Ensure paper is clean and dry (greasy paper is non-recyclable).',
      'Remove plastic sleeves or metallic clips.',
      'Flatten sheets and place in paper bin.'
    ],
    hazard_level: 'None',
    eco_tip: 'Recycling paper uses 70% less energy and water than making new paper from trees.'
  },
  Cardboard: {
    category: 'Cardboard',
    recyclable: true,
    recyclability_type: 'Recyclable',
    recommended_bin: 'Paper & Cardboard Bin',
    bin_color_hex: '#D97706',
    bin_badge: 'Yellow/Brown Bin',
    default_disposal_method: 'Recycle with corrugated paper materials.',
    instructions: [
      'Flatten and break down boxes to conserve space.',
      'Remove excessive adhesive packing tape and styrofoam.',
      'Keep dry; do not compost greasy food-soiled pizza cardboard.'
    ],
    default_instructions: [
      'Flatten and break down boxes to conserve space.',
      'Remove excessive adhesive packing tape and styrofoam.',
      'Keep dry; do not compost greasy food-soiled pizza cardboard.'
    ],
    hazard_level: 'None',
    eco_tip: 'Cardboard can be recycled 5 to 7 times before the wood fibers become too short.'
  },
  Glass: {
    category: 'Glass',
    recyclable: true,
    recyclability_type: 'Recyclable',
    recommended_bin: 'Glass Collection Bin',
    bin_color_hex: '#0D9488',
    bin_badge: 'Teal Bin',
    default_disposal_method: 'Recycle in dedicated glass drop-off bank or curb bin.',
    instructions: [
      'Empty and gently rinse containers.',
      'Remove metal or plastic screw caps (recycle them separately).',
      'Do not mix ceramics, Pyrex, or window panes with container glass.'
    ],
    default_instructions: [
      'Empty and gently rinse containers.',
      'Remove metal or plastic screw caps (recycle them separately).',
      'Do not mix ceramics, Pyrex, or window panes with container glass.'
    ],
    hazard_level: 'Low',
    eco_tip: 'Glass is 100% recyclable and can be recycled endlessly without loss in quality or purity.'
  },
  Metal: {
    category: 'Metal',
    recyclable: true,
    recyclability_type: 'Recyclable',
    recommended_bin: 'Metal & Cans Bin',
    bin_color_hex: '#64748B',
    bin_badge: 'Gray Bin',
    default_disposal_method: 'Recycle in mixed dry metals container.',
    instructions: [
      'Rinse food and beverage remnants.',
      'Do not crush aerosol cans (ensure completely discharged).',
      'Place clean tin cans, soda cans, and aluminium foil in the metal bin.'
    ],
    default_instructions: [
      'Rinse food and beverage remnants.',
      'Do not crush aerosol cans (ensure completely discharged).',
      'Place clean tin cans, soda cans, and aluminium foil in the metal bin.'
    ],
    hazard_level: 'None',
    eco_tip: 'Recycling an aluminium can saves 95% of the energy required to produce one from bauxite ore.'
  },
  Organic: {
    category: 'Organic',
    recyclable: true,
    recyclability_type: 'Compostable',
    recommended_bin: 'Organic Compost Bin',
    bin_color_hex: '#16A34A',
    bin_badge: 'Green Bin',
    default_disposal_method: 'Dispose in municipal compost or private composting pit.',
    instructions: [
      'Remove any plastic stickers from fruit and vegetable peels.',
      'Do not include plastic packaging or twist ties.',
      'Transfer directly to green organic collection bin.'
    ],
    default_instructions: [
      'Remove any plastic stickers from fruit and vegetable peels.',
      'Do not include plastic packaging or twist ties.',
      'Transfer directly to green organic collection bin.'
    ],
    hazard_level: 'None',
    eco_tip: 'Composting organic matter diverts methane emissions from landfills and replenishes soil minerals.'
  },
  'E-Waste': {
    category: 'E-Waste',
    recyclable: true,
    recyclability_type: 'Special Recycling',
    recommended_bin: 'E-Waste / Electronic Collection Point',
    bin_color_hex: '#EA580C',
    bin_badge: 'Orange Bin / Drop-off',
    default_disposal_method: 'Hand over to authorized electronic waste recyclers or municipal drop-off centers.',
    instructions: [
      'NEVER throw electronics or batteries in general household waste.',
      'Backup and wipe any personal data if applicable.',
      'Cover lithium battery terminals with electrical tape to prevent short circuits.',
      'Drop off at certified e-waste collection center.'
    ],
    default_instructions: [
      'NEVER throw electronics or batteries in general household waste.',
      'Backup and wipe any personal data if applicable.',
      'Cover lithium battery terminals with electrical tape to prevent short circuits.',
      'Drop off at certified e-waste collection center.'
    ],
    hazard_level: 'Moderate',
    eco_tip: 'E-waste contains precious rare metals (gold, copper, lithium) that cause severe toxic pollution if landfilled.'
  },
  'Hazardous Waste': {
    category: 'Hazardous Waste',
    recyclable: false,
    recyclability_type: 'Hazardous',
    recommended_bin: 'Hazardous Waste Facility',
    bin_color_hex: '#DC2626',
    bin_badge: 'Red Hazard Bin',
    default_disposal_method: 'Segregate strictly and transport to official Hazardous Material Facility.',
    instructions: [
      'Keep in original container with visible labels if possible.',
      'Do not mix chemical residues or puncture pressurized containers.',
      'Store in cool, well-ventilated location away from children and pets.',
      'Contact municipal hazardous materials intake service.'
    ],
    default_instructions: [
      'Keep in original container with visible labels if possible.',
      'Do not mix chemical residues or puncture pressurized containers.',
      'Store in cool, well-ventilated location away from children and pets.',
      'Contact municipal hazardous materials intake service.'
    ],
    hazard_level: 'High',
    eco_tip: 'Hazardous materials leach corrosive acids, heavy metals, and carcinogens into groundwater if discarded incorrectly.'
  },
  'Other/Unknown': {
    category: 'Other/Unknown',
    recyclable: false,
    recyclability_type: 'Non-Recyclable',
    recommended_bin: 'General Landfill Bin',
    bin_color_hex: '#1E293B',
    bin_badge: 'Black Bin',
    default_disposal_method: 'Dispose in non-recyclable residual municipal waste.',
    instructions: [
      'Check local municipality portal if the specific material can be upcycled.',
      'Bag tightly to prevent littering and pest attraction.',
      'Place in general residual waste bin.'
    ],
    default_instructions: [
      'Check local municipality portal if the specific material can be upcycled.',
      'Bag tightly to prevent littering and pest attraction.',
      'Place in general residual waste bin.'
    ],
    hazard_level: 'Low',
    eco_tip: 'Reducing single-use non-recyclable goods is the most effective approach to shrinking municipal landfill mass.'
  }
};

export const ITEM_SPECIFIC_OVERRIDES: Record<string, Partial<DisposalInfo> & { category?: string }> = {
  'plastic bottle': {
    category: 'Plastic',
    recyclable: true,
    disposal_method: 'Rinse, crush, and recycle with PET plastics.',
    handling_instructions: [
      'Rinse bottle to eliminate sugar or milk residue.',
      'Re-attach the plastic cap so it gets recycled together.',
      'Crush body to reduce bin bulk.',
      'Deposit in Blue Recycling Bin.'
    ],
    eco_tip: 'PET bottles can be spun into recycled polyester fleece jackets and carpets.'
  },
  battery: {
    category: 'E-Waste',
    recyclable: true,
    recyclability_type: 'Hazardous E-Waste',
    recommended_bin: 'Dedicated Battery Collection Tube',
    bin_color_hex: '#EA580C',
    bin_badge: 'Orange Bin',
    disposal_method: 'Drop off at dedicated battery recycling kiosk.',
    handling_instructions: [
      'NEVER discard in household trash — severe fire risk.',
      'Tape positive and negative terminals with non-conductive tape.',
      'Deposit in battery bins located in supermarkets, libraries, or e-waste centers.'
    ],
    hazard_level: 'High',
    eco_tip: 'Lead, cadmium, and lithium from discarded batteries contaminate soil and drinking water.'
  },
  'cell phone': {
    category: 'E-Waste',
    recyclable: true,
    recyclability_type: 'Special Recycling',
    recommended_bin: 'Electronics Recycling Center',
    bin_color_hex: '#EA580C',
    bin_badge: 'Orange Drop-off',
    disposal_method: 'Take to authorized e-waste buyback or trade-in program.',
    handling_instructions: [
      'Perform factory reset and remove SIM/SD cards.',
      'Do not dismantle or pierce the internal lithium-ion battery.',
      'Deposit at certified e-waste drop-off counter.'
    ],
    hazard_level: 'Moderate',
    eco_tip: '1 million recycled mobile phones yield 35,000 lbs of copper and 75 lbs of gold.'
  },
  can: {
    category: 'Metal',
    recyclable: true,
    recommended_bin: 'Metal & Cans Bin',
    bin_color_hex: '#64748B',
    bin_badge: 'Gray Bin',
    disposal_method: 'Empty liquid, rinse, and place in metal recycling bin.',
    handling_instructions: [
      'Ensure can is completely drained of liquid.',
      'Crush horizontally if safe to conserve space.',
      'Place in Gray Metal & Cans Bin.'
    ],
    eco_tip: 'An aluminium can can be recycled and returned to the supermarket shelf in just 60 days.'
  },
  'aluminium beverage can': {
    category: 'Metal',
    recyclable: true,
    recommended_bin: 'Metal & Cans Bin',
    bin_color_hex: '#64748B',
    bin_badge: 'Gray Bin',
    disposal_method: 'Empty liquid, rinse lightly, and place in designated metal recycling bin.',
    handling_instructions: [
      'Empty any remaining beverage liquid completely.',
      'Rinse lightly to prevent mold and insect attraction.',
      'Crush can horizontally if safe to conserve recycling bin capacity.',
      'Place in Gray Metal & Cans Bin.'
    ],
    hazard_level: 'None',
    eco_tip: 'Aluminium is infinitely recyclable; recycling an aluminium can saves 95% of the energy needed to make a new one.'
  },
  'soda can': {
    category: 'Metal',
    recyclable: true,
    recommended_bin: 'Metal & Cans Bin',
    bin_color_hex: '#64748B',
    bin_badge: 'Gray Bin',
    disposal_method: 'Empty liquid, rinse lightly, and place in designated metal recycling bin.',
    handling_instructions: [
      'Empty any remaining beverage liquid completely.',
      'Rinse lightly to prevent mold and insect attraction.',
      'Crush can horizontally if safe to conserve recycling bin capacity.',
      'Place in Gray Metal & Cans Bin.'
    ],
    hazard_level: 'None',
    eco_tip: 'Aluminium cans are returned to store shelves as newly recycled cans in as little as 60 days.'
  },
  'cardboard box': {
    category: 'Cardboard',
    recyclable: true,
    disposal_method: 'Flatten and place in dry cardboard recycling bin.',
    handling_instructions: [
      'Remove all plastic bubble wrap and styrofoam fillers.',
      'Flatten box completely.',
      'Keep dry and place in cardboard recycling container.'
    ],
    eco_tip: 'Recycling corrugated boxes saves 9 cubic yards of landfill space per ton.'
  },
  'pizza box': {
    category: 'Cardboard',
    recyclable: false,
    recyclability_type: 'Conditional / Compostable',
    recommended_bin: 'Organic Bin or Split Disposal',
    bin_color_hex: '#16A34A',
    bin_badge: 'Green / Black Bin',
    disposal_method: 'Tear clean top lid into Cardboard Bin; put grease-soaked bottom in Compost or Trash.',
    handling_instructions: [
      'Inspect the box for grease and melted cheese.',
      'The clean top lid can be ripped off and recycled with cardboard.',
      'The greasy bottom cannot be recycled by paper mills — compost or put in trash.'
    ],
    hazard_level: 'None',
    eco_tip: 'Food oil and grease bind to paper fibers and ruin entire batches of recycled paper pulp.'
  },
  banana: {
    category: 'Organic',
    recyclable: true,
    recyclability_type: 'Compostable',
    recommended_bin: 'Organic Compost Bin',
    bin_color_hex: '#16A34A',
    bin_badge: 'Green Bin',
    disposal_method: 'Compost in green municipal bin or backyard compost pile.',
    handling_instructions: [
      'Remove price stickers.',
      'Place in green compost bin or organic waste container.'
    ],
    eco_tip: 'Banana peels decompose in 2-4 weeks in proper compost, enriching the soil with potassium.'
  },
  apple: {
    category: 'Organic',
    recyclable: true,
    recyclability_type: 'Compostable',
    recommended_bin: 'Organic Compost Bin',
    bin_color_hex: '#16A34A',
    bin_badge: 'Green Bin',
    disposal_method: 'Compost in organic bin.',
    handling_instructions: [
      'Remove barcode stickers.',
      'Deposit in organic compost stream.'
    ],
    eco_tip: 'Apple cores and fruit waste turn into nutrient-dense humus within 1 to 2 months.'
  }
};

export class DisposalRulesService {
  static getRecommendation(label: string, category: string): DisposalInfo {
    const normalizedLabel = label.toLowerCase().trim();
    const standardCategory = category.trim();

    if (normalizedLabel in ITEM_SPECIFIC_OVERRIDES) {
      const itemData = ITEM_SPECIFIC_OVERRIDES[normalizedLabel];
      const targetCat = itemData.category || standardCategory;
      const catDefaults = CATEGORY_METADATA[targetCat] || CATEGORY_METADATA['Other/Unknown'];

      return {
        recyclable: itemData.recyclable ?? catDefaults.recyclable,
        recyclability_type: itemData.recyclability_type ?? catDefaults.recyclability_type,
        recommended_bin: itemData.recommended_bin ?? catDefaults.recommended_bin,
        bin_color_hex: itemData.bin_color_hex ?? catDefaults.bin_color_hex,
        bin_badge: itemData.bin_badge ?? catDefaults.bin_badge,
        disposal_method: itemData.disposal_method ?? catDefaults.default_disposal_method,
        handling_instructions: itemData.handling_instructions ?? catDefaults.default_instructions,
        hazard_level: itemData.hazard_level ?? catDefaults.hazard_level,
        eco_tip: itemData.eco_tip ?? catDefaults.eco_tip
      };
    }

    const catMeta = CATEGORY_METADATA[standardCategory] || CATEGORY_METADATA['Other/Unknown'];

    return {
      recyclable: catMeta.recyclable,
      recyclability_type: catMeta.recyclability_type,
      recommended_bin: catMeta.recommended_bin,
      bin_color_hex: catMeta.bin_color_hex,
      bin_badge: catMeta.bin_badge,
      disposal_method: catMeta.default_disposal_method,
      handling_instructions: catMeta.default_instructions,
      hazard_level: catMeta.hazard_level,
      eco_tip: catMeta.eco_tip
    };
  }

  static getAllCategories(): CategoryMetadata[] {
    return Object.values(CATEGORY_METADATA).map(meta => ({
      category: meta.category,
      recyclable: meta.recyclable,
      recyclability_type: meta.recyclability_type,
      recommended_bin: meta.recommended_bin,
      bin_color_hex: meta.bin_color_hex,
      bin_badge: meta.bin_badge,
      default_disposal_method: meta.default_disposal_method,
      instructions: meta.instructions,
      hazard_level: meta.hazard_level,
      eco_tip: meta.eco_tip
    }));
  }
}
