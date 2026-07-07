import type { CustomerType, EstimateRange, LeadInfo, ServiceType } from '@/types/estimate';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const FIELD_CACHE_TTL_MS = 10 * 60 * 1000;

const SERVICE_LABELS: Record<ServiceType, string> = {
  interior_painting: 'Interior Painting',
  exterior_painting: 'Exterior Painting',
  cabinet_refinishing: 'Cabinet Refinishing',
  drywall: 'Drywall',
  drywall_repair: 'Drywall Repair',
  tile: 'Tile',
  stain_clear: 'Stain & Clear Coat',
};

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  homeowner: 'Homeowner',
  builder: 'Builder',
  property_manager: 'Property Manager',
};

export interface SyncLeadInput {
  lead: LeadInfo;
  customerType: CustomerType;
  service: ServiceType;
  projectDetails: Record<string, unknown>;
  estimate: EstimateRange;
}

interface GHLConfig {
  apiKey: string;
  locationId: string;
  pipelineId?: string;
  stageId?: string;
}

function getConfig(): GHLConfig | null {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) return null;
  return {
    apiKey,
    locationId,
    pipelineId: process.env.GHL_PIPELINE_ID,
    stageId: process.env.GHL_PIPELINE_STAGE_ID,
  };
}

async function ghlFetch<T>(apiKey: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: GHL_VERSION,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GHL ${init?.method ?? 'GET'} ${path} failed (${res.status}): ${body.slice(0, 500)}`);
  }
  return res.json() as Promise<T>;
}

let fieldCache: { ids: Record<string, string>; fetchedAt: number } | null = null;

async function getCustomFieldIds(apiKey: string, locationId: string): Promise<Record<string, string>> {
  if (fieldCache && Date.now() - fieldCache.fetchedAt < FIELD_CACHE_TTL_MS) return fieldCache.ids;
  const data = await ghlFetch<{ customFields?: Array<{ id: string; fieldKey: string }> }>(
    apiKey,
    `/locations/${locationId}/customFields`
  );
  const ids: Record<string, string> = {};
  for (const field of data.customFields ?? []) ids[field.fieldKey] = field.id;
  fieldCache = { ids, fetchedAt: Date.now() };
  return ids;
}

/**
 * Adds tags without clobbering existing ones — the upsert endpoint replaces
 * the whole tags array, so tags must never be sent through it.
 */
async function addTags(apiKey: string, contactId: string, tags: string[]): Promise<void> {
  await ghlFetch(apiKey, `/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
}

function summarizeProjectDetails(details: Record<string, unknown>): string {
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');
}

const BOOKING_TIMEZONE = 'America/Chicago';

export interface BookVisitInput {
  name: string;
  email: string;
  phone: string;
  startTime: string; // ISO 8601 with offset, as returned by getFreeSlots
}

/** Free slots for the verification-visit calendar, keyed by YYYY-MM-DD. */
export async function getFreeSlots(days = 14): Promise<{ timezone: string; slots: Record<string, string[]> }> {
  const config = getConfig();
  const calendarId = process.env.GHL_CALENDAR_ID;
  if (!config || !calendarId) throw new Error('GHL calendar not configured (GHL_CALENDAR_ID).');

  const start = Date.now();
  const end = start + days * 24 * 60 * 60 * 1000;
  const data = await ghlFetch<Record<string, { slots?: string[] }>>(
    config.apiKey,
    `/calendars/${calendarId}/free-slots?startDate=${start}&endDate=${end}&timezone=${encodeURIComponent(BOOKING_TIMEZONE)}`
  );

  const slots: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(data)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(value?.slots) && value.slots.length > 0) {
      slots[key] = value.slots;
    }
  }
  return { timezone: BOOKING_TIMEZONE, slots };
}

/**
 * Books a verification visit: upserts the contact, creates the appointment on
 * the configured calendar, and moves the contact's open opportunity to the
 * site-visit stage (best-effort). Throws if the appointment cannot be created.
 */
export async function bookVerificationVisit(input: BookVisitInput): Promise<void> {
  const config = getConfig();
  const calendarId = process.env.GHL_CALENDAR_ID;
  if (!config || !calendarId) throw new Error('GHL calendar not configured (GHL_CALENDAR_ID).');

  const name = input.name.trim();
  const [firstName, ...rest] = name.split(/\s+/);

  const upsert = await ghlFetch<{ contact?: { id: string } }>(config.apiKey, '/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId: config.locationId,
      firstName,
      lastName: rest.join(' '),
      name,
      email: input.email,
      phone: input.phone,
    }),
  });
  const contactId = upsert.contact?.id;
  if (!contactId) throw new Error('GHL upsert returned no contact id.');

  await addTags(config.apiKey, contactId, ['visit-scheduled']);

  await ghlFetch(config.apiKey, '/calendars/events/appointments', {
    method: 'POST',
    body: JSON.stringify({
      calendarId,
      locationId: config.locationId,
      contactId,
      startTime: input.startTime,
      title: `Verification Visit — ${name}`,
      appointmentStatus: 'confirmed',
    }),
  });

  // Move the contact's open opportunity to the site-visit stage. The visit is
  // booked either way, so a failure here only logs.
  const visitStageId = process.env.GHL_VISIT_STAGE_ID;
  if (visitStageId && config.pipelineId) {
    try {
      const search = await ghlFetch<{ opportunities?: Array<{ id: string; status: string }> }>(
        config.apiKey,
        `/opportunities/search?location_id=${config.locationId}&contact_id=${contactId}`
      );
      const open = (search.opportunities ?? []).find((o) => o.status === 'open');
      if (open) {
        await ghlFetch(config.apiKey, `/opportunities/${open.id}`, {
          method: 'PUT',
          body: JSON.stringify({ pipelineId: config.pipelineId, pipelineStageId: visitStageId }),
        });
      }
    } catch (err) {
      console.warn('[THR-GHL] Appointment booked but could not move opportunity stage.', err);
    }
  }
}

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}

/**
 * Pushes a contact-form inquiry into GoHighLevel: upserts the contact with
 * the message stored in the "Message" custom field and opens an unvalued
 * opportunity in the configured pipeline stage. Throws on failure.
 */
export async function syncContactFormLead(input: ContactFormInput): Promise<void> {
  const config = getConfig();
  if (!config) {
    console.warn('[THR-GHL] GHL_API_KEY / GHL_LOCATION_ID not set; skipping CRM sync.');
    return;
  }

  const name = input.name.trim();
  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.join(' ');

  let fieldIds: Record<string, string> = {};
  try {
    fieldIds = await getCustomFieldIds(config.apiKey, config.locationId);
  } catch (err) {
    console.warn('[THR-GHL] Could not load custom field ids; syncing contact without them.', err);
  }

  const fieldValues: Array<[string, string]> = [
    ['contact.message', input.message],
    ['contact.service_requested', input.service],
  ];
  const customFields = fieldValues
    .filter(([key]) => fieldIds[key])
    .map(([key, value]) => ({ id: fieldIds[key], field_value: value }));

  const upsert = await ghlFetch<{ contact?: { id: string } }>(config.apiKey, '/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId: config.locationId,
      firstName,
      lastName,
      name,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      source: 'Website Contact Form',
      customFields,
    }),
  });

  const contactId = upsert.contact?.id;
  if (!contactId) throw new Error('GHL upsert returned no contact id.');

  await addTags(config.apiKey, contactId, ['contact-form']);

  if (config.pipelineId && config.stageId) {
    await ghlFetch(config.apiKey, '/opportunities/', {
      method: 'POST',
      body: JSON.stringify({
        locationId: config.locationId,
        pipelineId: config.pipelineId,
        pipelineStageId: config.stageId,
        contactId,
        name: `Website Inquiry — ${name}`,
        status: 'open',
      }),
    });
  } else {
    console.warn('[THR-GHL] GHL_PIPELINE_ID / GHL_PIPELINE_STAGE_ID not set; contact synced without opportunity.');
  }
}

/**
 * Pushes an estimator lead into GoHighLevel: upserts the contact (deduped by
 * email/phone), fills the estimator custom fields, and opens an opportunity
 * valued at the typical estimate. Throws on failure — callers decide whether
 * that should block the response.
 */
export async function syncLeadToGHL(input: SyncLeadInput): Promise<void> {
  const config = getConfig();
  if (!config) {
    console.warn('[THR-GHL] GHL_API_KEY / GHL_LOCATION_ID not set; skipping CRM sync.');
    return;
  }

  const { lead, customerType, service, projectDetails, estimate } = input;
  const serviceLabel = SERVICE_LABELS[service];
  const [firstName, ...rest] = lead.name.trim().split(/\s+/);
  const lastName = rest.join(' ');

  let fieldIds: Record<string, string> = {};
  try {
    fieldIds = await getCustomFieldIds(config.apiKey, config.locationId);
  } catch (err) {
    console.warn('[THR-GHL] Could not load custom field ids; syncing contact without them.', err);
  }

  const fieldValues: Array<[string, string]> = [
    ['contact.service_requested', serviceLabel],
    ['contact.customer_type', CUSTOMER_TYPE_LABELS[customerType]],
    ['contact.estimate_low', String(estimate.low)],
    ['contact.estimate_typical', String(estimate.typical)],
    ['contact.estimate_premium', String(estimate.premium)],
    ['contact.project_details', summarizeProjectDetails(projectDetails)],
  ];
  const customFields = fieldValues
    .filter(([key]) => fieldIds[key])
    .map(([key, value]) => ({ id: fieldIds[key], field_value: value }));

  const upsert = await ghlFetch<{ contact?: { id: string } }>(config.apiKey, '/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId: config.locationId,
      firstName,
      lastName,
      name: lead.name.trim(),
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      source: 'Website Estimator',
      customFields,
    }),
  });

  const contactId = upsert.contact?.id;
  if (!contactId) throw new Error('GHL upsert returned no contact id.');

  await addTags(config.apiKey, contactId, ['estimator-lead', service.replace(/_/g, '-')]);

  if (config.pipelineId && config.stageId) {
    await ghlFetch(config.apiKey, '/opportunities/', {
      method: 'POST',
      body: JSON.stringify({
        locationId: config.locationId,
        pipelineId: config.pipelineId,
        pipelineStageId: config.stageId,
        contactId,
        name: `${serviceLabel} — ${lead.name.trim()}`,
        status: 'open',
        monetaryValue: estimate.typical,
      }),
    });
  } else {
    console.warn('[THR-GHL] GHL_PIPELINE_ID / GHL_PIPELINE_STAGE_ID not set; contact synced without opportunity.');
  }
}
