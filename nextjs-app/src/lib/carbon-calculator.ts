/**
 * EcoSort AI - Environmental Impact & Carbon Abatement Engine
 * Based on US EPA WARM (Waste Reduction Model v15) and IPCC greenhouse gas metrics.
 */

export interface MaterialImpactFactor {
  id: string;
  name: string;
  category: 'plastic' | 'metal' | 'paper' | 'glass' | 'organic' | 'ewaste';
  avgWeightKg: number; // Estimated average weight per single unit
  co2PerKg: number; // kg CO2e abated per kg diverted from landfill to recycling/compost
  energyKwhPerKg: number; // kWh saved per kg
  waterLitersPerKg: number; // Liters of freshwater conserved per kg
  treesPerKg?: number; // Trees preserved per kg (paper/cardboard)
  decompositionYears: number; // Natural landfill decomposition duration
  circularCycles: string; // Recyclability cycle potential
  fact: string;
}

export const MATERIAL_FACTORS: Record<string, MaterialImpactFactor> = {
  plastic: {
    id: 'plastic',
    name: 'Plastic (PET / HDPE)',
    category: 'plastic',
    avgWeightKg: 0.025, // ~25g per bottle / packaging container
    co2PerKg: 1.53,
    energyKwhPerKg: 5.70,
    waterLitersPerKg: 16.30,
    decompositionYears: 450,
    circularCycles: '2-4 Closed-loop mechanical cycles (or infinite chemical depolymerization)',
    fact: 'Recycling 1 ton of PET plastic saves 3.8 barrels of crude oil and avoids 1.5 tons of greenhouse gas emissions.'
  },
  metal: {
    id: 'metal',
    name: 'Aluminium & Tin Cans',
    category: 'metal',
    avgWeightKg: 0.015, // ~15g per beverage can
    co2PerKg: 9.13,
    energyKwhPerKg: 14.00,
    waterLitersPerKg: 26.00,
    decompositionYears: 250,
    circularCycles: 'Infinite 100% closed-loop circularity without property degradation',
    fact: 'Recycling aluminium uses 95% less energy than mining and smelting virgin bauxite ore.'
  },
  paper: {
    id: 'paper',
    name: 'Paper & Cardboard',
    category: 'paper',
    avgWeightKg: 0.040, // ~40g per sheet stack or small carton
    co2PerKg: 0.94,
    energyKwhPerKg: 4.10,
    waterLitersPerKg: 26.50,
    treesPerKg: 0.017, // ~17 trees saved per metric ton of recycled paper
    decompositionYears: 0.25, // 2-5 months
    circularCycles: '5-7 paper fibre downcycling loops',
    fact: 'Recycling 1 metric ton of paper saves 17 mature trees and 26,000 litres of clean water.'
  },
  glass: {
    id: 'glass',
    name: 'Glass Bottles & Jars',
    category: 'glass',
    avgWeightKg: 0.200, // ~200g per glass bottle
    co2PerKg: 0.31,
    energyKwhPerKg: 0.72,
    waterLitersPerKg: 4.50,
    decompositionYears: 1000000, // 1 Million years
    circularCycles: 'Infinite 100% closed-loop circularity with zero quality loss',
    fact: 'Glass never wears out or degrades chemically during remelting; 1 ton of cullet saves 1.2 tons of virgin silica.'
  },
  organic: {
    id: 'organic',
    name: 'Organic & Food Residuals',
    category: 'organic',
    avgWeightKg: 0.150, // ~150g per food residual/peel
    co2PerKg: 0.52, // Prevents anaerobic methane (CH4 has 28x GWP of CO2 over 100 years)
    energyKwhPerKg: 0.20,
    waterLitersPerKg: 2.00,
    decompositionYears: 0.08, // 2-4 weeks in aerobic conditions
    circularCycles: 'Nutrient cycling into high-grade organic humus and biocompost',
    fact: 'Diverting organic waste from anaerobic landfills eliminates volatile methane (28x more potent than CO2).'
  },
  ewaste: {
    id: 'ewaste',
    name: 'E-Waste & Batteries',
    category: 'ewaste',
    avgWeightKg: 0.080, // ~80g avg small peripheral / battery
    co2PerKg: 12.50, // High embodied carbon in microelectronics & rare-earth refining
    energyKwhPerKg: 18.50,
    waterLitersPerKg: 45.00,
    decompositionYears: 1000, // Leaches heavy toxic metals into aquifers
    circularCycles: 'Urban mining for precious metals (Au, Ag, Cu, Li, Co)',
    fact: '1 metric ton of circuit boards contains up to 800x more gold than 1 ton of mined gold ore.'
  }
};

export interface ImpactSummary {
  totalItems: number;
  totalWeightKg: number;
  co2OffsetKg: number;
  energySavedKwh: number;
  waterSavedLiters: number;
  treesSaved: number;
  // Equivalency conversions
  carKmOffset: number; // Gasoline passenger car (~0.192 kg CO2/km)
  smartphoneCharges: number; // ~0.008 kWh per full 4000mAh charge
  ledBulbHours: number; // 10W LED bulb (~0.01 kWh/hr)
  showerMinutesSaved: number; // ~9.5 Liters/min low-flow shower
  divertedMaterials: {
    material: string;
    items: number;
    weightKg: number;
    co2Kg: number;
    energyKwh: number;
  }[];
}

export interface InventoryCounts {
  plastic: number;
  metal: number;
  paper: number;
  glass: number;
  organic: number;
  ewaste: number;
}

export function calculateEnvironmentalImpact(counts: InventoryCounts): ImpactSummary {
  let totalItems = 0;
  let totalWeightKg = 0;
  let co2OffsetKg = 0;
  let energySavedKwh = 0;
  let waterSavedLiters = 0;
  let treesSaved = 0;

  const divertedMaterials: ImpactSummary['divertedMaterials'] = [];

  for (const [key, count] of Object.entries(counts)) {
    if (count <= 0) continue;
    const factor = MATERIAL_FACTORS[key];
    if (!factor) continue;

    const weightKg = count * factor.avgWeightKg;
    const itemCo2 = weightKg * factor.co2PerKg;
    const itemEnergy = weightKg * factor.energyKwhPerKg;
    const itemWater = weightKg * factor.waterLitersPerKg;
    const itemTrees = factor.treesPerKg ? weightKg * factor.treesPerKg : 0;

    totalItems += count;
    totalWeightKg += weightKg;
    co2OffsetKg += itemCo2;
    energySavedKwh += itemEnergy;
    waterSavedLiters += itemWater;
    treesSaved += itemTrees;

    divertedMaterials.push({
      material: factor.name,
      items: count,
      weightKg: Number(weightKg.toFixed(2)),
      co2Kg: Number(itemCo2.toFixed(2)),
      energyKwh: Number(itemEnergy.toFixed(2)),
    });
  }

  // Real world equivalency coefficients
  const carKmOffset = co2OffsetKg / 0.192; // 0.192 kg CO2 per km for avg petrol car
  const smartphoneCharges = energySavedKwh / 0.008; // 8 Wh per 4,000 mAh phone charge
  const ledBulbHours = energySavedKwh / 0.010; // 10W LED bulb consumes 0.01 kWh/hour
  const showerMinutesSaved = waterSavedLiters / 9.5; // 9.5 L/min shower

  return {
    totalItems,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    co2OffsetKg: Number(co2OffsetKg.toFixed(2)),
    energySavedKwh: Number(energySavedKwh.toFixed(2)),
    waterSavedLiters: Number(waterSavedLiters.toFixed(1)),
    treesSaved: Number(treesSaved.toFixed(3)),
    carKmOffset: Number(carKmOffset.toFixed(1)),
    smartphoneCharges: Math.round(smartphoneCharges),
    ledBulbHours: Math.round(ledBulbHours),
    showerMinutesSaved: Math.round(showerMinutesSaved),
    divertedMaterials,
  };
}

/**
 * Generate a deterministic verification hash for circular certificates
 */
export function generateCertificateHash(name: string, date: string, co2: number, certId: string): string {
  const seed = `${name.toUpperCase()}-${certId}-${co2}-${date}-ECOSORT-VERIFIED`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex.toUpperCase()}${seed.length.toString(16).padStart(4, '0')}7A9F4E`;
}
