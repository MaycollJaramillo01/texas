import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFreeSlots, bookVerificationVisit } from '@/lib/server/ghl';

const BookSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/),
  city: z.string().trim().max(100).optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const { timezone, slots } = await getFreeSlots(14);
    return NextResponse.json(
      { success: true, timezone, slots },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[THR-SLOTS-ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Could not load available times. Please call us to schedule.' },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const parsed = BookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Please review all fields.' },
        { status: 400 }
      );
    }

    await bookVerificationVisit(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[THR-BOOKING-ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'That time may no longer be available. Please pick another slot.' },
      { status: 502 }
    );
  }
}
