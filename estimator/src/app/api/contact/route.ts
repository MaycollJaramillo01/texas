import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncContactFormLead } from '@/lib/server/ghl';

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().default(''),
  service: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(2).max(5000),
  botcheck: z.string().optional().default(''),
});

const DEFAULT_ALLOWED_ORIGINS = [
  'https://texashighrefinished.com',
  'https://www.texashighrefinished.com',
];

function corsHeaders(origin: string): Record<string, string> {
  const allowed = (process.env.CONTACT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const list = allowed.length > 0 ? allowed : DEFAULT_ALLOWED_ORIGINS;
  const isAllowed = list.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    ...(isAllowed ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin') ?? '') });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const headers = corsHeaders(req.headers.get('origin') ?? '');
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400, headers });
    }

    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Please review all fields.' },
        { status: 400, headers }
      );
    }

    // Honeypot tripped: pretend success so bots don't learn, and skip the CRM.
    if (parsed.data.botcheck) {
      return NextResponse.json({ success: true }, { headers });
    }

    console.info(
      '[THR-CONTACT]',
      JSON.stringify({ ...parsed.data, botcheck: undefined, timestamp: new Date().toISOString() })
    );

    await syncContactFormLead(parsed.data);

    return NextResponse.json({ success: true }, { headers });
  } catch (err) {
    console.error('[THR-CONTACT-ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 502, headers }
    );
  }
}
