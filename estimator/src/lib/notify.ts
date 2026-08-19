import type { CustomerType, EstimateRange, ServiceType, WizardData } from '@/types/estimate';

/**
 * Emails the owner a new estimator lead.
 *
 * Runs in the browser on purpose: Web3Forms' free plan rejects server-side
 * calls with 403 ("Use our API in client side... Pro plan is required"), so the
 * API route cannot do this. The site's original estimator notified the same way
 * before the standalone rewrite dropped it.
 */
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
// Delivery inbox is the one the key was registered to: Esdras@texashighrefinished.com.
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

const SERVICE_LABELS: Record<ServiceType, string> = {
  interior_painting: 'Interior Painting',
  exterior_painting: 'Exterior Painting',
  cabinet_refinishing: 'Cabinet Refinishing',
  drywall: 'Drywall',
  drywall_repair: 'Drywall Repair',
  lvp_flooring: 'Luxury Vinyl Plank (LVP)',
  tile: 'Tile Installation',
  stain_clear: 'Stain & Clear',
};

const CUSTOMER_LABELS: Record<CustomerType, string> = {
  homeowner: 'Homeowner',
  builder: 'Builder / Contractor',
  property_manager: 'Property Manager',
};

function usd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export interface EstimateNotification {
  lead: WizardData['lead'];
  customerType: CustomerType;
  service: ServiceType;
  projectDetails: Record<string, unknown>;
  estimate: EstimateRange;
}

/** Throws on failure so the caller can log it without blocking the visitor. */
export async function sendEstimateLeadEmail(input: EstimateNotification): Promise<void> {
  if (!WEB3FORMS_ACCESS_KEY) throw new Error('NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not set.');
  const { lead, customerType, service, projectDetails, estimate } = input;
  const serviceLabel = SERVICE_LABELS[service] ?? service;
  const customerLabel = CUSTOMER_LABELS[customerType] ?? customerType;

  const message = [
    'New estimator lead from texashighrefinished.com',
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `City: ${lead.city}`,
    '',
    `Customer type: ${customerLabel}`,
    `Service: ${serviceLabel}`,
    '',
    `Low range: ${usd(estimate.low)}`,
    `Typical project: ${usd(estimate.typical)}`,
    `Premium range: ${usd(estimate.premium)}`,
    `Inspection recommended: ${estimate.inspectionRecommended ? 'Yes' : 'No'}`,
    '',
    'Project details:',
    JSON.stringify(projectDetails, null, 2),
  ].join('\n');

  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New estimator lead - ${serviceLabel} - ${lead.city}`,
      from_name: `${lead.name} - THR Estimator`,
      replyto: lead.email,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      service: serviceLabel,
      customer_type: customerLabel,
      estimate_low: usd(estimate.low),
      estimate_typical: usd(estimate.typical),
      estimate_premium: usd(estimate.premium),
      message,
    }),
  });

  const result = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
  if (!res.ok || !result.success) {
    throw new Error(result.message || `Web3Forms rejected the notification (${res.status}).`);
  }
}
