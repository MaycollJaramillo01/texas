/**
 * THR Estimator — Prueba de envío de email via Resend
 * Ejecuta: node test-email.mjs
 */

import { readFileSync } from 'fs';
import { Resend } from 'resend';

// Leer API key desde .env.local
function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf-8');
    for (const line of raw.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key?.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim();
    }
  } catch {
    console.error('❌  No se encontró .env.local');
    process.exit(1);
  }
}
loadEnv();

if (!process.env.RESEND_API_KEY) {
  console.error('❌  RESEND_API_KEY no definida');
  process.exit(1);
}

// ─── Helpers (espejo de api/estimate.js) ─────────────────────────────────────

const usd = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function formatDetails(service, d) {
  if (!d) return [];
  const yn   = (v) => (v === true || v === 'true') ? 'Sí' : 'No';
  const sqft = (v) => (v && Number(v) > 0) ? `${Number(v).toLocaleString('en-US')} sq ft` : null;
  const lf   = (v) => (v && Number(v) > 0) ? `${Number(v).toLocaleString('en-US')} lin ft` : null;
  const num  = (v, unit) => (v != null && Number(v) > 0) ? `${v} ${unit}` : null;
  const row  = (label, value) => (value === null || value === undefined) ? null : { label, value };
  const MAP  = {
    condition:       { vacant: 'Desocupada', occupied: 'Ocupada' },
    ceilingHeight:   { '8ft': '8 ft', '9ft': '9 ft', '10ft_plus': '10 ft +' },
    access:          { normal: 'Una planta', two_stories: 'Dos pisos' },
    surfaceType:     { standard: 'Siding estándar', hardie: 'Hardie Board', stucco: 'Stucco', brick: 'Ladrillo' },
    finishLevel:     { standard: 'Estándar', premium: 'Premium' },
    colorComplexity: { light: 'Color claro', dark: 'Color oscuro', stain: 'Stain + clear' },
    damage:          { none: 'Sin daños', moderate: 'Daño moderado', heavy: 'Daño severo' },
    textureType:     { none: 'Sin textura', orange_peel: 'Orange Peel', knockdown: 'Knockdown', hand_trowel: 'Hand Trowel', smooth_finish: 'Smooth Finish' },
    repairSize:      { small: 'Pequeño', medium: 'Mediano', large: 'Grande' },
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
      ...(d.hangDrywall ? [row('Láminas', num(d.sheets, 'láminas'))] : []),
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

function buildLeadEmail(lead, service, customerType, projectDetails, estimate, isTest = false) {
  const SERVICE_NAMES  = { interior_painting: 'Interior Painting', exterior_painting: 'Exterior Painting', cabinet_refinishing: 'Cabinet Refinishing', drywall: 'Drywall', drywall_repair: 'Drywall Repair', tile: 'Tile Installation', stain_clear: 'Stain & Clear' };
  const CUSTOMER_NAMES = { homeowner: 'Homeowner', builder: 'Builder / Contractor', property_manager: 'Property Manager' };

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
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${isTest ? '[PRUEBA] ' : ''}Nuevo Lead — THR Estimator</title>
</head>
<body style="margin:0;padding:0;background:#f4f0ea;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1a1a1c;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fbf9f5;border:1px solid rgba(26,26,28,0.12);border-radius:4px;overflow:hidden;">
        <tr><td style="background:#1a1a1c;padding:28px 32px;">
          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#a8a8af;">Texas High Refinished</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fbf9f5;letter-spacing:-0.02em;">${isTest ? '⚠️ [PRUEBA] ' : ''}Nuevo Lead — Estimator</h1>
        </td></tr>
        ${testBanner}
        <tr><td style="padding:28px 32px 0;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a7a82;">Datos de contacto</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:7px 0;border-bottom:1px solid rgba(26,26,28,0.08);">
              <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Nombre</span>
              <span style="font-size:15px;font-weight:600;">${lead.name}</span>
            </td></tr>
            <tr><td style="padding:7px 0;border-bottom:1px solid rgba(26,26,28,0.08);">
              <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Email</span>
              <a href="mailto:${lead.email}" style="font-size:15px;font-weight:600;color:#1a1a1c;text-decoration:none;">${lead.email}</a>
            </td></tr>
            <tr><td style="padding:7px 0;border-bottom:1px solid rgba(26,26,28,0.08);">
              <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Teléfono</span>
              <a href="tel:${lead.phone.replace(/\D/g,'')}" style="font-size:15px;font-weight:600;color:#1a1a1c;text-decoration:none;">${lead.phone}</a>
            </td></tr>
            <tr><td style="padding:7px 0;">
              <span style="font-size:11px;color:#7a7a82;display:block;margin-bottom:1px;">Ciudad</span>
              <span style="font-size:15px;font-weight:600;">${lead.city}</span>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:22px 32px 0;">
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
        </td></tr>
        ${details.length ? `
        <tr><td style="padding:22px 32px 0;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a7a82;">Detalles del proyecto</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f1;border:1px solid rgba(26,26,28,0.09);border-radius:3px;padding:4px 14px;">
            ${detailRows}
          </table>
        </td></tr>` : ''}
        <tr><td style="padding:22px 32px 0;">
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
          ${estimate.inspectionRecommended ? `<p style="margin:10px 0 0;font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:2px;padding:10px 12px;">⚠️ Inspección en sitio recomendada.</p>` : ''}
        </td></tr>
        <tr><td style="padding:22px 32px 28px;">
          <p style="margin:0;font-size:11px;color:#a8a8af;border-top:1px solid rgba(26,26,28,0.08);padding-top:14px;">${ts} · Texas High Refinished · Marble Falls, TX</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Datos de prueba realistas ────────────────────────────────────────────────

const lead = {
  name:  'Carlos Mendoza',
  email: 'carlos.mendoza@gmail.com',
  phone: '(830) 412-7891',
  city:  'Marble Falls, TX',
};

const service      = 'cabinet_refinishing';
const customerType = 'homeowner';

const projectDetails = {
  cabinetDoors:    24,
  drawerFronts:    8,
  endPanels:       2,
  finishLevel:     'premium',
  includeIsland:   true,
  includeVanity:   false,
  colorComplexity: 'dark',
  damage:          'moderate',
  rushProject:     false,
};

// Base: 24×225 + 8×85 + 2×250 + 1500 = 5400+680+500+1500 = 8080
// mx = 1.1(dark) × 1.1(moderate) = 1.21 → 8080×1.21 = 9776.8 → cabinet range ×0.9/×1.1
const estimate = { low: 8800, typical: 9800, premium: 10800, inspectionRecommended: false };

// ─── Enviar ───────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('\n📧  Enviando email de prueba con detalles del proyecto...');
console.log(`    Para: maycolljaramillo01@gmail.com`);
console.log(`    Lead: ${lead.name} — ${service}`);
console.log(`    Detalles: ${projectDetails.cabinetDoors} puertas, ${projectDetails.drawerFronts} cajones, island, dark color, daño moderado\n`);

try {
  const result = await resend.emails.send({
    from: 'THR Estimator <onboarding@resend.dev>',
    to: ['maycolljaramillo01@gmail.com'],
    subject: `⚠️ [PRUEBA] Nuevo lead — Cabinet Refinishing · Marble Falls, TX`,
    html: buildLeadEmail(lead, service, customerType, projectDetails, estimate, true),
  });

  if (result.error) {
    console.error('❌  Error de Resend:');
    console.error(JSON.stringify(result.error, null, 2));
    process.exit(1);
  }

  console.log('✅  Email enviado — revisa maycolljaramillo01@gmail.com');
  console.log(`    ID: ${result.data?.id}\n`);
} catch (err) {
  console.error('❌  Error:', err.message ?? err);
  process.exit(1);
}
