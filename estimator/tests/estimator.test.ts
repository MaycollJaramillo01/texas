import assert from 'node:assert/strict';
import test from 'node:test';

import { isAllowedVerificationSlot } from '../src/lib/booking-policy.ts';
import { calculateEstimate } from '../src/lib/server/estimate-engine.ts';
import { validateProjectDetails } from '../src/lib/validators/estimate.schema.ts';
import type { CustomerType, ServiceType } from '../src/types/estimate.ts';

const leadCases: Array<{
  service: ServiceType;
  customerType: CustomerType;
  details: Record<string, unknown>;
}> = [
  {
    service: 'interior_painting',
    customerType: 'homeowner',
    details: {
      squareFootage: 2000,
      condition: 'vacant',
      includeCeilings: false,
      includeTrim: false,
      trimLinearFeet: 0,
      interiorDoors: 0,
      ceilingHeight: '8ft',
      rushProject: false,
    },
  },
  {
    service: 'exterior_painting',
    customerType: 'builder',
    details: {
      squareFootage: 2500,
      surfaceType: 'standard',
      includeDeck: false,
      deckSquareFootage: 0,
      includeFence: false,
      fenceLinearFeet: 0,
      access: 'normal',
      heavyScraping: false,
      strongColorChange: false,
      extensiveRecaulking: false,
    },
  },
  {
    service: 'cabinet_refinishing',
    customerType: 'homeowner',
    details: {
      cabinetDoors: 24,
      drawerFronts: 6,
      finishLevel: 'premium',
      includeIsland: true,
      endPanels: 2,
    },
  },
  {
    service: 'drywall',
    customerType: 'property_manager',
    details: {
      sheets: 40,
      hangDrywall: true,
      tapeAndFloat: true,
      tapeSquareFootage: 800,
      textureType: 'knockdown',
      textureSquareFootage: 500,
    },
  },
  {
    service: 'drywall_repair',
    customerType: 'homeowner',
    details: { repairSize: 'medium' },
  },
  {
    service: 'lvp_flooring',
    customerType: 'homeowner',
    details: { squareFootage: 600 },
  },
  {
    service: 'tile',
    customerType: 'builder',
    details: { tileService: 'tile_flooring', squareFootage: 200 },
  },
  {
    service: 'stain_clear',
    customerType: 'homeowner',
    details: { type: 'interior', squareFootage: 300, windowSills: 2, entryDoors: 1 },
  },
];

test('every service validates and returns an ordered estimate range', () => {
  for (const item of leadCases) {
    const details = validateProjectDetails(item.service, item.details) as Record<string, unknown>;
    const estimate = calculateEstimate(item.customerType, item.service, details);
    assert.ok(Number.isFinite(estimate.low), `${item.service}: low is finite`);
    assert.ok(estimate.low <= estimate.typical, `${item.service}: low <= typical`);
    assert.ok(estimate.typical <= estimate.premium, `${item.service}: typical <= premium`);
  }
});

test('Luxury Vinyl Plank is a first-class service with its expected range', () => {
  const details = validateProjectDetails('lvp_flooring', { squareFootage: 600 });
  assert.deepEqual(calculateEstimate('homeowner', 'lvp_flooring', details), {
    low: 1200,
    typical: 1800,
    premium: 2400,
    inspectionRecommended: false,
  });
});

test('verification slots are limited to weekdays from 10 AM through 4 PM in Texas', () => {
  assert.equal(isAllowedVerificationSlot('2026-07-13T15:00:00.000Z'), true); // Monday 10 AM CDT
  assert.equal(isAllowedVerificationSlot('2026-07-13T21:00:00.000Z'), true); // Monday 4 PM CDT
  assert.equal(isAllowedVerificationSlot('2026-07-13T14:59:00.000Z'), false);
  assert.equal(isAllowedVerificationSlot('2026-07-13T22:00:00.000Z'), false);
  assert.equal(isAllowedVerificationSlot('2026-07-18T15:00:00.000Z'), false); // Saturday
});

test('verification slot policy handles winter time and malformed values', () => {
  assert.equal(isAllowedVerificationSlot('2026-01-12T16:00:00.000Z'), true); // Monday 10 AM CST
  assert.equal(isAllowedVerificationSlot('2026-01-12T22:00:00.000Z'), true); // Monday 4 PM CST
  assert.equal(isAllowedVerificationSlot('not-a-date'), false);
});
