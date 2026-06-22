// Vercel serverless function — ALL pricing logic lives here (never reaches the client).

import { Resend } from 'resend';

const NOTIFY_EMAILS = ['Pvpropainting@gmail.com', 'maycolljaramillo01@gmail.com'];

const SERVICE_NAMES = {
  interior_painting: 'Interior Painting',
  exterior_painting: 'Exterior Painting',
  cabinet_refinishing: 'Cabinet Refinishing',
  drywall: 'Drywall',
  drywall_repair: 'Drywall Repair',
  tile: 'Tile Installation',
  stain_clear: 'Stain & Clear',
};

const CUSTOMER_NAMES = {
  homeowner: 'Homeowner',
  builder: 'Builder / Contractor',
  property_manager: 'Property Manager',
};

function usd(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDetails(service, d) {
  if (!d) return [];
  const yn   = (v) => (v === true || v === 'true') ? 'Sí' : 'No';
  const sqft = (v) => (v && Number(v) > 0) ? `${Number(v).toLocaleString('en-US')} sq ft` : null;
  const lf   = (v) => (v && Number(v) > 0) ? `${Number(v).toLocaleString('en-US')} lin ft` : null;
  const num  = (v, unit) => (v != null && Number(v) > 0) ? `${v} ${unit}` : null;
  const row  = (label, value) => (value === null || value === undefined) ? null : { label, value };

  const MAP = {
    condition:       { vacant: 'Desocupada', occupied: 'Ocupada' },
    ceilingHeight:   { '8ft': '8 ft', '9ft': '9 ft', '10ft_plus': '10 ft +' },
    access:          { normal: 'Una planta', two_stories: 'Dos pisos' },
    surfaceType:     { standard: 'Siding estándar', hardie: 'Hardie Board', stucco: 'Stucco', brick: 'Ladrillo' },
    finishLevel:     { standard: 'Estándar', premium: 'Premium' },
    colorComplexity: { light: 'Color claro', dark: 'Color oscuro', stain: 'Stain + clear' },
    damage:          { none: 'Sin daños', moderate: 'Daño moderado', heavy: 'Daño severo' },
    textureType:     { none: 'Sin textura', orange_peel: 'Orange Peel', knockdown: 'Knockdown', hand_trowel: 'Hand Trowel', smooth_finish: 'Smooth Finish' },
    repairSize:      { small: 'Pequeño (crack / un agujero)', medium: 'Mediano (múltiples parches)', large: 'Grande (sección entera / daño por agua)' },
    tileService:     { tile_flooring: 'Piso de Tile', shower_tile: 'Tile de Ducha', backsplash: 'Backsplash', full_shower_remodel: 'Remodelación Completa de Ducha' },
    type:            { interior: 'Interior', exterior: 'Exterior' },
  };
  const lk = (key, val) => (val ? MAP[key]?.[val] ?? val : null);

  const rows = (() => { switch (service) {
    case 'interior_painting': return [
      row('Área a pintar',          sqft(d.squareFootage)),
      row('Estado del inmueble',    lk('condition', d.condition)),
      row('Altura de techo',        lk('ceilingHeight', d.ceilingHeight)),
      row('Pintura de techo',       yn(d.includeCeilings)),
      row('Trim / moldura',         yn(d.includeTrim)),
      ...(d.includeTrim ? [row('Longitud de trim', lf(d.trimLinearFeet))] : []),
      row('Puertas interiores',     num(d.interiorDoors, 'puertas')),
      row('Proyecto urgente',       yn(d.rushProject)),
    ];
    case 'exterior_painting': return [
      row('Área exterior',          sqft(d.squareFootage)),
      row('Tipo de superficie',     lk('surfaceType', d.surfaceType)),
      row('Acceso',                 lk('access', d.access)),
      row('Raspado intensivo',      yn(d.heavyScraping)),
      row('Cambio de color fuerte', yn(d.strongColorChange)),
      row('Recaulking extensivo',   yn(d.extensiveRecaulking)),
      row('Deck',                   d.includeDeck ? sqft(d.deckSquareFootage) : null),
      row('Cerca / Fence',          d.includeFence ? lf(d.fenceLinearFeet) : null),
    ];
    case 'cabinet_refinishing': return [
      row('Puertas de gabinete',    num(d.cabinetDoors, 'puertas')),
      row('Drawer fronts',          num(d.drawerFronts, 'cajones')),
      row('End panels',             num(d.endPanels, 'panels')),
      row('Nivel de acabado',       lk('finishLevel', d.finishLevel)),
      row('Island de cocina',       yn(d.includeIsland)),
      row('Vanidad de baño',        yn(d.includeVanity)),
      row('Complejidad de color',   lk('colorComplexity', d.colorComplexity)),
      row('Daños existentes',       lk('damage', d.damage)),
      row('Proyecto urgente',       yn(d.rushProject)),
    ];
    case 'drywall': return [
      row('Instalación de drywall', yn(d.hangDrywall)),
      ...(d.hangDrywall ? [row('Láminas (sheets)', num(d.sheets, 'láminas'))] : []),
      row('Tape & float',           yn(d.tapeAndFloat)),
      row('Área total',             sqft(d.squareFootage)),
      row('Textura',                lk('textureType', d.textureType)),
    ];
    case 'drywall_repair': return [
      row('Tamaño de la reparación', lk('repairSize', d.repairSize)),
    ];
    case 'tile': return [
      row('Tipo de trabajo',        lk('tileService', d.tileService)),
      ...(d.tileService !== 'full_shower_remodel' ? [row('Área', sqft(d.squareFootage))] : []),
    ];
    case 'stain_clear': return [
      row('Interior / Exterior',    lk('type', d.type)),
      row('Área de superficie',     sqft(d.squareFootage)),
      row('Window sills',           num(d.windowSills, 'sills')),
      row('Puertas de entrada',     num(d.entryDoors, 'puertas')),
    ];
    default: return [];
  }})();
  return rows.filter(Boolean);
  }
}

function buildLeadEmail(lead, service, customerType, projectDetails, estimate, isTest = false) {
  const svc     = SERVICE_NAMES[service] ?? service;
  const ct      = CUSTOMER_NAMES[customerType] ?? customerType;
  const ts      = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' });
  const details = formatDetails(service, projectDetails);

  const testBanner = isTest ? `
        <tr>
          <td style="background:#fef3c7;border-bottom:2px dashed #f59e0b;padding:14px 32px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;text-align:center;">
              ⚠️  ESTE ES UN EMAIL DE PRUEBA — No hay cliente real detrás de este mensaje
            </p>
          </td>
        </tr>` : '';

  const detailRows = details.map((row, i) => {
    const border = i < details.length - 1 ? 'border-bottom:1px solid rgba(26,26,28,0.07);' : '';
    return `<tr>
              <td width="45%" style="padding:7px 12px 7px 0;${border}">
                <span style="font-size:11px;color:#7a7a82;">${row.label}</span>
              </td>
              <td width="55%" style="padding:7px 0;${border}">
                <span style="font-size:13px;font-weight:600;color:#1a1a1c;">${row.value}</span>
              </td>
            </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isTest ? '[PRUEBA] ' : ''}Nuevo Lead — THR Estimator</title>
</head>
<body style="margin:0;padding:0;background:#f4f0ea;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1a1a1c;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fbf9f5;border:1px solid rgba(26,26,28,0.12);border-radius:4px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1c;padding:28px 32px;">
            <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#a8a8af;">Texas High Refinished</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fbf9f5;letter-spacing:-0.02em;">${isTest ? '⚠️ [PRUEBA] ' : ''}Nuevo Lead — Estimator</h1>
          </td>
        </tr>

        ${testBanner}

        <!-- Contact info -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a7a82;">Datos de contacto</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:7px 0;border-bottom:1px solid rgba(26,26,28,0.08);">
                  <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Nombre</span>
                  <span style="font-size:15px;font-weight:600;">${lead.name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:7px 0;border-bottom:1px solid rgba(26,26,28,0.08);">
                  <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Email</span>
                  <a href="mailto:${lead.email}" style="font-size:15px;font-weight:600;color:#1a1a1c;text-decoration:none;">${lead.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:7px 0;border-bottom:1px solid rgba(26,26,28,0.08);">
                  <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Teléfono</span>
                  <a href="tel:${lead.phone.replace(/\D/g,'')}" style="font-size:15px;font-weight:600;color:#1a1a1c;text-decoration:none;">${lead.phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:7px 0;">
                  <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Ciudad</span>
                  <span style="font-size:15px;font-weight:600;">${lead.city}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Project summary -->
        <tr>
          <td style="padding:22px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;border-radius:3px;padding:14px 16px;">
              <tr>
                <td width="50%">
                  <span style="font-size:10px;color:#7a7a82;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.07em;">Servicio</span>
                  <span style="font-size:14px;font-weight:700;color:#1a1a1c;">${svc}</span>
                </td>
                <td width="50%">
                  <span style="font-size:10px;color:#7a7a82;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.07em;">Tipo de cliente</span>
                  <span style="font-size:14px;font-weight:700;color:#1a1a1c;">${ct}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Project details -->
        ${details.length ? `
        <tr>
          <td style="padding:22px 32px 0;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a7a82;">Detalles del proyecto</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f1;border:1px solid rgba(26,26,28,0.09);border-radius:3px;padding:4px 14px;">
              ${detailRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- Estimate ranges -->
        <tr>
          <td style="padding:22px 32px 0;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a7a82;">Rango de inversión estimada</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(26,26,28,0.12);border-radius:4px;overflow:hidden;">
              <tr>
                <td align="center" width="33%" style="padding:16px 8px;border-right:1px solid rgba(26,26,28,0.08);background:#f9f6f1;">
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7a7a82;display:block;margin-bottom:6px;">Low</span>
                  <span style="font-size:20px;font-weight:800;color:#1a1a1c;">${usd(estimate.low)}</span>
                </td>
                <td align="center" width="34%" style="padding:16px 8px;border-right:1px solid rgba(26,26,28,0.08);background:#1a1a1c;">
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#a8a8af;display:block;margin-bottom:6px;">Typical ★</span>
                  <span style="font-size:20px;font-weight:800;color:#fbf9f5;">${usd(estimate.typical)}</span>
                </td>
                <td align="center" width="33%" style="padding:16px 8px;background:#f9f6f1;">
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7a7a82;display:block;margin-bottom:6px;">Premium</span>
                  <span style="font-size:20px;font-weight:800;color:#1a1a1c;">${usd(estimate.premium)}</span>
                </td>
              </tr>
            </table>
            ${estimate.inspectionRecommended ? `<p style="margin:10px 0 0;font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:2px;padding:10px 12px;">⚠️ Inspección en sitio recomendada para este proyecto.</p>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:22px 32px 28px;">
            <p style="margin:0;font-size:11px;color:#a8a8af;border-top:1px solid rgba(26,26,28,0.08);padding-top:14px;">${ts} · Texas High Refinished · Marble Falls, TX</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Internal rate tables ────────────────────────────────────────────────────

const _I = { hw: 5.0, bld: 4.5, pm: 4.5, ceil: 1.5, trim: 2.5, door: 175 };
const _IMX = { vacant: 1.0, occupied: 1.1, '8ft': 1.0, '9ft': 1.05, '10ft_plus': 1.15, rush: 1.1 };
const _E = { hw: 4.0, bld: 3.5, pm: 3.5, hardie: 4.0, stucco: 4.5, brick: 5.0, deck: 7.0, fence: 4.0 };
const _EMX = { normal: 1.0, two_stories: 1.1, scraping: 1.15, colorChange: 1.1, recaulk: 1.1 };
const _C = { hw_std: 175, hw_prem: 225, bld_std: 150, bld_prem: 200, drawer: 85, panel: 250, island: 1500, vanity: 1200 };
const _CMX = { light: 1.0, dark: 1.1, stain: 1.15, none: 1.0, moderate: 1.1, heavy: 1.2, rush: 1.1 };
const _DW = { hang: 16, tape: 1.0, orange_peel: 0.85, knockdown: 1.25, hand_trowel: 1.75, smooth_finish: 3.0 };
const _REP = { small: 350, medium: 950, large: 2500 };
const _T = { tile_flooring: 12, shower_tile: 30, backsplash: 25, full_shower_remodel: 6500 };
const _S = { interior: 7.0, exterior: 8.0, sill: 150, door: 650 };
const _MIN = {
  interior_painting: 3000, exterior_painting: 3500, cabinet_refinishing: 2500,
  drywall: 500, drywall_repair: 350, tile: 500, stain_clear: 500,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round100(n) { return Math.round(Math.round(n * 100) / 100 / 100) * 100; }

function toRange(base, service, mode = 'standard', inspectionRecommended = false) {
  const floored = Math.max(base, _MIN[service] ?? 500);
  const lo = mode === 'cabinet' ? 0.9 : 0.85;
  const hi = mode === 'cabinet' ? 1.1 : 1.15;
  return { low: round100(floored * lo), typical: round100(floored), premium: round100(floored * hi), inspectionRecommended };
}

function n(v, fallback = 0) { const x = Number(v); return isNaN(x) || x < 0 ? fallback : x; }
function b(v) { return v === true || v === 'true'; }

// ─── Calculators ─────────────────────────────────────────────────────────────

function calcInterior(ct, d) {
  const rate = ct === 'homeowner' ? _I.hw : _I.bld;
  let mx = _IMX[d.condition] ?? 1;
  mx *= _IMX[d.ceilingHeight] ?? 1;
  if (b(d.rushProject)) mx *= _IMX.rush;
  let base = n(d.squareFootage) * rate * mx;
  if (b(d.includeCeilings)) base += n(d.squareFootage) * _I.ceil;
  if (b(d.includeTrim)) base += n(d.trimLinearFeet) * _I.trim;
  base += n(d.interiorDoors) * _I.door;
  return toRange(base, 'interior_painting');
}

function calcExterior(ct, d) {
  const sMap = { standard: ct === 'homeowner' ? _E.hw : _E.bld, hardie: _E.hardie, stucco: _E.stucco, brick: _E.brick };
  const rate = sMap[d.surfaceType] ?? _E.hw;
  let mx = _EMX[d.access] ?? 1;
  if (b(d.heavyScraping)) mx *= _EMX.scraping;
  if (b(d.strongColorChange)) mx *= _EMX.colorChange;
  if (b(d.extensiveRecaulking)) mx *= _EMX.recaulk;
  let base = n(d.squareFootage) * rate * mx;
  if (b(d.includeDeck)) base += n(d.deckSquareFootage) * _E.deck;
  if (b(d.includeFence)) base += n(d.fenceLinearFeet) * _E.fence;
  return toRange(base, 'exterior_painting');
}

function calcCabinet(ct, d) {
  const pref = ct === 'homeowner' ? 'hw' : 'bld';
  const doorRate = d.finishLevel === 'premium' ? _C[`${pref}_prem`] : _C[`${pref}_std`];
  let base = n(d.cabinetDoors) * doorRate + n(d.drawerFronts) * _C.drawer + n(d.endPanels) * _C.panel;
  if (b(d.includeIsland)) base += _C.island;
  if (b(d.includeVanity)) base += _C.vanity;
  let mx = (_CMX[d.colorComplexity] ?? 1) * (_CMX[d.damage] ?? 1);
  if (b(d.rushProject)) mx *= _CMX.rush;
  base *= mx;
  return toRange(base, 'cabinet_refinishing', 'cabinet');
}

function calcDrywall(d) {
  let base = 0;
  if (b(d.hangDrywall)) base += n(d.sheets) * _DW.hang;
  if (b(d.tapeAndFloat)) base += n(d.squareFootage) * _DW.tape;
  if (d.textureType && d.textureType !== 'none') base += n(d.squareFootage) * (_DW[d.textureType] ?? 0);
  return toRange(base, 'drywall');
}

function calcRepair(d) {
  return toRange(_REP[d.repairSize] ?? 350, 'drywall_repair', 'standard', d.repairSize === 'large');
}

function calcTile(d) {
  if (d.tileService === 'full_shower_remodel') return toRange(_T.full_shower_remodel, 'tile');
  return toRange(n(d.squareFootage) * (_T[d.tileService] ?? 12), 'tile');
}

function calcStain(d) {
  const rate = d.type === 'exterior' ? _S.exterior : _S.interior;
  return toRange(n(d.squareFootage) * rate + n(d.windowSills) * _S.sill + n(d.entryDoors) * _S.door, 'stain_clear');
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object') throw new Error('empty');
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid request body.' });
  }

  const { customerType, service, projectDetails: d, lead } = body;

  // Basic validation
  const validCustomers = ['homeowner', 'builder', 'property_manager'];
  const validServices = ['interior_painting', 'exterior_painting', 'cabinet_refinishing', 'drywall', 'drywall_repair', 'tile', 'stain_clear'];
  if (!validCustomers.includes(customerType)) return res.status(400).json({ success: false, error: 'Invalid client type.' });
  if (!validServices.includes(service)) return res.status(400).json({ success: false, error: 'Invalid service.' });
  if (!d || typeof d !== 'object') return res.status(400).json({ success: false, error: 'Project details are required.' });
  if (!lead?.name?.trim() || !lead?.email?.trim() || !lead?.phone?.trim() || !lead?.city?.trim()) {
    return res.status(400).json({ success: false, error: 'All contact fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  // Sanity guard on unusually large inputs
  if (n(d.squareFootage) > 25000 || n(d.sheets) > 1500 || n(d.cabinetDoors) > 400) {
    return res.status(422).json({ success: false, error: 'Please review the project details. Some values seem unusually high.' });
  }

  let estimate;
  try {
    switch (service) {
      case 'interior_painting':   estimate = calcInterior(customerType, d); break;
      case 'exterior_painting':   estimate = calcExterior(customerType, d); break;
      case 'cabinet_refinishing': estimate = calcCabinet(customerType, d); break;
      case 'drywall':             estimate = calcDrywall(d); break;
      case 'drywall_repair':      estimate = calcRepair(d); break;
      case 'tile':                estimate = calcTile(d); break;
      case 'stain_clear':         estimate = calcStain(d); break;
      default: throw new Error('Unknown service');
    }
  } catch (err) {
    console.error('[THR-CALC]', err);
    return res.status(500).json({ success: false, error: 'Calculation error. Please try again.' });
  }

  // Send lead notification via Resend (fire-and-forget — doesn't block the estimate response)
  console.info('[THR-LEAD]', JSON.stringify({ name: lead.name, email: lead.email, phone: lead.phone, city: lead.city, service, customerType, ts: new Date().toISOString() }));
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    resend.emails.send({
      from: 'THR Estimator <onboarding@resend.dev>',
      to: NOTIFY_EMAILS,
      subject: `🔔 Nuevo lead — ${SERVICE_NAMES[service] ?? service} · ${lead.city}`,
      html: buildLeadEmail(lead, service, customerType, d, estimate),
    }).catch((err) => console.error('[THR-EMAIL-ERR]', err));
  }

  return res.status(200).json({
    success: true,
    estimate,
    message: 'This estimate is based on the information provided and is for informational purposes only. Final pricing will be confirmed after an on-site project verification.',
  });
}
