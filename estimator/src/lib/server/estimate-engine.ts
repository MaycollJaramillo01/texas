import 'server-only';

import { SQFT_PER_SHEET } from '@/lib/drywall';
import type {
  CustomerType,
  ServiceType,
  InteriorPaintingDetails,
  ExteriorPaintingDetails,
  CabinetRefinishingDetails,
  DrywallDetails,
  DrywallRepairDetails,
  LvpFlooringDetails,
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

// Each cabinet line item carries its own low/typical/premium range; the
// estimate is the straight sum of the selected items (no minimum applied).
const _CABINET: Record<string, { low: number; typical: number; premium: number }> = {
  standard: { low: 125, typical: 150, premium: 175 },
  premium: { low: 175, typical: 212.5, premium: 250 },
  drawer: { low: 60, typical: 125, premium: 190 },
  panel: { low: 150, typical: 275, premium: 400 },
  island: { low: 500, typical: 1500, premium: 2500 },
  color_change: { low: 5500, typical: 11750, premium: 18000 },
};

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

const _LVP = { low: 2, high: 4 } as const;

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
  lvp_flooring: 500,
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

function cabinet(_c: CustomerType, d: CabinetRefinishingDetails): EstimateRange {
  if (d.finishLevel === 'color_change') {
    return { ..._CABINET.color_change, inspectionRecommended: true };
  }
  const doorRate = d.finishLevel === 'premium' ? _CABINET.premium : _CABINET.standard;
  const items: Array<[number, { low: number; typical: number; premium: number }]> = [
    [d.cabinetDoors, doorRate],
    [d.drawerFronts, _CABINET.drawer],
    [d.endPanels, _CABINET.panel],
    [d.includeIsland ? 1 : 0, _CABINET.island],
  ];
  const range = items.reduce(
    (acc, [qty, rate]) => ({
      low: acc.low + qty * rate.low,
      typical: acc.typical + qty * rate.typical,
      premium: acc.premium + qty * rate.premium,
    }),
    { low: 0, typical: 0, premium: 0 }
  );
  return {
    low: Math.round(range.low),
    typical: Math.round(range.typical),
    premium: Math.round(range.premium),
    inspectionRecommended: false,
  };
}

function drywall(d: DrywallDetails): EstimateRange {
  // Taping and texture are priced off the surface of the sheets actually hung
  // across every wall, not the property's foundation area — the foundation
  // ignores interior walls and ceilings, which underquoted the work badly.
  const sqft = d.sheets * SQFT_PER_SHEET;
  let base = 0;
  if (d.hangDrywall) base += d.sheets * _DRYWALL.hang;
  if (d.tapeAndFloat) base += sqft * _DRYWALL.tape_float;

  const texRates: Record<string, number> = {
    orange_peel: _DRYWALL.orange_peel,
    knockdown: _DRYWALL.knockdown,
    hand_trowel: _DRYWALL.hand_trowel,
    smooth_finish: _DRYWALL.smooth_finish,
  };
  if (d.textureType !== 'none') base += sqft * (texRates[d.textureType] ?? 0);

  return toRange(base, 'drywall');
}

function drywallRepair(d: DrywallRepairDetails): EstimateRange {
  const base = _REPAIR[d.repairSize];
  const recommended = d.repairSize === 'large';
  return toRange(base, 'drywall_repair', 'standard', recommended);
}

function lvpFlooring(d: LvpFlooringDetails): EstimateRange {
  const sqft = d.squareFootage ?? 0;
  return {
    low: Math.round(sqft * _LVP.low),
    typical: Math.round(sqft * ((_LVP.low + _LVP.high) / 2)),
    premium: Math.round(sqft * _LVP.high),
    inspectionRecommended: false,
  };
}

function tile(d: TileDetails): EstimateRange {
  if (d.tileService === 'full_shower_remodel') {
    return toRange(_TILE.full_shower_remodel, 'tile');
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
    case 'lvp_flooring':
      return lvpFlooring(details as any);
    case 'tile':
      return tile(details as any);
    case 'stain_clear':
      return stainClear(details as any);
    default:
      throw new Error('Unknown service');
  }
}
