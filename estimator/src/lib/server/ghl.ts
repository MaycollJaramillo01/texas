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

function summarizeProjectDetails(details: Record<string, unknown>): string {
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');
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
      tags: ['contact-form'],
      customFields,
    }),
  });

  const contactId = upsert.contact?.id;
  if (!contactId) throw new Error('GHL upsert returned no contact id.');

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
      tags: ['estimator-lead', service.replace(/_/g, '-')],
      customFields,
    }),
  });

  const contactId = upsert.contact?.id;
  if (!contactId) throw new Error('GHL upsert returned no contact id.');

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
