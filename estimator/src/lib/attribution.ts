import { z } from 'zod';

/**
 * The ad click that paid for the visit. The main site captures it on landing
 * and hands it over on the link into this app (see `adParams` in its
 * src/data/company.js) — this app runs on its own domain, so by the time a
 * lead is created the original URL is long gone.
 *
 * It travels into GoHighLevel as the contact's source and tags, which is what
 * lets the CRM answer "which of these leads came from Google Ads?".
 */
export const AttributionSchema = z
  .object({
    gclid: z.string().max(200).optional(),
    gbraid: z.string().max(200).optional(),
    wbraid: z.string().max(200).optional(),
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_term: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
  })
  .optional();

export type Attribution = NonNullable<z.infer<typeof AttributionSchema>>;

const KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

/** Pulls the handed-over tags out of this page's query string. */
export function attributionFrom(
  params: Record<string, string | string[] | undefined>
): Attribution {
  const found: Attribution = {};
  for (const key of KEYS) {
    const value = params[key];
    if (typeof value === 'string' && value) found[key] = value.slice(0, 200);
  }
  return found;
}

/** Only Google Ads ever sets these three, so their presence means a paid click. */
export function isPaidClick(a?: Attribution): boolean {
  return Boolean(a?.gclid || a?.gbraid || a?.wbraid);
}

/** CRM source line, e.g. "Website Estimator · google / cpc · spring-cabinets". */
export function sourceLabel(base: string, a?: Attribution): string {
  const channel = a?.utm_source
    ? [a.utm_source, a.utm_medium].filter(Boolean).join(' / ')
    : isPaidClick(a)
      ? 'Google Ads'
      : '';
  return [base, channel, a?.utm_campaign].filter(Boolean).join(' · ');
}

/** Extra CRM tags — one filterable tag is what the client actually reports on. */
export function attributionTags(a?: Attribution): string[] {
  return isPaidClick(a) ? ['google-ads'] : [];
}
