import 'server-only';

import type {
  CustomerType,
  ServiceType,
  InteriorPaintingDetails,
  ExteriorPaintingDetails,
  CabinetRefinishingDetails,
  DrywallDetails,
  DrywallRepairDetails,
  TileDetails,
  StainClearDetails,
  EstimateRange,
} from '@/types/estimate';

// ─── Internal rate tables — never exported, never visible in client bundle ───

const _INTERIOR = {
  homeowner: 5.0,
  builder: 4.5,
  property_manager: 4.5,
  ceiling: 1.5,
  trim: 2.5,
  door: 175,
} as const;

const _INTERIOR_MX = {
  vacant: 1.0,
  occupied: 1.1,
  '8ft': 1.0,
  '9ft': 1.05,
  '10ft_plus': 1.15,
  rush: 1.1,
} as const;

const _EXTERIOR = {
  homeowner: 4.0,
  builder: 3.5,
  property_manager: 3.5,
  hardie: 4.0,
  stucco: 4.5,
  brick: 5.0,
  deck: 7.0,
  fence: 4.0,
} as const;

const _EXTERIOR_MX = {
  normal: 1.0,
  two_stories: 1.1,
  heavy_scraping: 1.15,
  color_change: 1.1,
  recaulking: 1.1,
} as const;

const _CABINET: Record<string, number> = {
  homeowner_standard: 175,
  homeowner_premium: 225,
  builder_standard: 150,
  builder_premium: 200,
  property_manager_standard: 150,
  property_manager_premium: 200,
  drawer: 85,
  end_panel: 250,
  island: 1500,
  vanity: 1200,
};

const _CABINET_MX = {
  light: 1.0,
  dark: 1.1,
  stain: 1.15,
  none: 1.0,
  moderate: 1.1,
  heavy: 1.2,
  rush: 1.1,
} as const;

const _DRYWALL = {
  hang: 16,
  tape_float: 1.0,
  orange_peel: 0.85,
  knockdown: 1.25,
  hand_trowel: 1.75,
  smooth_finish: 3.0,
} as const;

const _REPAIR = { small: 350, medium: 950, large: 2500 } as const;

const _TILE: Record<string, number> = {
  tile_flooring: 12,
  shower_tile: 30,
  backsplash: 25,
  full_shower_remodel: 6500,
};

// Flooring priced as a per-sq-ft range instead of a single rate
const _TILE_RANGE: Record<string, { low: number; high: number }> = {
  lvp: { low: 2, high: 4 },
  engineered_wood: { low: 3.5, high: 7 },
};

const _STAIN = {
  interior: 7.0,
  exterior: 8.0,
  window_sill: 150,
  entry_door: 650,
} as const;

const _MINIMUMS: Record<ServiceType, number> = {
  interior_painting: 3000,
  exterior_painting: 3500,
  cabinet_refinishing: 2500,
  drywall: 500,
  drywall_repair: 350,
  tile: 500,
  stain_clear: 500,
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function roundHundred(n: number): number {
  return Math.round(n / 100) * 100;
}

function withMinimum(n: number, service: ServiceType): number {
  return Math.max(n, _MINIMUMS[service]);
}

function toRange(
  base: number,
  service: ServiceType,
  mode: 'standard' | 'cabinet' = 'standard',
  inspectionRecommended = false
): EstimateRange {
  const floored = withMinimum(base, service);
  const lo = mode === 'cabinet' ? 0.9 : 0.85;
  const hi = mode === 'cabinet' ? 1.1 : 1.15;
  return {
    low: roundHundred(floored * lo),
    typical: roundHundred(floored),
    premium: roundHundred(floored * hi),
    inspectionRecommended,
  };
}

// ─── Per-service calculators ─────────────────────────────────────────────────

function interior(c: CustomerType, d: InteriorPaintingDetails): EstimateRange {
  const rate = _INTERIOR[c];
  let mx = _INTERIOR_MX[d.condition] * _INTERIOR_MX[d.ceilingHeight];
  if (d.rushProject) mx *= _INTERIOR_MX.rush;

  let base = d.squareFootage * rate * mx;
  if (d.includeCeilings) base += d.squareFootage * _INTERIOR.ceiling;
  if (d.includeTrim && d.trimLinearFeet > 0) base += d.trimLinearFeet * _INTERIOR.trim;
  if (d.interiorDoors > 0) base += d.interiorDoors * _INTERIOR.door;

  return toRange(base, 'interior_painting');
}

function exterior(c: CustomerType, d: ExteriorPaintingDetails): EstimateRange {
  const baseRate =
    d.surfaceType === 'standard'
      ? _EXTERIOR[c]
      : _EXTERIOR[d.surfaceType];

  let mx = _EXTERIOR_MX[d.access];
  if (d.heavyScraping) mx *= _EXTERIOR_MX.heavy_scraping;
  if (d.strongColorChange) mx *= _EXTERIOR_MX.color_change;
  if (d.extensiveRecaulking) mx *= _EXTERIOR_MX.recaulking;

  let base = d.squareFootage * baseRate * mx;
  if (d.includeDeck && d.deckSquareFootage > 0) base += d.deckSquareFootage * _EXTERIOR.deck;
  if (d.includeFence && d.fenceLinearFeet > 0) base += d.fenceLinearFeet * _EXTERIOR.fence;

  return toRange(base, 'exterior_painting');
}

function cabinet(c: CustomerType, d: CabinetRefinishingDetails): EstimateRange {
  const key = `${c}_${d.finishLevel}`;
  const doorRate = _CABINET[key] ?? _CABINET['homeowner_standard'];

  let base =
    d.cabinetDoors * doorRate +
    d.drawerFronts * _CABINET.drawer +
    d.endPanels * _CABINET.end_panel;

  if (d.includeIsland) base += _CABINET.island;
  if (d.includeVanity) base += _CABINET.vanity;

  let mx = _CABINET_MX[d.colorComplexity] * _CABINET_MX[d.damage];
  if (d.rushProject) mx *= _CABINET_MX.rush;
  base *= mx;

  return toRange(base, 'cabinet_refinishing', 'cabinet');
}

function drywall(d: DrywallDetails): EstimateRange {
  let base = 0;
  if (d.hangDrywall && d.sheets > 0) base += d.sheets * _DRYWALL.hang;
  if (d.tapeAndFloat && d.squareFootage > 0) base += d.squareFootage * _DRYWALL.tape_float;

  const texRates: Record<string, number> = {
    orange_peel: _DRYWALL.orange_peel,
    knockdown: _DRYWALL.knockdown,
    hand_trowel: _DRYWALL.hand_trowel,
    smooth_finish: _DRYWALL.smooth_finish,
  };
  if (d.textureType !== 'none' && d.squareFootage > 0) {
    base += d.squareFootage * (texRates[d.textureType] ?? 0);
  }

  return toRange(base, 'drywall');
}

function drywallRepair(d: DrywallRepairDetails): EstimateRange {
  const base = _REPAIR[d.repairSize];
  const recommended = d.repairSize === 'large';
  return toRange(base, 'drywall_repair', 'standard', recommended);
}

function tile(d: TileDetails): EstimateRange {
  if (d.tileService === 'full_shower_remodel') {
    return toRange(_TILE.full_shower_remodel, 'tile');
  }
  const rateRange = _TILE_RANGE[d.tileService];
  if (rateRange) {
    const sqft = d.squareFootage ?? 0;
    return {
      low: Math.round(sqft * rateRange.low),
      typical: Math.round(sqft * ((rateRange.low + rateRange.high) / 2)),
      premium: Math.round(sqft * rateRange.high),
      inspectionRecommended: false,
    };
  }
  const rate = _TILE[d.tileService] ?? 12;
  return toRange((d.squareFootage ?? 0) * rate, 'tile');
}

function stainClear(d: StainClearDetails): EstimateRange {
  const rate = _STAIN[d.type];
  const base =
    d.squareFootage * rate +
    d.windowSills * _STAIN.window_sill +
    d.entryDoors * _STAIN.entry_door;
  return toRange(base, 'stain_clear');
}

// ─── Public entry point ──────────────────────────────────────────────────────

export function calculateEstimate(
  customerType: CustomerType,
  service: ServiceType,
  details: Record<string, unknown>
): EstimateRange {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  switch (service) {
    case 'interior_painting':
      return interior(customerType, details as any);
    case 'exterior_painting':
      return exterior(customerType, details as any);
    case 'cabinet_refinishing':
      return cabinet(customerType, details as any);
    case 'drywall':
      return drywall(details as any);
    case 'drywall_repair':
      return drywallRepair(details as any);
    case 'tile':
      return tile(details as any);
    case 'stain_clear':
      return stainClear(details as any);
    default:
      throw new Error('Unknown service');
  }
}
