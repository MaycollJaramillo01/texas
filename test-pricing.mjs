/**
 * THR Pricing Engine — Test Suite
 * Ejecuta: node test-pricing.mjs
 *
 * Replica exactamente la lógica de api/estimate.js y verifica
 * al menos 15 casos contra valores calculados a mano.
 */

// ─── Tablas internas (espejo de api/estimate.js) ──────────────────────────────

const _I   = { hw: 5.0, bld: 4.5, pm: 4.5, ceil: 1.5, trim: 2.5, door: 175 };
const _IMX = { vacant: 1.0, occupied: 1.1, '8ft': 1.0, '9ft': 1.05, '10ft_plus': 1.15, rush: 1.1 };
const _E   = { hw: 4.0, bld: 3.5, pm: 3.5, hardie: 4.0, stucco: 4.5, brick: 5.0, deck: 7.0, fence: 4.0 };
const _EMX = { normal: 1.0, two_stories: 1.1, scraping: 1.15, colorChange: 1.1, recaulk: 1.1 };
const _C = {
  standard: { low: 125, typical: 150, premium: 175 },
  premium: { low: 175, typical: 212.5, premium: 250 },
  drawer: { low: 60, typical: 125, premium: 190 },
  panel: { low: 150, typical: 275, premium: 400 },
  island: { low: 500, typical: 1500, premium: 2500 },
  color_change: { low: 5500, typical: 11750, premium: 18000 },
};
const _DW  = { hang: 16, tape: 1.0, orange_peel: 0.85, knockdown: 1.25, hand_trowel: 1.75, smooth_finish: 3.0 };
const _REP = { small: 350, medium: 950, large: 2500 };
const _T = { tile_flooring: 12, shower_tile: 30, backsplash: 25, full_shower_remodel: 6500 };
const _LVP = { low: 2, high: 4 };
const _S   = { interior: 7.0, exterior: 8.0, sill: 150, door: 650 };
const _MIN = {
  interior_painting: 3000, exterior_painting: 3500, cabinet_refinishing: 2500,
  drywall: 500, drywall_repair: 350, lvp_flooring: 500, tile: 500, stain_clear: 500,
};

function round100(n)  { return Math.round(Math.round(n * 100) / 100 / 100) * 100; }
function n(v)         { const x = Number(v); return isNaN(x) || x < 0 ? 0 : x; }
function b(v)         { return v === true || v === 'true'; }

function toRange(base, service, mode = 'standard', inspectionRecommended = false) {
  const floored = Math.max(base, _MIN[service] ?? 500);
  const lo = mode === 'cabinet' ? 0.9 : 0.85;
  const hi = mode === 'cabinet' ? 1.1 : 1.15;
  return { low: round100(floored * lo), typical: round100(floored), premium: round100(floored * hi), inspectionRecommended };
}

function calcInterior(ct, d) {
  const rate = ct === 'homeowner' ? _I.hw : _I.bld;
  let mx = _IMX[d.condition] ?? 1;
  mx *= _IMX[d.ceilingHeight] ?? 1;
  if (b(d.rushProject)) mx *= _IMX.rush;
  let base = n(d.squareFootage) * rate * mx;
  if (b(d.includeCeilings)) base += n(d.squareFootage) * _I.ceil;
  if (b(d.includeTrim))     base += n(d.trimLinearFeet) * _I.trim;
  base += n(d.interiorDoors) * _I.door;
  return toRange(base, 'interior_painting');
}

function calcExterior(ct, d) {
  const sMap = { standard: ct === 'homeowner' ? _E.hw : _E.bld, hardie: _E.hardie, stucco: _E.stucco, brick: _E.brick };
  const rate = sMap[d.surfaceType] ?? _E.hw;
  let mx = _EMX[d.access] ?? 1;
  if (b(d.heavyScraping))         mx *= _EMX.scraping;
  if (b(d.strongColorChange))     mx *= _EMX.colorChange;
  if (b(d.extensiveRecaulking))   mx *= _EMX.recaulk;
  let base = n(d.squareFootage) * rate * mx;
  if (b(d.includeDeck))   base += n(d.deckSquareFootage) * _E.deck;
  if (b(d.includeFence))  base += n(d.fenceLinearFeet)   * _E.fence;
  return toRange(base, 'exterior_painting');
}

function calcCabinet(ct, d) {
  if (d.finishLevel === 'color_change') return { ..._C.color_change, inspectionRecommended: true };
  const doorRate = d.finishLevel === 'premium' ? _C.premium : _C.standard;
  const quantities = [
    [n(d.cabinetDoors), doorRate],
    [n(d.drawerFronts), _C.drawer],
    [n(d.endPanels), _C.panel],
    [b(d.includeIsland) ? 1 : 0, _C.island],
  ];
  const range = quantities.reduce((result, [qty, rate]) => ({
    low: result.low + qty * rate.low,
    typical: result.typical + qty * rate.typical,
    premium: result.premium + qty * rate.premium,
    inspectionRecommended: false,
  }), { low: 0, typical: 0, premium: 0, inspectionRecommended: false });
  return { ...range, low: Math.round(range.low), typical: Math.round(range.typical), premium: Math.round(range.premium) };
}

function calcDrywall(d) {
  let base = 0;
  if (b(d.hangDrywall))  base += n(d.sheets) * _DW.hang;
  if (b(d.tapeAndFloat)) base += n(d.tapeSquareFootage ?? d.squareFootage) * _DW.tape;
  if (d.textureType && d.textureType !== 'none') {
    base += n(d.textureSquareFootage ?? d.squareFootage) * (_DW[d.textureType] ?? 0);
  }
  return toRange(base, 'drywall');
}

function calcRepair(d) {
  return toRange(_REP[d.repairSize] ?? 350, 'drywall_repair', 'standard', d.repairSize === 'large');
}

function calcTile(d) {
  if (d.tileService === 'full_shower_remodel') return toRange(_T.full_shower_remodel, 'tile');
  return toRange(n(d.squareFootage) * (_T[d.tileService] ?? 12), 'tile');
}

function calcLvp(d) {
  const sqft = n(d.squareFootage);
  return {
    low: Math.round(sqft * _LVP.low),
    typical: Math.round(sqft * ((_LVP.low + _LVP.high) / 2)),
    premium: Math.round(sqft * _LVP.high),
    inspectionRecommended: false,
  };
}

function calcStain(d) {
  const rate = d.type === 'exterior' ? _S.exterior : _S.interior;
  return toRange(n(d.squareFootage) * rate + n(d.windowSills) * _S.sill + n(d.entryDoors) * _S.door, 'stain_clear');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

let passed = 0, failed = 0;

function test(name, got, expected) {
  const ok =
    got.low    === expected.low    &&
    got.typical === expected.typical &&
    got.premium === expected.premium &&
    (expected.inspectionRecommended === undefined || got.inspectionRecommended === expected.inspectionRecommended);

  if (ok) {
    console.log(`  ✅  ${name}`);
    console.log(`       Low ${usd(got.low)}  ·  Typical ${usd(got.typical)}  ·  Premium ${usd(got.premium)}`);
    passed++;
  } else {
    console.log(`  ❌  ${name}`);
    console.log(`       GOT      → Low ${usd(got.low)}  Typical ${usd(got.typical)}  Premium ${usd(got.premium)}`);
    console.log(`       EXPECTED → Low ${usd(expected.low)}  Typical ${usd(expected.typical)}  Premium ${usd(expected.premium)}`);
    if (expected.inspectionRecommended !== undefined && got.inspectionRecommended !== expected.inspectionRecommended) {
      console.log(`       inspectionRecommended: got ${got.inspectionRecommended}, expected ${expected.inspectionRecommended}`);
    }
    failed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════');
console.log('  THR Pricing Engine — Suite de pruebas');
console.log('══════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
console.log('【INTERIOR PAINTING】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 1: Homeowner, 2000 sqft, vacant, 8ft, sin extras
// base = 2000 × 5.00 × 1.0 × 1.0 = 10,000
// L = round(8500) = 8500 · T = 10000 · P = round(11500) = 11500
test(
  '#1 Homeowner 2000 sqft, vacant, 8ft (caso básico)',
  calcInterior('homeowner', { squareFootage: 2000, condition: 'vacant', ceilingHeight: '8ft' }),
  { low: 8500, typical: 10000, premium: 11500 }
);

// Test 2: Homeowner, 2000 sqft, occupied, 9ft, ceilings ON, 5 doors, sin trim
// base = 2000×5.00×1.1×1.05 = 11550  +  ceilings 2000×1.5=3000  +  doors 5×175=875
// total = 15425
// L = round(15425×0.85) = round(13111.25) = 13100
// T = round(15425) = 15400   P = round(15425×1.15) = round(17738.75) = 17700
test(
  '#2 Homeowner 2000 sqft, occupied, 9ft, techo + 5 puertas',
  calcInterior('homeowner', { squareFootage: 2000, condition: 'occupied', ceilingHeight: '9ft',
    includeCeilings: true, interiorDoors: 5 }),
  { low: 13100, typical: 15400, premium: 17700 }
);

// Test 3: Builder, 2000 sqft, vacant, 8ft, trim 200 lin ft
// base = 2000×4.50 = 9000  +  trim 200×2.5=500  → 9500
// L = round(9500×0.85) = round(8075) = 8100
// T = 9500   P = round(9500×1.15) = round(10925) = 10900
test(
  '#3 Builder 2000 sqft + trim 200 lin ft',
  calcInterior('builder', { squareFootage: 2000, condition: 'vacant', ceilingHeight: '8ft',
    includeTrim: true, trimLinearFeet: 200 }),
  { low: 8100, typical: 9500, premium: 10900 }
);

// Test 4: Homeowner, 100 sqft — activa mínimo $3,000
// base = 100×5 = 500 → floor a 3000
// L = round(3000×0.85) = round(2550) = 2600
// T = 3000   P = round(3000×1.15) = round(3450) = 3500
test(
  '#4 Homeowner 100 sqft — mínimo $3,000 activo (Low sub-mínimo esperado)',
  calcInterior('homeowner', { squareFootage: 100, condition: 'vacant', ceilingHeight: '8ft' }),
  { low: 2600, typical: 3000, premium: 3500 }
);

// Test 5: Homeowner, 1500 sqft, rush, 10ft+
// base = 1500×5.00×1.1(rush)×1.15(10ft+) = 1500×5×1.1×1.15 = 9487.5
// L = round(9487.5×0.85) = round(8064.375) = 8100
// T = round(9487.5) = 9500   P = round(9487.5×1.15) = round(10910.625) = 10900
test(
  '#5 Homeowner 1500 sqft, rush, techo 10ft+',
  calcInterior('homeowner', { squareFootage: 1500, condition: 'vacant', ceilingHeight: '10ft_plus', rushProject: true }),
  { low: 8100, typical: 9500, premium: 10900 }
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【EXTERIOR PAINTING】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 6: Homeowner, 2500 sqft, standard, una planta
// base = 2500×4.00×1.0 = 10000
// L = 8500   T = 10000   P = 11500
test(
  '#6 Homeowner 2500 sqft, estándar, una planta',
  calcExterior('homeowner', { squareFootage: 2500, surfaceType: 'standard', access: 'normal' }),
  { low: 8500, typical: 10000, premium: 11500 }
);

// Test 7: Homeowner, 2500 sqft, dos pisos, heavy scraping, color change
// mx = 1.1(two_stories) × 1.15(scraping) × 1.1(colorChange) = 1.3915
// base = 2500×4.00×1.3915 = 13915
// L = round(13915×0.85) = round(11827.75) = 11800
// T = round(13915) = 13900   P = round(13915×1.15) = round(16002.25) = 16000
test(
  '#7 Homeowner 2500 sqft, 2 pisos + scraping + color change',
  calcExterior('homeowner', { squareFootage: 2500, surfaceType: 'standard',
    access: 'two_stories', heavyScraping: true, strongColorChange: true }),
  { low: 11800, typical: 13900, premium: 16000 }
);

// Test 8: Builder, 3000 sqft stucco + deck 400 sqft
// base = 3000×4.50×1.0 + 400×7.00 = 13500 + 2800 = 16300
// L = round(16300×0.85) = round(13855) = 13900
// T = round(16300) = 16300   P = round(16300×1.15) = round(18745) = 18700

// Wait: round(16300) = 16300. Let me recalculate:
// 16300 / 100 = 163, Math.round(163) = 163, × 100 = 16300 ✓
// round(13855) = 13855/100=138.55, Math.round(138.55)=139, ×100=13900 ✓
// round(18745) = 18745/100=187.45, Math.round(187.45)=187, ×100=18700 ✓
test(
  '#8 Builder 3000 sqft stucco + deck 400 sqft',
  calcExterior('builder', { squareFootage: 3000, surfaceType: 'stucco', access: 'normal',
    includeDeck: true, deckSquareFootage: 400 }),
  { low: 13900, typical: 16300, premium: 18700 }
);

// Test 9: Exterior — activa mínimo $3,500 (500 sqft builder)
// base = 500×3.5 = 1750 → floor a 3500
// L = round(3500×0.85) = round(2975) = 3000
// T = 3500   P = round(3500×1.15) = round(4025) = 4000
// 2975/100=29.75, Math.round(29.75)=30, ×100=3000 ✓
// 4025/100=40.25, Math.round(40.25)=40, ×100=4000 ✓
test(
  '#9 Builder 500 sqft — mínimo exterior $3,500 activo',
  calcExterior('builder', { squareFootage: 500, surfaceType: 'standard', access: 'normal' }),
  { low: 3000, typical: 3500, premium: 4000 }
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【CABINET REFINISHING】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 10: 20 puertas builder grade + 6 drawer fronts.
test(
  '#10 20 puertas builder grade + 6 drawer fronts',
  calcCabinet('homeowner', { cabinetDoors: 20, drawerFronts: 6, finishLevel: 'standard' }),
  { low: 2860, typical: 3750, premium: 4640, inspectionRecommended: false }
);

// Test 11: 24 puertas premium + kitchen island.
test(
  '#11 24 puertas premium + kitchen island',
  calcCabinet('builder', { cabinetDoors: 24, drawerFronts: 0, finishLevel: 'premium', includeIsland: true }),
  { low: 4700, typical: 6600, premium: 8500, inspectionRecommended: false }
);

// Test 12: 15 puertas builder grade + 2 end panels.
test(
  '#12 15 puertas builder grade + 2 end panels',
  calcCabinet('homeowner', { cabinetDoors: 15, drawerFronts: 0, endPanels: 2, finishLevel: 'standard' }),
  { low: 2175, typical: 2800, premium: 3425, inspectionRecommended: false }
);

test(
  '#13 Complete kitchen color change',
  calcCabinet('homeowner', { finishLevel: 'color_change' }),
  { low: 5500, typical: 11750, premium: 18000, inspectionRecommended: true }
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【DRYWALL】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 14: each drywall service uses its own measurement.
// base = 40×16 + 800×1.0 + 500×1.25 = 640 + 800 + 625 = 2065
test(
  '#14 40 sheets + 800 sqft tape + 500 sqft knockdown',
  calcDrywall({ hangDrywall: true, sheets: 40, tapeAndFloat: true, tapeSquareFootage: 800,
    textureType: 'knockdown', textureSquareFootage: 500 }),
  { low: 1800, typical: 2100, premium: 2400 }
);

// Test 15: Solo smooth finish, 500 sqft (sin hang, sin tape)
// base = 500×3.0 = 1500
// 1500 > 500 (min) ✓
// L = round(1500×0.85) = round(1275) = 1300
// T = round(1500) = 1500   P = round(1500×1.15) = round(1725) = 1700
// 1275/100=12.75, Math.round=13 → 1300 ✓
// 1725/100=17.25, Math.round=17 → 1700 ✓
test(
  '#15 Solo smooth finish 500 sqft',
  calcDrywall({ hangDrywall: false, tapeAndFloat: false, textureSquareFootage: 500, textureType: 'smooth_finish' }),
  { low: 1300, typical: 1500, premium: 1700 }
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【DRYWALL REPAIR】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 15: Repair medium → $950
// L = round(950×0.85) = round(807.5) = 800
// T = round(950) = 1000   — ojo: 950/100=9.5 Math.round(9.5)=10 → 1000
// P = round(950×1.15) = round(1092.5) = 1100
// inspectionRecommended = false
test(
  '#16 Drywall repair — medium ($950)',
  calcRepair({ repairSize: 'medium' }),
  { low: 800, typical: 1000, premium: 1100, inspectionRecommended: false }
);

// Test 16: Repair large → $2,500 + inspección recomendada
// L = round(2500×0.85) = round(2125) = 2100
// T = round(2500) = 2500   P = round(2500×1.15) = round(2875) = 2900
// inspectionRecommended = true
// 2125/100=21.25, Math.round=21 → 2100 ✓
// 2875/100=28.75, Math.round=29 → 2900 ✓
test(
  '#17 Drywall repair — large ($2,500 + inspección recomendada)',
  calcRepair({ repairSize: 'large' }),
  { low: 2100, typical: 2500, premium: 2900, inspectionRecommended: true }
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【TILE】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 17: Tile flooring, 200 sqft
// base = 200×12 = 2400
// L = round(2400×0.85) = round(2040) = 2000
// T = round(2400) = 2400   P = round(2400×1.15) = round(2760) = 2800
// 2040/100=20.4, Math.round=20 → 2000 ✓
// 2760/100=27.6, Math.round=28 → 2800 ✓
test(
  '#18 Tile flooring 200 sqft',
  calcTile({ tileService: 'tile_flooring', squareFootage: 200 }),
  { low: 2000, typical: 2400, premium: 2800 }
);

// Test 18: Shower tile, 80 sqft
// base = 80×30 = 2400
// L = 2000   T = 2400   P = 2800  (mismo resultado que arriba, coincidencia)
test(
  '#19 Shower tile 80 sqft',
  calcTile({ tileService: 'shower_tile', squareFootage: 80 }),
  { low: 2000, typical: 2400, premium: 2800 }
);

// Test 19: Full shower remodel (tarifa fija $6,500)
// L = round(6500×0.85) = round(5525) = 5500
// T = round(6500) = 6500   P = round(6500×1.15) = round(7475) = 7500
// 5525/100=55.25, Math.round=55 → 5500 ✓
// 7475/100=74.75, Math.round=75 → 7500 ✓
test(
  '#20 Full shower remodel (tarifa fija $6,500)',
  calcTile({ tileService: 'full_shower_remodel' }),
  { low: 5500, typical: 6500, premium: 7500 }
);

// Test 20: Backsplash 30 sqft — activa mínimo $500 (base = 30×25 = 750)
// 750 > 500 ✓  (no se activa mínimo)
// L = round(750×0.85) = round(637.5) = 600
// T = round(750) = 800  — wait: 750/100=7.5, Math.round(7.5)=8 → 800
// P = round(750×1.15) = round(862.5) = 900
// 637.5/100=6.375, Math.round=6 → 600 ✓
// 862.5/100=8.625, Math.round=9 → 900 ✓
test(
  '#21 Backsplash 30 sqft',
  calcTile({ tileService: 'backsplash', squareFootage: 30 }),
  { low: 600, typical: 800, premium: 900 }
);

test(
  '#22 LVP 200 sqft at $2.00–$4.00/sqft',
  calcLvp({ squareFootage: 200 }),
  { low: 400, typical: 600, premium: 800, inspectionRecommended: false }
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【STAIN & CLEAR】');
// ─────────────────────────────────────────────────────────────────────────────

// Test 21: Exterior, 300 sqft + 4 sills + 1 entry door
// base = 300×8 + 4×150 + 1×650 = 2400 + 600 + 650 = 3650
// L = round(3650×0.85) = round(3102.5) = 3100
// T = round(3650) = 3700  — 3650/100=36.5, Math.round(36.5)=37 → 3700
// P = round(3650×1.15) = round(4197.5) = 4200
// 3102.5/100=31.025, Math.round=31 → 3100 ✓
// 4197.5/100=41.975, Math.round=42 → 4200 ✓
test(
  '#24 Stain exterior 300 sqft + 4 sills + 1 puerta entrada',
  calcStain({ type: 'exterior', squareFootage: 300, windowSills: 4, entryDoors: 1 }),
  { low: 3100, typical: 3700, premium: 4200 }
);

// Test 22: Interior, 150 sqft solo (sin sills, sin puertas)
// base = 150×7 = 1050
// 1050 > 500 ✓
// L = round(1050×0.85) = round(892.5) = 900
// T = round(1050) = 1100  — 1050/100=10.5, Math.round(10.5)=11 → 1100
// P = round(1050×1.15) = round(1207.5) = 1200
// 892.5/100=8.925, Math.round=9 → 900 ✓
// 1207.5/100=12.075, Math.round=12 → 1200 ✓
test(
  '#25 Stain interior 150 sqft solo',
  calcStain({ type: 'interior', squareFootage: 150, windowSills: 0, entryDoors: 0 }),
  { low: 900, typical: 1100, premium: 1200 }
);

// ─────────────────────────────────────────────────────────────────────────────
// Resultado final
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
const total = passed + failed;
if (failed === 0) {
  console.log(`  🎉  Todos los tests pasaron: ${passed}/${total}`);
} else {
  console.log(`  ⚠️   ${passed}/${total} pasaron · ${failed} FALLARON`);
}
console.log('══════════════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
